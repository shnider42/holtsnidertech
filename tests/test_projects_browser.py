"""Visitor regressions for the native project collection; run in browser CI."""

import json
import re
from urllib.parse import parse_qs, urlsplit

import pytest
from playwright.sync_api import expect, sync_playwright

# Reuse the application's existing server lifecycle without collecting its tests.
from test_homepage_browser import live_site  # noqa: F401


@pytest.fixture(scope="module")
def projects_browser(live_site):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        yield browser
        browser.close()


@pytest.fixture(params=[(1440, 1000), (428, 926)], ids=["desktop", "iphone-14-plus-size"])
def project_viewport(request):
    width, height = request.param
    return {"width": width, "height": height}


@pytest.fixture
def projects_page(projects_browser, live_site, project_viewport):
    context = projects_browser.new_context(
        viewport=project_viewport, reduced_motion="reduce",
        is_mobile=project_viewport["width"] < 500,
        has_touch=project_viewport["width"] < 500,
    )
    # This suite never needs to navigate to a game or any other external service.
    context.route(re.compile(r"^https://"), lambda route: route.abort())
    browser_page = context.new_page()
    browser_page.goto(live_site + "/projects", wait_until="networkidle")
    expect(browser_page.locator("[data-js-tools]")).to_be_visible()
    yield browser_page
    context.close()


def visible_cards(page):
    # Count actual displayed results, excluding featured cards and hidden rows.
    return page.locator("#project-grid > article:visible")


def visible_ids(page):
    return visible_cards(page).evaluate_all("cards => cards.map(card => card.dataset.project)")


def current_catalog(page):
    response = page.request.get(page.url.split("/projects")[0] + "/api/projects")
    assert response.ok
    return response.json()["projects"]


def category(page, label):
    return page.get_by_role("navigation", name="Project categories").get_by_role(
        "link", name=re.compile(r"^" + re.escape(label) + r"\s+\d+$"))


def assert_no_card_overflow(page):
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
    issues = page.locator(".pr-project, .pr-featured").evaluate_all("""cards => cards.flatMap(card => {
        const rect = card.getBoundingClientRect();
        return rect.left < -1 || rect.right > innerWidth + 1 || card.scrollWidth > card.clientWidth + 1
            ? [{project: card.dataset.project || card.textContent.trim(), width: card.clientWidth, scroll: card.scrollWidth}]
            : [];
    })""")
    assert not issues, issues


def test_category_search_and_sort_show_the_right_visible_projects(projects_page):
    page = projects_page
    catalog = current_catalog(page)
    by_id = {project["id"]: project for project in catalog}
    expect(visible_cards(page)).to_have_count(len(catalog))

    category(page, "Games").click()
    games = {project["id"] for project in catalog if project["type"] == "games"}
    expect(visible_cards(page)).to_have_count(len(games))
    assert set(visible_ids(page)) == games
    expect(page.locator("#project-results")).to_have_text(f"{len(games)} of {len(catalog)} projects")

    page.get_by_label("Search projects", exact=True).fill("gridiron")
    expect(visible_cards(page)).to_have_count(1)
    assert visible_ids(page) == ["gridiron"]
    page.get_by_label("Search projects", exact=True).fill("")
    expect(visible_cards(page)).to_have_count(len(games))
    category(page, "All projects").click()
    expect(visible_cards(page)).to_have_count(len(catalog))

    page.get_by_label("Sort", exact=True).select_option("name")
    names = [by_id[project_id]["title"] for project_id in visible_ids(page)]
    assert names == sorted(names, key=str.casefold)
    for ordering, reverse in [("oldest", False), ("newest", True)]:
        page.get_by_label("Sort", exact=True).select_option(ordering)
        ordered = [by_id[project_id] for project_id in visible_ids(page)]
        dated = [project["createdAt"] for project in ordered if project["datePrecision"] != "unknown"]
        assert dated == sorted(dated, reverse=reverse)


def test_filter_url_survives_reload_and_browser_back(projects_page):
    page = projects_page
    category(page, "Games").click()
    page.get_by_label("Search projects", exact=True).fill("gridiron")
    expect(visible_cards(page)).to_have_count(1)
    page.get_by_label("Sort", exact=True).select_option("name")
    assert parse_qs(urlsplit(page.url).query) == {"type": ["games"], "q": ["gridiron"], "sort": ["name"]}

    page.reload(wait_until="networkidle")
    expect(page.get_by_label("Search projects", exact=True)).to_have_value("gridiron")
    expect(page.get_by_label("Sort", exact=True)).to_have_value("name")
    expect(category(page, "Games")).to_have_attribute("aria-current", "true")
    assert visible_ids(page) == ["gridiron"]

    category(page, "All projects").click()
    page.get_by_label("Search projects", exact=True).fill("no-project-matches-this-query")
    expect(visible_cards(page)).to_have_count(0)
    expect(page.get_by_role("heading", name="No projects match just yet.")).to_be_visible()
    page.go_back()
    expect(page.get_by_label("Search projects", exact=True)).to_have_value("gridiron")
    expect(category(page, "Games")).to_have_attribute("aria-current", "true")
    expect(visible_cards(page)).to_have_count(1)
    assert visible_ids(page) == ["gridiron"]


