"""Offline checks for catalog availability, refreshes, and invalid upstream data."""

from copy import deepcopy
import io
import json
from unittest.mock import Mock

import pytest

from app import project_catalog as catalog


@pytest.fixture
def projects():
    return json.loads(catalog.FALLBACK_PATH.read_text())


@pytest.fixture
def deferred_threads(monkeypatch):
    """Control background work without network calls, sleeps, or timing races."""
    pending = []

    class DeferredThread:
        def __init__(self, *, target, name, daemon):
            self.target = target

        def start(self):
            pending.append(self.target)

    monkeypatch.setattr(catalog, "Thread", DeferredThread)
    return pending


def new_project(projects):
    project = deepcopy(projects[0])
    project.update(id="new-project", title="A new project", art="new-scene",
                   url="https://new-project.onrender.com/play/?mode=solo")
    return project


def test_first_request_is_immediate_and_new_projects_appear_after_refresh(projects, deferred_threads):
    clock = [0]
    remote = projects + [new_project(projects)]
    loader = Mock(return_value=remote)
    cache = catalog._CatalogCache(loader=loader, clock=lambda: clock[0])

    assert cache.get_projects() == projects
    loader.assert_not_called()  # The request scheduled work; it did not fetch.
    assert cache.get_projects() == projects
    assert len(deferred_threads) == 1  # Concurrent requests share one refresh.

    deferred_threads.pop()()
    assert cache.get_projects() == remote
    assert deferred_threads == []
    clock[0] = catalog.SUCCESS_TTL - 1
    assert cache.get_projects() == remote
    assert deferred_threads == []
    clock[0] += 1
    assert cache.get_projects() == remote
    assert len(deferred_threads) == 1


def test_timeout_retains_last_valid_remote_catalog_and_backs_off(projects, deferred_threads):
    clock = [0]
    remote = projects + [new_project(projects)]
    loader = Mock(return_value=remote)
    cache = catalog._CatalogCache(loader=loader, clock=lambda: clock[0])
    cache.get_projects()
    deferred_threads.pop()()
    assert cache.get_projects() == remote

    loader.side_effect = TimeoutError("Upstream temporarily unavailable")
    clock[0] = catalog.SUCCESS_TTL
    assert cache.get_projects() == remote
    deferred_threads.pop()()
    assert cache.get_projects() == remote
    assert deferred_threads == []
    clock[0] += catalog.FAILURE_BACKOFF - 1
    cache.get_projects()
    assert deferred_threads == []
    clock[0] += 1
    cache.get_projects()
    assert len(deferred_threads) == 1

    loader.side_effect = None
    loader.return_value = projects
    deferred_threads.pop()()
    assert cache.get_projects() == projects


@pytest.mark.parametrize("field,value", [
    ("id", "bad/id"),
    ("type", "unknown-category"),
    ("art", '<script>alert(1)</script>'),
    ("url", "javascript:alert(1)"),
    ("url", "http://example.com/"),
    ("url", "https://user:password@example.com/"),
    ("url", "https://example.com\\@other.example/"),
    ("sourceUrl", "//example.com/source"),
    ("createdAt", "2026-02-30"),
    ("datePrecision", "approximate"),
    ("title", "x" * 161),
    ("description", "x" * 1001),
    ("tags", ["tag"] * 25),
    ("aliases", ["x" * 161]),
])
def test_invalid_remote_record_rejects_entire_update(projects, deferred_threads, field, value):
    remote = deepcopy(projects)
    remote[0][field] = value
    cache = catalog._CatalogCache(loader=lambda: remote, clock=lambda: 0)
    cache.get_projects()
    deferred_threads.pop()()
    assert cache.get_projects() == projects
    assert deferred_threads == []


@pytest.mark.parametrize("document", [[], {}, [None], ["project"]])
def test_invalid_document_shape_is_rejected(document):
    with pytest.raises(catalog.CatalogValidationError):
        catalog.validate_projects(document)


def test_duplicate_ids_and_oversized_lists_are_rejected(projects):
    with pytest.raises(catalog.CatalogValidationError, match="Duplicate"):
        catalog.validate_projects(projects + [projects[0]])
    with pytest.raises(catalog.CatalogValidationError, match="size"):
        catalog.validate_projects([projects[0]] * (catalog.MAX_PROJECTS + 1))


def test_unknown_dates_and_new_artwork_keys_are_allowed(projects):
    project = new_project(projects)
    project.update(datePrecision="unknown", createdAt=None)
    assert catalog.validate_projects([project])[0] == project
    project["createdAt"] = "2026-11-09"
    with pytest.raises(catalog.CatalogValidationError):
        catalog.validate_projects([project])


