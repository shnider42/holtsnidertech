import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path
from urllib.parse import unquote

import pytest
from playwright.sync_api import sync_playwright


REPO_ROOT = Path(__file__).resolve().parents[1]
TEST_PORT = 5010
BASE_URL = f"http://127.0.0.1:{TEST_PORT}"


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
        context = browser.new_context(reduced_motion="reduce")
        browser_page = context.new_page()
        browser_page.goto(live_site, wait_until="networkidle")
        yield browser_page
        context.close()
        browser.close()


def test_first_screen_uses_clear_visitor_choices(page):
    lede = page.locator(".bos-hero .bos-lede")
    assert lede.is_visible()
    assert "untangle technical problems" in lede.inner_text()

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

    cards = page.locator(".bos-start-panel .bos-choice-card")
    descriptions = cards.locator("p")
    assert descriptions.count() == 4
    assert all(descriptions.nth(index).is_visible() for index in range(descriptions.count()))

    # Desktop header shortcuts should not compete with the four mobile choices.
    assert not page.locator('[data-clarity-nav="experience"]').is_visible()
    assert not page.locator('[data-clarity-nav="contact"]').is_visible()


def test_experience_bypasses_questionnaire_and_opens_browse_sections(page):
    page.locator(".bos-choice-experience").click()

    assert page.locator("#experience").is_visible()
    assert page.locator("#work").is_visible()
    assert page.locator("#case-shapes").is_visible()
    assert page.locator("#guided-flow.is-active").count() == 0
    assert page.locator("#experience .bos-section-heading h2").inner_text() == "Engineering background"


def test_problem_flow_can_email_immediately_or_add_context(page):
    page.locator(".bos-choice-solve").click()
    panel = page.locator('#guided-flow.is-active[data-active-flow="solve"]')
    panel.wait_for(state="visible")

    page.get_by_role("button", name="Something just happened", exact=False).click()
    detail = page.locator('#guided-flow.is-active[data-active-flow="solve"][data-active-context="just-happened"]')
    detail.wait_for(state="visible")

    email_link = detail.get_by_role("link", name="Email Chris")
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


def test_not_sure_path_skips_single_choice_intermediary(page):
    page.locator(".bos-choice-not-sure").click()

    detail = page.locator('#guided-flow.is-active[data-active-flow="discovery"][data-active-context="messy-version"]')
    detail.wait_for(state="visible")

    assert detail.locator(".bos-guided-flow-head h3").inner_text() == "Describe the unclear situation"
    assert detail.get_by_role("button", name="Back to starting points").is_visible()


def test_switching_to_experience_clears_guided_state(page):
    page.locator(".bos-choice-solve").click()
    page.locator('#guided-flow.is-active[data-active-flow="solve"]').wait_for(state="visible")

    page.locator(".bos-choice-experience").click()
    assert page.locator("#experience").is_visible()
    assert page.locator("#guided-flow.is-active").count() == 0

    page.locator(".bos-choice-solve").click()
    page.locator('#guided-flow.is-active[data-active-flow="solve"]').wait_for(state="visible")
    assert page.locator("#experience").is_hidden()