def test_saved_project_and_list_layout_survive_reload(projects_page):
    page = projects_page
    card = page.locator('#project-grid [data-project="gridiron"]')
    card.get_by_role("button", name="Save Pocket Gridiron", exact=True).click()
    expect(card.get_by_role("button", name="Unsave Pocket Gridiron", exact=True)).to_have_attribute("aria-pressed", "true")
    page.get_by_role("button", name="List", exact=True).click()
    page.get_by_role("button", name=re.compile(r"^Saved\s+1$")).click()
    expect(visible_cards(page)).to_have_count(1)
    assert visible_ids(page) == ["gridiron"]

    page.reload(wait_until="networkidle")
    expect(page.get_by_role("button", name="List", exact=True)).to_have_attribute("aria-pressed", "true")
    expect(page.locator("#project-grid")).to_have_attribute("data-view", "list")
    expect(page.locator("#saved-filter")).to_have_attribute("aria-pressed", "true")
    expect(visible_cards(page)).to_have_count(1)
    assert visible_ids(page) == ["gridiron"]
    assert_no_card_overflow(page)

    page.get_by_role("button", name="Unsave Pocket Gridiron", exact=True).click()
    expect(visible_cards(page)).to_have_count(0)
    expect(page.get_by_role("heading", name="Your saved projects will appear here.")).to_be_visible()
    page.reload(wait_until="networkidle")
    expect(visible_cards(page)).to_have_count(0)
    expect(page.locator("#saved-filter")).to_contain_text("0")


def test_project_links_and_layout_remain_usable_in_both_views(projects_page):
    page = projects_page
    for link in page.locator(".pr-featured, #project-grid a").all():
        destination = urlsplit(link.get_attribute("href"))
        assert destination.scheme == "https" and destination.netloc
        assert link.get_attribute("target") == "_blank"
        assert {"noopener", "noreferrer"}.issubset(set(link.get_attribute("rel").split()))
    assert_no_card_overflow(page)
    page.get_by_role("button", name="List", exact=True).click()
    assert_no_card_overflow(page)


def test_experience_and_contact_return_to_the_correct_home_sections(projects_page, live_site):
    page = projects_page
    nav = page.get_by_role("navigation", name="Main navigation")
    experience = nav.get_by_role("link", name="Experience & work", exact=True)
    expect(experience).to_have_attribute("href", "/#experience")
    expect(nav.get_by_role("link", name="Contact", exact=True)).to_have_attribute("href", "/#contact")
    expect(page.get_by_role("link", name="Talk about your project", exact=False)).to_have_attribute("href", "/#contact")
    experience.click()
    expect(page).to_have_url(live_site + "/#experience")
    expect(page.locator("#experience")).to_be_visible()

    page.goto(live_site + "/projects", wait_until="networkidle")
    page.get_by_role("link", name="Talk about your project", exact=False).click()
    expect(page).to_have_url(live_site + "/#contact")
    expect(page.locator("#contact")).to_be_visible()


def test_failed_background_feed_keeps_the_initial_catalog_usable(projects_page, live_site):
    page = projects_page
    attempted = []

    def fail_feed(route):
        attempted.append(route.request.url)
        route.abort("failed")

    page.route("**/api/projects", fail_feed)
    page.goto(live_site + "/projects", wait_until="networkidle")
    initial = json.loads(page.locator("#projects-data").text_content())
    assert attempted
    expect(visible_cards(page)).to_have_count(len(initial))
    category(page, "Tools").click()
    tools = {project["id"] for project in initial if project["type"] == "tools"}
    expect(visible_cards(page)).to_have_count(len(tools))
    assert set(visible_ids(page)) == tools


def test_categories_and_search_work_without_javascript(projects_browser, live_site, project_viewport):
    context = projects_browser.new_context(viewport=project_viewport, java_script_enabled=False)
    context.route(re.compile(r"^https://"), lambda route: route.abort())
    page = context.new_page()
    try:
        page.goto(live_site + "/projects", wait_until="networkidle")
        initial = json.loads(page.locator("#projects-data").text_content())
        expect(visible_cards(page)).to_have_count(len(initial))
        expect(page.locator("[data-js-tools]")).to_be_hidden()
        category(page, "Games").click()
        expect(visible_cards(page)).to_have_count(sum(project["type"] == "games" for project in initial))
        page.get_by_label("Search projects", exact=True).fill("gridiron")
        page.get_by_label("Sort", exact=True).select_option("name")
        page.get_by_role("search").get_by_role("button", name="Search", exact=True).click()
        expect(visible_cards(page)).to_have_count(1)
        assert visible_ids(page) == ["gridiron"]
        expect(visible_cards(page).locator(".pr-description")).to_have_text(
            next(project["description"] for project in initial if project["id"] == "gridiron"))
        assert parse_qs(urlsplit(page.url).query)["q"] == ["gridiron"]
        assert_no_card_overflow(page)
    finally:
        context.close()
