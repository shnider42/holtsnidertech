"""Client-facing routes must work without understanding the guided interface."""
from pathlib import Path
from urllib.parse import unquote

import pytest
from playwright.sync_api import expect, sync_playwright
from app.showcase import load_projects
from test_homepage_browser import live_site  # noqa: F401

ARTIFACTS = Path(__file__).resolve().parents[1] / "artifacts"


@pytest.fixture
def visitor(live_site):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
        page = context.new_page()
        page.goto(live_site, wait_until="networkidle")
        yield page
        context.close()
        browser.close()


def open_notes(page):
    page.locator("#draft-help summary").click()
    return page.locator("#project-notes")


def test_simple_entrance_has_one_primary_action_and_three_examples(visitor):
    expect(visitor.locator("h1")).to_contain_text("Fix what isn't working.")
    expect(visitor.locator(".cf-hero .cf-button")).to_have_count(1)
    expect(visitor.locator(".cf-hero .cf-button")).to_have_attribute("href", "#contact")
    expect(visitor.locator(".bos-choice-card")).to_have_count(0)
    assert visitor.locator(".cf-project h3").all_text_contents() == ["Galaxy Granite", "Garage Journey", "Grepper"]
    expect(visitor.locator("#draft-help")).not_to_have_attribute("open", "")
    visitor.locator(".cf-hero .cf-button").click()
    expect(visitor.locator("#email-chris")).to_be_visible()
    assert visitor.locator("#email-chris").get_attribute("href").startswith("mailto:")
    assert visitor.locator(".cf").get_attribute("data-active-flow") is None


def test_technical_background_is_one_direct_navigation(visitor):
    visitor.get_by_role("navigation", name="Main navigation").get_by_role("link", name="Technical background").click()
    visitor.wait_for_url("**/technical")
    expect(visitor.locator("h1")).to_contain_text("Technical depth.")
    expect(visitor.get_by_role("heading", name="Reliability & incident response")).to_be_visible()
    expect(visitor.locator(".bos-choice-card")).to_have_count(0)


def test_full_gallery_keeps_all_links_and_order(visitor):
    visitor.get_by_role("link", name="See all 11 projects").click()
    expect(visitor.locator(".cf-project")).to_have_count(11)
    assert visitor.locator(".cf-project h3").all_text_contents() == [p["title"] for p in load_projects()]
    for project in load_projects():
        card = visitor.locator(f'[data-project="{project["theme"]}"]')
        href = project["href"]
        href = "/" + href if href.startswith("#") else href
        expect(card.locator(".cf-project-link")).to_have_attribute("href", href)
        if href.startswith("https://"):
            expect(card.locator(".cf-project-link")).to_have_attribute("target", "_blank")
            expect(card.locator(".cf-project-link")).to_have_attribute("rel", "noopener noreferrer")
    assert visitor.locator(".cf-engine").get_attribute("open") is None


def test_guided_route_is_optional_and_has_a_way_home(visitor):
    visitor.get_by_role("link", name="Help me describe what I need").click()
    expect(visitor.locator(".bos-start-panel .bos-choice-card")).to_have_count(4)
    visitor.get_by_role("link", name="Back to the simple homepage").click()
    expect(visitor.locator(".cf-hero")).to_be_visible()


def test_native_project_details_work_from_keyboard(visitor):
    detail = visitor.locator('.cf-project[data-project="grepper"] details')
    summary = detail.locator("summary")
    summary.focus()
    summary.press("Enter")
    expect(detail).to_have_attribute("open", "")
    expect(detail.locator("p").first).to_contain_text("bundled snapshot")
    summary.press("Enter")
    assert detail.get_attribute("open") is None


def test_notes_update_draft_without_network_or_storage(visitor):
    notes = open_notes(visitor)
    requests = []
    visitor.on("request", lambda req: requests.append(req.url))
    text = 'Orders & spreadsheets <not markup> — a private draft'
    notes.fill(text)
    assert text in visitor.locator("#email-draft").input_value()
    assert text in unquote(visitor.locator("#email-chris").get_attribute("href"))
    assert visitor.evaluate("localStorage.length") == 0
    assert requests == []
    visitor.locator('[data-theme-toggle]').click()
    expect(notes).to_have_value(text)
    assert visitor.evaluate("Object.keys(localStorage)") == ["holtsnider-theme"]


