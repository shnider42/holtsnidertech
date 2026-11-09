"""Serve one shared DFE catalog without putting network work on page requests.

The checked-in snapshot is available immediately. A daemon thread periodically
refreshes from the directory's fixed public endpoint; invalid or unavailable
responses never replace the last valid catalog. Each Gunicorn worker has its own
small cache, and callers receive copies so editorial changes cannot mutate it.
"""

from copy import deepcopy
from datetime import date
import json
import logging
from pathlib import Path
import re
from threading import Lock, Thread
import time
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


CATALOG_URL = "https://dfe-directory.onrender.com/projects.json"
FALLBACK_PATH = Path(__file__).parent / "static" / "data" / "dfe-projects.json"
MAX_BYTES = 512 * 1024
MAX_PROJECTS = 512
REQUEST_TIMEOUT = 3
SUCCESS_TTL = 15 * 60
FAILURE_BACKOFF = 60
MAX_FAILURE_BACKOFF = 5 * 60
_SAFE_KEY = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
_TYPES = {"games", "catch-up", "tools", "stories"}
_LOG = logging.getLogger(__name__)

_FEATURED = (
    ("irish-today", "Information publishing",
     "A recurring publication brings sources, changing content, and a readable daily experience together."),
    ("infierno", "Evidence and source handling",
     "Reports and supporting evidence become a collection that people can search and understand."),
    ("gridiron", "Usability and iteration",
     "Play selection, touch controls, and on-field feedback make complex interactions easier to follow."),
    ("further-in", "Atmosphere and pacing",
     "Environmental cues, sound, and pacing shape an experience without explaining every step."),
)


class CatalogValidationError(ValueError):
    """The remote document cannot safely replace the current catalog."""


def _text(value, field, limit, *, optional=False):
    if not isinstance(value, str) or len(value) > limit:
        raise CatalogValidationError(f"Invalid {field}.")
    value = value.strip()
    if (not value and not optional) or any(ord(c) < 32 for c in value):
        raise CatalogValidationError(f"Invalid {field}.")
    return value


def _key(value, field):
    value = _text(value, field, 80)
    if not _SAFE_KEY.fullmatch(value):
        raise CatalogValidationError(f"Invalid {field}.")
    return value


def _https_url(value, field):
    value = _text(value, field, 2048)
    try:
        parsed = urlsplit(value)
        if (parsed.scheme != "https" or not parsed.hostname
                or parsed.username is not None or parsed.password is not None
                or parsed.port not in (None, 443)
                or any(c.isspace() for c in value) or "\\" in value):
            raise ValueError("Not an HTTPS destination.")
    except ValueError as exc:
        raise CatalogValidationError(f"Invalid {field}.") from exc
    return value


def _optional_url(value, field):
    if value is None or value == "":
        return None
    return _https_url(value, field)


def _strings(value, field, max_items, max_length):
    if not isinstance(value, list) or len(value) > max_items:
        raise CatalogValidationError(f"Invalid {field}.")
    return [_text(item, field, max_length) for item in value]


def validate_projects(document):
    """Validate the complete document and retain only supported catalog fields."""
    if not isinstance(document, list) or not 1 <= len(document) <= MAX_PROJECTS:
        raise CatalogValidationError("Invalid catalog size.")
    projects, seen = [], set()
    for entry in document:
        if not isinstance(entry, dict):
            raise CatalogValidationError("Invalid project record.")
        project_id = _key(entry.get("id"), "id")
        if project_id in seen:
            raise CatalogValidationError("Duplicate project id.")
        seen.add(project_id)
        project_type = _text(entry.get("type"), "type", 20)
        link_kind = _text(entry.get("linkKind", "app"), "linkKind", 20)
        precision = _text(entry.get("datePrecision"), "datePrecision", 10)
        if (project_type not in _TYPES or link_kind not in {"app", "preview", "source"}
                or precision not in {"day", "month", "unknown"}):
            raise CatalogValidationError("Invalid project category or date precision.")
        # The directory permits source-only records and apps without a source
        # link. Give templates one valid launch URL while retaining linkKind.
        source_url = _optional_url(entry.get("sourceUrl"), "sourceUrl")
        launch_url = _optional_url(entry.get("url"), "url") or source_url
        if launch_url is None:
            raise CatalogValidationError("A project has no HTTPS destination.")
        created = entry.get("createdAt")
        if precision == "unknown":
            if created is not None:
                raise CatalogValidationError("Unknown dates must be null.")
        else:
            created = _text(created, "createdAt", 10)
            try:
                parsed_date = date.fromisoformat(created)
                if parsed_date.isoformat() != created or (precision == "month" and parsed_date.day != 1):
                    raise ValueError("Invalid date anchor.")
            except ValueError as exc:
                raise CatalogValidationError("Invalid project date.") from exc
        projects.append({
            "id": project_id,
            "title": _text(entry.get("title"), "title", 160),
            "subtitle": _text(entry.get("subtitle", ""), "subtitle", 240, optional=True),
            "description": _text(entry.get("description"), "description", 1000),
            "type": project_type,
            "subtype": _text(entry.get("subtype", ""), "subtype", 100, optional=True),
            "tags": _strings(entry.get("tags", []), "tags", 24, 100),
            "art": _key(entry.get("art"), "art"),
            "url": launch_url,
            "linkKind": link_kind,
            "sourceUrl": source_url,
            "createdAt": created,
            "datePrecision": precision,
            "dateSource": _text(entry.get("dateSource", ""), "dateSource", 600, optional=True),
            "aliases": _strings(entry.get("aliases", []), "aliases", 32, 160),
        })
    return projects


