import os
import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

import pytest
from playwright.sync_api import sync_playwright


REPO_ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_DIR = REPO_ROOT / "artifacts"
TEST_PORT = 5011
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


def test_grepper_compares_workday_paging_with_resume_ranking(live_site):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
        page = context.new_page()
        page.goto(f"{live_site}/static/demos/grepper.html", wait_until="networkidle")
        page.wait_for_function("document.getElementById('jobCount').textContent === '400'")

        assert page.locator("#jobCount").inner_text() == "400"
        assert page.locator("#pageCount").inner_text() == "20"
        assert page.locator("#sourceCount").inner_text() == "5"
        assert page.locator("#snapshotDate").inner_text() == "2026-09-10"
        assert page.locator("#keywordChips .g-chip").count() > 5

        # The conventional side exposes one 20-record page; Grepper surfaces a ranked shortlist.
        assert page.locator("#workdayList .g-job").count() == 20
        assert page.locator("#grepperList .g-job").count() == 12
        assert "Page 1" in page.locator("#pageNote").inner_text()

        ARTIFACT_DIR.mkdir(exist_ok=True)
        page.screenshot(path=str(ARTIFACT_DIR / "grepper-setup.png"), full_page=False)

        page.locator("#nextPage").click()
        assert "Page 2" in page.locator("#pageNote").inner_text()

        # Search filters must drive both sides of the comparison from the same pool.
        page.locator("#source").select_option(label="Workday tenant A — Infrastructure")
        workday_count = int(re.match(r"(\d+)", page.locator("#workdaySummary").inner_text()).group(1))
        grepper_count = int(re.match(r"(\d+)", page.locator("#grepperSummary").inner_text()).group(1))
        assert workday_count == grepper_count

        # Resume weighting should materially change the ranking, not just decorate the UI.
        page.locator("#source").select_option("")
        page.locator("#resume").fill(
            "Frontend engineer. JavaScript JavaScript React React CSS HTML frontend design systems."
        )
        page.get_by_role("button", name="Rank the snapshot").click()

        first_ranked_title = page.locator("#grepperList .g-job strong").first.inner_text()
        assert first_ranked_title.startswith("Frontend Software Engineer")
        assert page.locator("#keywordChips").get_by_text("javascript", exact=False).count() > 0
        assert page.locator("#keywordChips").get_by_text("react", exact=False).count() > 0

        page.locator(".g-compare").scroll_into_view_if_needed()
        page.wait_for_timeout(100)
        page.screenshot(path=str(ARTIFACT_DIR / "grepper-comparison.png"), full_page=False)

        context.close()
        browser.close()
