"""Local, shared catalogue for the homepage, gallery, and optional guided UI."""
import json
from functools import lru_cache
from pathlib import Path
from urllib.parse import urlsplit


@lru_cache(maxsize=1)
def load_projects():
    path = Path(__file__).parent / "static" / "data" / "project-catalogue.json"
    projects = json.loads(path.read_text(encoding="utf-8"))
    seen = set()
    for project in projects:
        key = project["theme"]
        if key in seen:
            raise ValueError(f"Duplicate showcase project: {key}")
        seen.add(key)
        href = project.get("href", "")
        if href and not ((href.startswith("/") and not href.startswith("//")) or href.startswith("#") or (urlsplit(href).scheme == "https" and urlsplit(href).hostname)):
            raise ValueError(f"Unsupported showcase destination: {key}")
    return tuple(projects)


def selected_projects():
    by_key = {project["theme"]: project for project in load_projects()}
    return tuple(by_key[key] for key in ("galaxy-granite", "garage", "grepper"))