def _decode_projects(payload):
    if len(payload) > MAX_BYTES:
        raise CatalogValidationError("The catalog response is too large.")
    try:
        document = json.loads(payload.decode("utf-8"))
    except (ValueError, UnicodeError, RecursionError) as exc:
        raise CatalogValidationError("The catalog response is not valid JSON.") from exc
    return validate_projects(document)


class _NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


_OPENER = build_opener(_NoRedirect())


def _load_remote():
    # Neither this URL nor redirects can be supplied by a visitor.
    request = Request(CATALOG_URL, headers={
        "Accept": "application/json",
        "User-Agent": "HoltsniderTech/1.0 (project catalog)",
    })
    with _OPENER.open(request, timeout=REQUEST_TIMEOUT) as response:
        content_length = response.headers.get("Content-Length")
        if content_length is not None:
            try:
                if not 0 <= int(content_length) <= MAX_BYTES:
                    raise ValueError("Out of bounds.")
            except ValueError as exc:
                raise CatalogValidationError("Invalid catalog response length.") from exc
        return _decode_projects(response.read(MAX_BYTES + 1))


class _CatalogCache:
    def __init__(self, fallback_path=FALLBACK_PATH, *, loader=None, clock=None):
        self._projects = _decode_projects(Path(fallback_path).read_bytes())
        self._loader = loader or _load_remote
        self._clock = clock or time.monotonic
        self._lock = Lock()
        self._refreshing = False
        self._next_refresh = 0
        self._failures = 0

    def get_projects(self):
        with self._lock:
            projects = deepcopy(self._projects)
            refresh = not self._refreshing and self._clock() >= self._next_refresh
            if refresh:
                self._refreshing = True
        if refresh:
            try:
                Thread(target=self._refresh, name="dfe-catalog-refresh", daemon=True).start()
            except RuntimeError:
                with self._lock:
                    self._refreshing = False
                    self._next_refresh = self._clock() + FAILURE_BACKOFF
                _LOG.warning("Could not start DFE catalog refresh; serving the cached catalog.")
        return projects

    def _refresh(self):
        try:
            # Validate here as well so a loader cannot partially update the cache.
            projects = validate_projects(self._loader())
        except Exception as exc:
            with self._lock:
                self._failures = min(self._failures + 1, 4)
                backoff = min(FAILURE_BACKOFF * 2 ** (self._failures - 1), MAX_FAILURE_BACKOFF)
                self._next_refresh = self._clock() + backoff
                self._refreshing = False
            _LOG.warning("DFE catalog refresh failed (%s); serving the cached catalog.", type(exc).__name__)
        else:
            with self._lock:
                self._projects = projects
                self._failures = 0
                self._next_refresh = self._clock() + SUCCESS_TTL
                self._refreshing = False


_catalog = _CatalogCache()


def get_projects():
    """Return a valid catalog immediately, starting a background refresh if due."""
    return _catalog.get_projects()


def get_featured_projects(projects=None):
    """Add portfolio context without changing canonical titles or destinations."""
    by_id = {project["id"]: project for project in (get_projects() if projects is None else projects)}
    return [dict(deepcopy(by_id[project_id]), focus=focus, context=context)
            for project_id, focus, context in _FEATURED if project_id in by_id]
