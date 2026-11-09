import os
import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path
from urllib.parse import parse_qs, unquote, urljoin, urlparse

import pytest
from playwright.sync_api import expect, sync_playwright


REPO_ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_DIR = REPO_ROOT / "artifacts"
TEST_PORT = 5010
BASE_URL = f"http://127.0.0.1:{TEST_PORT}"
FEATURED_PROJECT_IDS = ["irish-today", "infierno", "gridiron", "further-in"]


def canonical_projects(page):
    response = page.request.get(urljoin(page.url, "/api/projects"))
    assert response.ok
    return response.json()["projects"]


def featured_projects(page):
    by_id = {project["id"]: project for project in canonical_projects(page)}
    return [by_id[project_id] for project_id in FEATURED_PROJECT_IDS]


def start_card(page, class_name):
    return page.locator(f".bos-start-panel .{class_name}")


def capture(page, name):
    ARTIFACT_DIR.mkdir(exist_ok=True)
    page.screenshot(path=str(ARTIFACT_DIR / name), full_page=False)


@pytest.fixture(scope="module")
def live_site():
    env = os.environ.copy()
    env["PORT"] = str(TEST_PORT)

    process = subprocess.Popen(
        [sys.executable, "run.py"],
        cwd=REPO_ROOT,
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    deadline = time.time() + 20
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(f"{BASE_URL}/healthz", timeout=1) as response:
                if response.status == 200:
                    break
        except Exception:
            time.sleep(0.2)
    else:
        process.terminate()
        raise RuntimeError("Local Holtsnider Tech server did not start in time")

    try:
        yield BASE_URL
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()


@pytest.fixture
def page(live_site):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(reduced_motion="reduce", viewport={"width": 1440, "height": 1000})
        browser_page = context.new_page()
        browser_page.goto(live_site, wait_until="networkidle")
        yield browser_page
        context.close()
        browser.close()


def test_first_screen_uses_clear_visitor_choices(page):
    capture(page, "homepage-desktop.png")

    lede = page.locator(".bos-hero .bos-lede")
    assert lede.is_visible()
    assert "untangle technical problems" in lede.inner_text()

    brand = page.locator(".bos-head .bos-mark")
    assert brand.get_attribute("href") == "/"
    header_links = [
        link.text_content().strip()
        for link in page.locator(".bos-head .bos-links a").all()
    ]
    assert header_links == ["Experience", "Projects", "Contact"]
    expect(page.get_by_role("navigation", name="Main navigation").get_by_role("link", name="Projects", exact=True)).to_have_attribute("href", "/projects")
    bridge = page.locator(".bos-project-bridge")
    expect(bridge.get_by_role("link", name="Explore the projects")).to_be_visible()
    expect(bridge.get_by_role("link", name="Explore the projects")).to_have_attribute("href", "/projects")

    cards = page.locator(".bos-start-panel .bos-choice-card")
    titles = [title.inner_text().strip() for title in cards.locator("h3").all()]
    assert titles == [
        "Fix a Problem",
        "Build or Improve",
        "Experience & Work",
        "Not Sure Yet",
    ]

    descriptions = cards.locator("p")
    assert descriptions.count() == 4
    assert all(descriptions.nth(index).is_visible() for index in range(descriptions.count()))
    assert page.locator(".bos-default-context").count() == 0


def test_mobile_first_screen_keeps_explanations_visible(page):
    page.set_viewport_size({"width": 390, "height": 844})
    page.reload(wait_until="networkidle")
    capture(page, "homepage-mobile.png")

    cards = page.locator(".bos-start-panel .bos-choice-card")
    descriptions = cards.locator("p")
    assert descriptions.count() == 4
    assert all(descriptions.nth(index).is_visible() for index in range(descriptions.count()))

    # Desktop header shortcuts should not compete with the four mobile choices.
    assert not page.locator('[data-clarity-nav="experience"]').is_visible()
    assert not page.locator('[data-clarity-nav="contact"]').is_visible()
    nav_projects = page.get_by_role("navigation", name="Main navigation").get_by_role("link", name="Projects", exact=True)
    expect(nav_projects).to_be_visible()
    expect(nav_projects).to_have_attribute("href", "/projects")
    expect(page.locator(".bos-project-bridge").get_by_role("link", name="Explore the projects")).to_be_visible()
    brand_box = page.locator(".bos-head .bos-mark").bounding_box()
    nav_box = nav_projects.bounding_box()
    assert brand_box["x"] + brand_box["width"] <= nav_box["x"]
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")


def test_mobile_customer_actions_stay_visible(page):
    page.set_viewport_size({"width": 390, "height": 844})
    page.reload(wait_until="networkidle")

    start_card(page, "bos-choice-solve").click()
    page.get_by_role("button", name="Something just happened", exact=False).click()
    detail = page.locator('#guided-flow.is-active[data-active-flow="solve"][data-active-context="just-happened"]')
    detail.wait_for(state="visible")
    assert detail.get_by_role("link", name="Open email app").is_visible()
    assert detail.get_by_role("button", name="Add context (optional)").is_visible()

    start_card(page, "bos-choice-experience").click()
    page.locator("#experience").wait_for(state="visible")
    experience_actions = page.locator("#experience .bos-actions")
    assert experience_actions.get_by_role("link", name="Talk about a role or project").is_visible()
    assert experience_actions.get_by_role("link", name="See public projects").is_visible()
    assert experience_actions.get_by_role("link", name="LinkedIn").is_visible()

    contact = page.locator("#contact")
    contact.scroll_into_view_if_needed()
    assert contact.get_by_role("link", name="Email Chris").is_visible()
    assert contact.get_by_role("button", name="Copy chris@holtsnidertech.com").is_visible()
    assert contact.get_by_role("link", name="Back to starting points").is_visible()
    capture(page, "mobile-contact-actions.png")


def test_warm_light_theme_keeps_core_content_visible(page):
    page.evaluate("window.localStorage.setItem('holtsnider-theme', 'light')")
    page.reload(wait_until="networkidle")

    assert page.locator("html").get_attribute("data-theme") == "light"
    assert page.evaluate("document.getElementById('light-theme-stylesheet').disabled === false")
    assert page.locator(".bos-hero .bos-lede").is_visible()

    descriptions = page.locator(".bos-start-panel .bos-choice-card p")
    assert descriptions.count() == 4
    assert all(descriptions.nth(index).is_visible() for index in range(descriptions.count()))
    capture(page, "homepage-light.png")


def test_experience_bypasses_questionnaire_and_keeps_contact_choices(page):
    start_card(page, "bos-choice-experience").click()

    assert page.locator("#experience").is_visible()
    assert page.locator("#work").is_visible()
    assert page.locator("#case-shapes").is_visible()
    assert page.locator("#guided-flow.is-active").count() == 0
    assert page.locator("#experience .bos-section-heading h2").inner_text() == "Engineering background"

    actions = page.locator("#experience .bos-actions")
    role_link = actions.get_by_role("link", name="Talk about a role or project")
    projects_link = actions.get_by_role("link", name="See public projects")
    linked_in = actions.get_by_role("link", name="LinkedIn")

    assert role_link.get_attribute("href").startswith("mailto:chris@holtsnidertech.com")
    assert projects_link.get_attribute("href") == "#work"
    assert "linkedin.com" in linked_in.get_attribute("href")

    page.locator("#experience").scroll_into_view_if_needed()
    page.wait_for_timeout(100)
    capture(page, "experience-browse.png")

    work = page.locator("#work")
    work.scroll_into_view_if_needed()
    page.wait_for_timeout(100)

    project_titles = [
        title.inner_text().strip()
        for title in work.locator(".bos-work-card h3").all()
    ]
    selected = featured_projects(page)
    assert project_titles == [project["title"] for project in selected]
    assert work.locator(".bos-work-card").evaluate_all("cards => cards.map(card => card.dataset.project)") == FEATURED_PROJECT_IDS
    for project in selected:
        card = work.locator(f'a[data-project="{project["id"]}"]')
        expect(card).to_have_attribute("href", project["url"])
        expect(card.locator("p")).to_have_text(project["description"])
        expect(card.locator("img")).to_have_attribute("src", project["art_url"])
    assert work.locator('a[href*="style-lab"]').count() == 0
    expect(work.get_by_role("link", name=re.compile(r"Browse all \d+ projects"))).to_have_attribute("href", "/projects")
    expect(work.get_by_role("link", name="Grepper, a job-search workflow demo")).to_have_attribute("href", "/static/demos/grepper.html")
    capture(page, "projects-browse.png")


def test_problem_flow_can_email_immediately_or_add_context(page):
    start_card(page, "bos-choice-solve").click()
    panel = page.locator('#guided-flow.is-active[data-active-flow="solve"]')
    panel.wait_for(state="visible")

    page.get_by_role("button", name="Something just happened", exact=False).click()
    detail = page.locator('#guided-flow.is-active[data-active-flow="solve"][data-active-context="just-happened"]')
    detail.wait_for(state="visible")

    email_link = detail.get_by_role("link", name="Open email app")
    assert email_link.is_visible()
    assert email_link.get_attribute("href").startswith("mailto:chris@holtsnidertech.com")

    optional = detail.get_by_role("button", name="Add context (optional)")
    optional.click()

    fields = detail.locator(".bos-context-fields:not(.bos-context-copy-panel) textarea")
    assert fields.first.is_visible()
    fields.first.fill("Started after a deployment")

    decoded_href = unquote(email_link.get_attribute("href"))
    assert "Started after a deployment" in decoded_href
    assert "Starting point: Fix a problem" in decoded_href
    capture(page, "problem-flow.png")


@pytest.mark.parametrize("width", [390, 1440])
@pytest.mark.parametrize("path,option", [
    ("bos-choice-solve", "Something just happened"),
    ("bos-choice-opportunity", "Build something new"),
    ("bos-choice-not-sure", None),
])
def test_contact_draft_preserves_edits_and_failed_email_launch(page, width, path, option):
    page.set_viewport_size({"width": width, "height": 844})
    start_card(page, path).click()
    if option:
        page.get_by_role("button", name=option, exact=False).click()
    detail = page.locator("#guided-flow[data-active-context]")
    message = detail.get_by_label("Your message", exact=True)
    subject = detail.get_by_label("Subject", exact=True)
    expect(message).to_be_visible()
    expect(subject).to_be_visible()
    assert "To: chris@holtsnidertech.com" in detail.inner_text()

    detail.get_by_role("button", name="Add context (optional)").click()
    answer = detail.locator('.bos-context-fields[data-clarity-enhanced="true"] textarea').first
    answer.fill("Original answer: café & API + 50%\nSecond line")
    expect(message).to_have_value(re.compile("Original answer: café & API \\+ 50%"))
    edited = message.input_value() + "\nMy own words: please keep these."
    message.fill(edited)
    subject.fill("Custom subject: café & API + 50%")
    answer.fill("Updated answer")
    expect(message).to_have_value(edited)
    expect(detail.locator(".bos-draft-notice")).to_be_visible()

    email = detail.get_by_role("link", name="Open email app", exact=True)
    payload = parse_qs(urlparse(email.get_attribute("href")).query)
    assert payload["body"] == [edited]
    assert payload["subject"] == [subject.input_value()]
    # Simulate an unavailable handler without invoking an email client or sending.
    email.evaluate("node => node.addEventListener('click', event => event.preventDefault())")
    email.click()
    expect(message).to_have_value(edited)
    expect(answer).to_have_value("Updated answer")
    expect(detail.get_by_role("status")).to_contain_text("Your draft is still here")

    detail.get_by_role("button", name="Select message", exact=True).click()
    assert message.evaluate("node => [node.selectionStart, node.selectionEnd]") == [0, len(edited)]
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    if path == "bos-choice-solve":
        detail.locator(".bos-message-draft").scroll_into_view_if_needed()
        capture(page, f"contact-draft-{width}.png")

    detail.get_by_role("button", name="Replace message from answers").click()
    assert "Updated answer" in message.input_value()
    assert "My own words" not in message.input_value()
    expect(subject).to_have_value("Custom subject: café & API + 50%")
    expect(detail.locator(".bos-draft-notice")).to_be_hidden()


@pytest.mark.parametrize("copy_mode", ["clipboard", "legacy", "unavailable"])
def test_copy_message_handles_clipboard_success_and_failure(page, copy_mode):
    start_card(page, "bos-choice-solve").click()
    page.get_by_role("button", name="Something just happened", exact=False).click()
    detail = page.locator("#guided-flow[data-active-context]")
    message = detail.get_by_label("Your message", exact=True)
    text = "A complete message.\nUnicode: café; special characters: & + % #"
    message.fill(text)
    page.evaluate("""mode => {
        window.__copiedMessage = null;
        Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {
            writeText: async text => {
                if (mode !== 'clipboard') throw new DOMException('Denied', 'NotAllowedError');
                window.__copiedMessage = text;
            }
        }});
        document.execCommand = command => {
            if (mode === 'legacy' && command === 'copy') {
                window.__copiedMessage = document.activeElement.value;
                return true;
            }
            return false;
        };
    }""", copy_mode)
    detail.get_by_role("button", name="Copy message", exact=True).click()
    if copy_mode == "unavailable":
        expect(detail.get_by_role("status")).to_contain_text("Automatic copy is unavailable")
        expect(message).to_be_focused()
        assert message.evaluate("node => [node.selectionStart, node.selectionEnd]") == [0, len(text)]
    else:
        expect(detail.get_by_role("status")).to_contain_text("Message copied")
        assert page.evaluate("window.__copiedMessage") == text
    expect(message).to_have_value(text)


def test_directory_navigation_returns_to_visible_professional_experience(page):
    page.get_by_role("navigation", name="Main navigation").get_by_role("link", name="Projects", exact=True).click()
    expect(page).to_have_url(re.compile(r"/projects$"))
    page.get_by_role("navigation", name="Main navigation").get_by_role("link", name="Experience & work", exact=True).click()
    expect(page).to_have_url(re.compile(r"/#experience$"))
    expect(page.locator("#experience")).to_be_visible()
    expect(page.locator("#work")).to_be_visible()
    expect(page.locator("#experience").get_by_role("link", name="Talk about a role or project")).to_be_visible()


@pytest.mark.parametrize("fragment", ["#experience", "#work", "#case-shapes"])
def test_direct_browse_links_reveal_the_requested_section(page, fragment):
    page.goto(urljoin(page.url, "/" + fragment), wait_until="networkidle")
    page.reload(wait_until="networkidle")  # Also exercise fragment entry on a fresh document.
    expect(page.locator(fragment)).to_be_visible()
    expect(page.locator(fragment)).to_be_in_viewport()
    assert urlparse(page.url).fragment == fragment[1:]
    expect(page.locator("#guided-flow.is-active")).to_have_count(0)


def test_browse_hash_change_clears_guided_state_and_can_return_to_a_flow(page):
    start_card(page, "bos-choice-solve").click()
    expect(page.locator('#guided-flow.is-active[data-active-flow="solve"]')).to_be_visible()
    page.evaluate("window.location.hash = '#work'")
    expect(page.locator("#work")).to_be_visible()
    expect(page.locator("#guided-flow.is-active")).to_have_count(0)
    assert urlparse(page.url).fragment == "work"

    start_card(page, "bos-choice-solve").click()
    expect(page.locator('#guided-flow.is-active[data-active-flow="solve"]')).to_be_visible()
    expect(page.locator("#work")).to_be_hidden()


def test_directory_uses_canonical_passage_destination(page):
    passage = next(project for project in canonical_projects(page) if project["id"] == "mypassages")
    page.goto(urljoin(page.url, "/projects?q=Your+Passage#collection"), wait_until="networkidle")
    card = page.locator('#project-grid [data-project="mypassages"]')
    expect(card).to_be_visible()
    for link in card.locator("a").all():
        expect(link).to_have_attribute("href", passage["url"])
    assert page.locator('#project-grid a[href*="mypassages.net"]').count() == 0


def test_not_sure_path_skips_single_choice_intermediary(page):
    start_card(page, "bos-choice-not-sure").click()

    detail = page.locator('#guided-flow.is-active[data-active-flow="discovery"][data-active-context="messy-version"]')
    detail.wait_for(state="visible")

    assert detail.locator(".bos-guided-flow-head h3").inner_text() == "Describe the unclear situation"
    assert detail.get_by_role("button", name="Back to starting points").is_visible()


def test_switching_to_experience_clears_guided_state(page):
    start_card(page, "bos-choice-solve").click()
    page.locator('#guided-flow.is-active[data-active-flow="solve"]').wait_for(state="visible")

    start_card(page, "bos-choice-experience").click()
    assert page.locator("#experience").is_visible()
    assert page.locator("#guided-flow.is-active").count() == 0

    start_card(page, "bos-choice-solve").click()
    page.locator('#guided-flow.is-active[data-active-flow="solve"]').wait_for(state="visible")
    assert page.locator("#experience").is_hidden()


def test_professional_case_cards_route_to_live_guided_paths(page):
    start_card(page, "bos-choice-experience").click()
    case_cards = page.locator("#case-shapes .bos-case-card")
    assert case_cards.count() == 4
    assert case_cards.nth(2).get_attribute("href") == "#guided-flow"
    assert case_cards.nth(3).get_attribute("href") == "#guided-flow"
    assert case_cards.nth(2).get_attribute("data-clarity-guided-path") == "solve"
    assert case_cards.nth(3).get_attribute("data-clarity-guided-path") == "opportunity"

    case_cards.nth(2).click()
    page.locator('#guided-flow.is-active[data-active-flow="solve"]').wait_for(state="visible")
    assert page.locator("#case-shapes").is_hidden()

    start_card(page, "bos-choice-experience").click()
    page.locator("#case-shapes").wait_for(state="visible")
    page.locator('#case-shapes .bos-case-card[data-clarity-guided-path="opportunity"]').click()
    page.locator('#guided-flow.is-active[data-active-flow="opportunity"]').wait_for(state="visible")
    assert page.locator("#case-shapes").is_hidden()


def test_final_contact_has_mail_copy_and_reset_paths(page):
    contact = page.locator("#contact")
    assert contact.get_by_role("link", name="Email Chris").is_visible()
    assert contact.get_by_role("button", name="Copy chris@holtsnidertech.com").is_visible()
    assert contact.get_by_role("link", name="Back to starting points").is_visible()
