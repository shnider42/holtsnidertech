from copy import deepcopy
from html.parser import HTMLParser
import json
from xml.etree import ElementTree

import pytest

from app import create_app
from app import routes
from app.project_catalog import FALLBACK_PATH


FEATURED_PROJECT_IDS = ["irish-today", "infierno", "gridiron", "further-in"]


@pytest.fixture(autouse=True)
def catalogue(monkeypatch):
    """Exercise real rendering against the checked-in source, without a network race."""
    projects = json.loads(FALLBACK_PATH.read_text())
    monkeypatch.setattr(routes, "get_projects", lambda: deepcopy(projects))
    return projects


class ProjectDocument(HTMLParser):
    """Read rendered cards separately from the full embedded JSON catalogue."""

    def __init__(self, response):
        super().__init__()
        self.cards = []
        self.links = []
        self.elements = {}
        self._card = None
        self._root_tag = None
        self.feed(response.get_data(as_text=True))

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        if attributes.get("id"):
            self.elements[attributes["id"]] = attributes
        if tag == "a" and "href" in attributes:
            self.links.append(attributes["href"])
        if self._card is None and tag in {"a", "article"} and attributes.get("data-project"):
            self._card = {"id": attributes["data-project"], "links": [], "text": "", "images": []}
            self._root_tag = tag
        if self._card is not None:
            if tag == "a" and "href" in attributes:
                self._card["links"].append(attributes["href"])
            if tag == "img" and "src" in attributes:
                self._card["images"].append(attributes["src"])

    def handle_data(self, text):
        if self._card is not None:
            self._card["text"] += text

    def handle_endtag(self, tag):
        if self._card is not None and tag == self._root_tag:
            self.cards.append(self._card)
            self._card = None
            self._root_tag = None


def make_test_app():
    app = create_app()
    app.testing = True
    return app


def test_homepage_renders_canonical_boston_practical_site():
    app = make_test_app()

    with app.test_client() as client:
        response = client.get("/")

    assert response.status_code == 200
    assert b"Holtsnider Tech" in response.data
    assert b"Where should we start?" in response.data or b"What are you looking for?" in response.data


def test_homepage_uses_current_boston_and_clarity_assets():
    app = make_test_app()

    with app.test_client() as client:
        response = client.get("/")

    assert response.status_code == 200
    assert b"js/boston-site.js" in response.data
    assert b"js/boston-nav-cleanup.js" in response.data
    assert b"js/site-flow-clarity.js" in response.data
    assert b"css/site-flow-clarity.css" in response.data
    assert b"js/site.js" not in response.data


def test_homepage_has_clear_public_metadata():
    app = make_test_app()

    with app.test_client() as client:
        response = client.get("/")

    assert response.status_code == 200
    assert b"Technical Problem Solving" in response.data
    assert b"Project Building" in response.data
    assert b"https://holtsnidertech.com/" in response.data
    assert b'property="og:title"' in response.data
    assert b'name="twitter:card"' in response.data


def test_homepage_features_four_canonical_projects_and_links_to_the_collection(catalogue):
    app = make_test_app()
    with app.test_client() as client:
        response = client.get("/")
    document = ProjectDocument(response)
    by_id = {project["id"]: project for project in catalogue}

    assert [card["id"] for card in document.cards] == FEATURED_PROJECT_IDS
    for card in document.cards:
        project = by_id[card["id"]]
        assert project["title"] in card["text"]
        assert project["description"] in card["text"]
        assert card["links"] == [project["url"]]
    assert "/projects" in document.links
    assert "/static/demos/grepper.html" in document.links
    assert f"Browse all {len(catalogue)} projects" in response.get_data(as_text=True)


def test_projects_page_renders_the_complete_collection_without_javascript(catalogue):
    app = make_test_app()
    with app.test_client() as client:
        response = client.get("/projects")
    assert response.status_code == 200
    document = ProjectDocument(response)
    by_id = {project["id"]: project for project in catalogue}

    assert {card["id"] for card in document.cards} == set(by_id)
    assert len(document.cards) == len(catalogue)
    for card in document.cards:
        project = by_id[card["id"]]
        assert project["title"] in card["text"]
        assert project["description"] in card["text"]
        assert set(card["links"]) == {project["url"]}
        assert card["images"]
    assert 'rel="canonical" href="https://holtsnidertech.com/projects"' in response.get_data(as_text=True)
    assert document.elements["project-search"]["name"] == "q"
    assert document.elements["project-sort"]["name"] == "sort"


def test_projects_api_preserves_source_metadata_and_serves_usable_covers(catalogue):
    app = make_test_app()
    with app.test_client() as client:
        response = client.get("/api/projects")
        assert response.status_code == 200
        assert response.mimetype == "application/json"
        payload = response.get_json()
        assert payload["total"] == len(catalogue)
        assert {project["id"] for project in payload["projects"]} == {project["id"] for project in catalogue}
        by_id = {project["id"]: project for project in catalogue}
        for project in payload["projects"]:
            for field in ("title", "description", "url", "type", "createdAt", "datePrecision"):
                assert project[field] == by_id[project["id"]][field]
        for artwork in {project["art_url"] for project in payload["projects"]}:
            cover = client.get(artwork)
            assert cover.status_code == 200, artwork
            assert cover.mimetype == "image/svg+xml"