def test_long_draft_remains_copyable_without_a_long_mailto(visitor):
    text = "Some detailed context. " * 150
    open_notes(visitor).fill(text)
    assert text.strip() in visitor.locator("#email-draft").input_value()
    assert "&body=" not in visitor.locator("#email-chris").get_attribute("href")
    expect(visitor.locator("#draft-notice")).to_contain_text("longer notes")
    visitor.evaluate("Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText: async text => {window.copiedDraft = text;}}})")
    visitor.get_by_role("button", name="Copy draft", exact=True).click()
    expect(visitor.locator("#draft-notice")).to_contain_text("Draft copied")
    assert visitor.evaluate("window.copiedDraft") == visitor.locator("#email-draft").input_value()


@pytest.mark.parametrize("mode", ["denied", "missing"])
def test_clipboard_failures_select_the_actual_text(visitor, mode):
    open_notes(visitor).fill("Keep my message")
    value = "{writeText: () => Promise.reject(new Error('denied'))}" if mode == "denied" else "undefined"
    visitor.evaluate("Object.defineProperty(navigator, 'clipboard', {configurable:true, value:" + value + "})")
    visitor.get_by_role("button", name="Copy draft", exact=True).click()
    expect(visitor.locator("#draft-notice")).to_contain_text("Automatic copy was blocked")
    assert visitor.locator("#email-draft").evaluate("e => e.selectionEnd - e.selectionStart === e.value.length")
    visitor.get_by_role("button", name="Copy email address", exact=True).click()
    expect(visitor.locator("[data-copy-status]")).to_contain_text("Automatic copy was blocked")
    assert visitor.evaluate("getSelection().toString()") == "chris@holtsnidertech.com"
    expect(visitor.locator("#project-notes")).to_have_value("Keep my message")


def test_blocked_storage_does_not_break_navigation_or_theme(visitor):
    visitor.add_init_script("Storage.prototype.getItem = () => {throw new Error('blocked')}; Storage.prototype.setItem = () => {throw new Error('blocked')};")
    visitor.reload(wait_until="networkidle")
    visitor.locator('[data-theme-toggle]').click()
    expect(visitor.locator("html")).to_have_attribute("data-theme", "light")
    expect(visitor.locator("#email-chris")).to_be_visible()


@pytest.mark.parametrize("path,expected", [("/#experience", "/technical"), ("/#case-shapes", "/technical"), ("/#start", "/guided#start"), ("/#guided-flow", "/guided#guided-flow")])
def test_previous_homepage_anchors_have_useful_destinations(visitor, live_site, path, expected):
    visitor.goto(live_site + path, wait_until="networkidle")
    visitor.wait_for_url(live_site + expected)


@pytest.mark.parametrize("path", ["/", "/projects", "/technical"])
@pytest.mark.parametrize("width,theme", [(1440,"dark"), (1440,"light"), (768,"dark"), (390,"dark"), (320,"light")])
def test_client_pages_reflow_with_technical_detail_available(visitor, live_site, path, width, theme):
    visitor.set_viewport_size({"width":width,"height":1000 if width==1440 else 844})
    visitor.evaluate("t => localStorage.setItem('holtsnider-theme', t)", theme)
    visitor.goto(live_site + path, wait_until="networkidle")
    ARTIFACTS.mkdir(exist_ok=True)
    name = "home" if path == "/" else path.lstrip("/")
    visitor.screenshot(path=str(ARTIFACTS / f"client-{name}-{width}-{theme}.png"), full_page=True)
    assert visitor.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
    nav = visitor.get_by_role("navigation", name="Main navigation")
    assert all(link.is_visible() for link in nav.locator("a").all())
    expect(visitor.locator("html")).to_have_attribute("data-theme", theme)
    for detail in visitor.locator(".cf-project-detail").all():
        detail.locator("summary").click()
        expect(detail.locator("p").first).to_be_visible()
    assert visitor.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
    if path == "/":
        visitor.evaluate("scrollTo(0,0)")
        rect = visitor.locator(".cf-hero .cf-button").bounding_box()
        assert rect["y"] + rect["height"] <= visitor.viewport_size["height"]


def test_core_content_and_contact_work_without_javascript(live_site):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(java_script_enabled=False, viewport={"width":390,"height":844})
        page = context.new_page()
        page.goto(live_site)
        expect(page.locator(".cf-project")).to_have_count(3)
        assert page.locator("#email-chris").get_attribute("href").startswith("mailto:chris@holtsnidertech.com")
        page.locator(".cf-project-detail summary").first.click()
        expect(page.locator(".cf-project-detail").first).to_have_attribute("open", "")
        page.get_by_role("navigation", name="Main navigation").get_by_role("link", name="My work", exact=True).click()
        expect(page.locator(".cf-project")).to_have_count(11)
        assert page.locator('a[href="/#contact"]').count() >= 1
        context.close()
        browser.close()
