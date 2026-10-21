import os
import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

import pytest
from playwright.sync_api import expect, sync_playwright


REPO_ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_DIR = REPO_ROOT / "artifacts"
TEST_PORT = 5010
BASE_URL = f"http://127.0.0.1:{TEST_PORT}"


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
    assert header_links == ["Experience & Work", "Contact"]

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
    assert project_titles == [
        "Irish Today",
        "Grepper",
        "LoudSource Voting Flyer",
        "Your Passage",
    ]
    assert work.locator('a[href*="style-lab"]').count() == 0
    assert "tim-today.onrender.com" in work.get_by_role("link", name="Your Passage", exact=False).get_attribute("href")
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


def test_build_flow_never_sends_your_passage_to_unrelated_domain(page):
    start_card(page, "bos-choice-opportunity").click()
    page.locator('#guided-flow.is-active[data-active-flow="opportunity"]').wait_for(state="visible")

    page.get_by_role("button", name="Build something new", exact=False).click()
    detail = page.locator('#guided-flow.is-active[data-active-flow="opportunity"][data-active-context="new-build"]')
    detail.wait_for(state="visible")

    passage = detail.locator('a:has-text("Your Passage")')
    passage.wait_for(state="visible")
    page.wait_for_function(
        """() => {
            const link = document.querySelector('#guided-flow a.bos-project-passage');
            return link && link.href.includes('tim-today.onrender.com');
        }"""
    )

    assert "tim-today.onrender.com" in passage.get_attribute("href")
    assert detail.locator('a[href*="mypassages.net"]').count() == 0


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