def test_source_only_record_refreshes_and_featured_link_uses_its_source(projects, deferred_threads):
    remote = deepcopy(projects)
    source_record = next(project for project in remote if project["id"] == "gridiron")
    source_record.update(url=None, linkKind="source")
    cache = catalog._CatalogCache(loader=lambda: remote, clock=lambda: 0)
    cache.get_projects()
    deferred_threads.pop()()

    refreshed = cache.get_projects()
    normalized = next(project for project in refreshed if project["id"] == "gridiron")
    assert len(refreshed) == len(remote)
    assert normalized["url"] == source_record["sourceUrl"]
    assert normalized["linkKind"] == "source"
    featured = next(project for project in catalog.get_featured_projects(refreshed) if project["id"] == "gridiron")
    assert featured["url"] == source_record["sourceUrl"]
    assert featured["linkKind"] == "source"


@pytest.mark.parametrize("source_value", [None, ""])
def test_app_with_no_source_url_keeps_its_launch_destination(projects, source_value):
    project = deepcopy(projects[0])
    project["sourceUrl"] = source_value
    normalized = catalog.validate_projects([project])[0]
    assert normalized["url"] == project["url"]
    assert normalized["sourceUrl"] is None
    assert normalized["linkKind"] == "app"
    del project["sourceUrl"]
    assert catalog.validate_projects([project])[0] == normalized


@pytest.mark.parametrize("launch,source", [(None, None), ("", ""), (None, "http://example.com/source")])
def test_project_without_any_valid_https_destination_is_rejected(projects, launch, source):
    project = deepcopy(projects[0])
    project.update(url=launch, sourceUrl=source)
    with pytest.raises(catalog.CatalogValidationError):
        catalog.validate_projects([project])


@pytest.mark.parametrize("payload", [b"not json", b"[\xff]", b" " * (catalog.MAX_BYTES + 1)])
def test_bad_or_oversized_payload_is_rejected(payload):
    with pytest.raises(catalog.CatalogValidationError):
        catalog._decode_projects(payload)


def test_request_uses_fixed_source_timeout_and_bounded_read(projects, monkeypatch):
    payload = json.dumps(projects).encode()
    response = io.BytesIO(payload)
    response.headers = {"Content-Length": str(len(payload))}
    response.read = Mock(wraps=response.read)
    opener = Mock()
    opener.open.return_value = response
    monkeypatch.setattr(catalog, "_OPENER", opener)

    assert catalog._load_remote() == projects
    args, kwargs = opener.open.call_args
    assert args[0].full_url == "https://dfe-directory.onrender.com/projects.json"
    assert kwargs["timeout"] == catalog.REQUEST_TIMEOUT
    response.read.assert_called_once_with(catalog.MAX_BYTES + 1)


@pytest.mark.parametrize("headers", [
    {"Content-Length": str(catalog.MAX_BYTES + 1)},
    {"Content-Length": "not-a-length"},
    {},
])
def test_oversized_response_is_rejected_even_without_length_header(headers, monkeypatch):
    response = io.BytesIO(b" " * (catalog.MAX_BYTES + 1))
    response.headers = headers
    opener = Mock()
    opener.open.return_value = response
    monkeypatch.setattr(catalog, "_OPENER", opener)
    with pytest.raises(catalog.CatalogValidationError):
        catalog._load_remote()


def test_callers_cannot_mutate_cached_records_or_nested_lists(projects, deferred_threads):
    cache = catalog._CatalogCache(loader=lambda: projects, clock=lambda: 0)
    returned = cache.get_projects()
    returned[0]["title"] = "Edited by caller"
    returned[0]["tags"].append("Caller tag")
    returned.pop()
    assert cache.get_projects() == projects


def test_featured_context_keeps_canonical_metadata_and_does_not_change_catalog(projects):
    before = deepcopy(projects)
    featured = catalog.get_featured_projects(projects)
    assert [project["id"] for project in featured] == ["irish-today", "infierno", "gridiron", "further-in"]
    by_id = {project["id"]: project for project in projects}
    for project in featured:
        assert project["focus"] and project["context"]
        assert {key: value for key, value in project.items() if key not in {"focus", "context"}} == by_id[project["id"]]
    featured[0]["tags"].append("Caller tag")
    assert projects == before
    assert catalog.get_featured_projects([projects[0]]) == []


def test_public_api_uses_the_shared_cache(projects, deferred_threads, monkeypatch):
    cache = catalog._CatalogCache(loader=lambda: projects, clock=lambda: 0)
    monkeypatch.setattr(catalog, "_catalog", cache)
    assert catalog.get_projects() == projects
    assert len(catalog.get_featured_projects()) == 4
    assert len(deferred_threads) == 1