def test_unbundled_featured_art_uses_the_same_local_cover_on_both_pages(catalogue):
    project = next(project for project in catalogue if project["id"] == "irish-today")
    project["art"] = "future-catalogue-cover"
    app = make_test_app()
    with app.test_client() as client:
        home = ProjectDocument(client.get("/"))
        directory = ProjectDocument(client.get("/projects"))
        payload = client.get("/api/projects").get_json()
    canonical = next(item for item in payload["projects"] if item["id"] == "irish-today")
    assert canonical["art_url"] == "/static/img/projects/dayboard.svg"
    for document in (home, directory):
        card = next(card for card in document.cards if card["id"] == "irish-today")
        assert card["images"] == [canonical["art_url"]]


@pytest.mark.parametrize("project_type", ["games", "tools", "catch-up", "stories"])
def test_category_filters_render_the_requested_projects_without_javascript(catalogue, project_type):
    app = make_test_app()
    with app.test_client() as client:
        response = client.get("/projects", query_string={"type": project_type})
    assert response.status_code == 200
    document = ProjectDocument(response)
    assert {card["id"] for card in document.cards} == {
        project["id"] for project in catalogue if project["type"] == project_type
    }


@pytest.mark.parametrize("query,expected_id", [("Backrooms", "further-in"), ("Your Passage", "mypassages"), ("Dórtmund", "soccer")])
def test_search_finds_aliases_and_normalizes_accents_without_javascript(query, expected_id):
    app = make_test_app()
    with app.test_client() as client:
        response = client.get("/projects", query_string={"q": query})
    assert response.status_code == 200
    document = ProjectDocument(response)
    assert [card["id"] for card in document.cards] == [expected_id]
    assert document.elements["project-search"]["value"] == query


def test_game_kind_and_query_filters_work_together_without_javascript():
    app = make_test_app()
    with app.test_client() as client:
        response = client.get("/projects", query_string={"type": "games", "kind": "Sports", "q": "Pocket"})
    document = ProjectDocument(response)
    assert {card["id"] for card in document.cards} == {"gridiron", "hockey", "soccer"}


@pytest.mark.parametrize("sort", ["newest", "oldest", "name"])
def test_project_sorting_orders_rendered_results(catalogue, sort):
    app = make_test_app()
    with app.test_client() as client:
        response = client.get("/projects", query_string={"sort": sort})
    document = ProjectDocument(response)
    by_id = {project["id"]: project for project in catalogue}
    ordered = [by_id[card["id"]] for card in document.cards]
    if sort == "name":
        names = [project["title"].casefold() for project in ordered]
        assert names == sorted(names)
    else:
        known = [project for project in ordered if project["datePrecision"] != "unknown"]
        dates = [project["createdAt"] for project in known]
        assert dates == sorted(dates, reverse=sort == "newest")
        assert ordered[:len(known)] == known


def test_empty_search_has_a_recovery_link_and_invalid_filters_fall_back(catalogue):
    app = make_test_app()
    with app.test_client() as client:
        empty_response = client.get("/projects", query_string={"q": "no-such-project-8439"})
        invalid_response = client.get("/projects", query_string={"type": "invalid", "sort": "invalid"})
    empty = ProjectDocument(empty_response)
    assert empty.cards == []
    assert "hidden" not in empty.elements["project-empty"]
    assert empty.elements["reset-projects"]["href"] == "/projects#collection"
    assert len(ProjectDocument(invalid_response).cards) == len(catalogue)


def test_clarity_assets_are_served():
    app = make_test_app()

    with app.test_client() as client:
        script = client.get("/static/js/site-flow-clarity.js")
        stylesheet = client.get("/static/css/site-flow-clarity.css")

    assert script.status_code == 200
    assert stylesheet.status_code == 200
    assert b"Fix a Problem" in script.data
    assert b"bos-default-context" in stylesheet.data


def test_public_local_demos_are_served():
    app = make_test_app()
    demo_paths = [
        "/static/demos/grepper.html",
        "/static/demos/loudsource-vote.html",
        "/static/demos/jiporady.html",
    ]

    with app.test_client() as client:
        responses = [client.get(path) for path in demo_paths]

    assert all(response.status_code == 200 for response in responses)


def test_legacy_style_lab_redirects_home():
    app = make_test_app()

    with app.test_client() as client:
        response = client.get("/style-lab")
        variant_response = client.get("/style-lab/workshop")

    assert response.status_code == 302
    assert response.headers["Location"].endswith("/")
    assert variant_response.status_code == 302
    assert variant_response.headers["Location"].endswith("/")


def test_sitemap_tracks_public_local_demos():
    app = make_test_app()

    with app.test_client() as client:
        response = client.get("/sitemap.xml")

    assert response.status_code == 200
    assert response.mimetype == "application/xml"
    assert b"/static/demos/grepper.html" in response.data
    assert b"/static/demos/loudsource-vote.html" in response.data
    assert b"/static/demos/jiporady.html" in response.data
    document = ElementTree.fromstring(response.data)
    locations = {node.text for node in document.findall("{*}url/{*}loc")}
    assert "https://holtsnidertech.com/projects" in locations
    assert "https://holtsnidertech.com/api/projects" not in locations


def test_robots_points_to_public_sitemap():
    app = make_test_app()

    with app.test_client() as client:
        response = client.get("/robots.txt")

    assert response.status_code == 200
    assert response.mimetype == "text/plain"
    assert b"Allow: /" in response.data
    assert b"https://holtsnidertech.com/sitemap.xml" in response.data


def test_healthz_reports_ok():
    app = make_test_app()

    with app.test_client() as client:
        response = client.get("/healthz")

    assert response.status_code == 200
    assert response.get_json() == {"status": "ok", "service": "holtsnidertech"}
