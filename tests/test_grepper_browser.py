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


def test_grepper_demo_copy_does_not_use_em_dashes():
    paths = [
        REPO_ROOT / "app/static/demos/grepper.html",
        REPO_ROOT / "app/static/js/grepper-demo.js",
        REPO_ROOT / "app/static/data/grepper-snapshot.json",
        REPO_ROOT / "app/static/css/grepper-demo.css",
        REPO_ROOT / "app/static/css/grepper-product.css",
    ]
    for path in paths:
        assert "—" not in path.read_text(encoding="utf-8"), f"em dash found in {path}"


def test_grepper_compares_workday_latency_with_resume_ranking(live_site):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
        page = context.new_page()
        page.goto(f"{live_site}/static/demos/grepper.html", wait_until="networkidle")
        page.wait_for_function("document.getElementById('jobCount').textContent === '2,000'")

        assert page.locator("#jobCount").inner_text() == "2,000"
        assert page.locator("#pageCount").inner_text() == "100"
        assert page.locator("#sourceCount").inner_text() == "5"
        assert page.locator("#snapshotDate").inner_text() == "2026-09-11"
        assert page.locator("#keywordChips .g-chip").count() > 5

        # Workday opens like a normal company career site: one raw 20-job page,
        # with technical and non-technical roles mixed together.
        assert page.locator("#workdayList .g-wd-job").count() == 20
        assert page.locator("#grepperList .g-gr-job").count() == 20
        assert page.locator("#workdaySummary").inner_text() == "2,000 JOBS FOUND"
        assert page.locator("#pageNote").inner_text() == "Page 1 of 100"
        assert page.locator("#grepperScanned").inner_text() == "2,000"
        assert page.locator("#grepperShown").inner_text() == "20"
        assert int(page.locator("#grepperSignals").inner_text()) > 5
        assert page.locator("#grepperList .g-gr-rank").first.inner_text() == "1"
        assert page.locator("#grepperList .g-gr-score-bar").count() == 20

        workday_text = page.locator("#workdayList").inner_text()
        for expected_title in [
            "Senior Site Reliability Engineer",
            "Enterprise Account Manager",
            "Financial Analyst",
            "Supply Chain Planner",
            "Recruiter",
            "Frontend Software Engineer",
            "Technical Trainer",
            "Operations Manager",
        ]:
            assert expected_title in workday_text

        # Workday result cards deliberately omit job IDs and locations.
        assert "Boston, MA" not in workday_text
        assert "G-000" not in workday_text

        ARTIFACT_DIR.mkdir(exist_ok=True)
        page.locator("#workdayPanel").scroll_into_view_if_needed()
        page.wait_for_timeout(80)
        page.screenshot(path=str(ARTIFACT_DIR / "grepper-workday.png"), full_page=False)

        # Paging should visibly remain busy well beyond the old 850 ms delay.
        page.locator("#nextPage").click()
        assert page.locator("#workdayPanel").get_attribute("aria-busy") == "true"
        assert "Loading page 2" in page.locator("#pageNote").inner_text()
        assert page.locator("#workdayList .g-wd-skeleton").count() > 0
        page.wait_for_timeout(1000)
        assert page.locator("#workdayPanel").get_attribute("aria-busy") == "true"
        page.wait_for_function("document.getElementById('workdayPanel').getAttribute('aria-busy') === 'false'")
        assert page.locator("#pageNote").inner_text() == "Page 2 of 100"

        # Typing changes Grepper immediately. Workday does nothing until Search,
        # then uses a much simpler title-first lookup rather than resume signals.
        old_workday_count = page.locator("#workdaySummary").inner_text()
        page.locator("#query").fill("frontend")
        assert "40 jobs scanned" in page.locator("#grepperSummary").inner_text()
        assert page.locator("#grepperScanned").inner_text() == "40"
        assert page.locator("#workdaySummary").inner_text() == old_workday_count

        page.locator("#workdaySearchBtn").click()
        assert page.locator("#workdayPanel").get_attribute("aria-busy") == "true"
        assert page.locator("#workdaySummary").inner_text() == old_workday_count
        page.wait_for_function("document.getElementById('workdayPanel').getAttribute('aria-busy') === 'false'")
        assert page.locator("#workdaySummary").inner_text() == "40 JOBS FOUND"
        assert page.locator("#pageNote").inner_text() == "Page 1 of 2"
        assert page.locator("#workdayList .g-wd-job a").first.inner_text() == "Frontend Software Engineer"

        # Workday can weakly pull from description text, but those are fallback
        # matches rather than resume-aware relevance results.
        page.locator("#query").fill("forecast")
        page.locator("#workdaySearchBtn").click()
        page.wait_for_function("document.getElementById('workdayPanel').getAttribute('aria-busy') === 'false'")
        description_count = int(re.match(r"([\d,]+)", page.locator("#workdaySummary").inner_text()).group(1).replace(",", ""))
        assert description_count > 0
        assert page.locator("#workdayList .g-wd-job a").first.inner_text() == "Financial Analyst"

        # Business-group filters still drive both views, but Workday redraws later.
        page.locator("#query").fill("")
        page.locator("#workdaySearchBtn").click()
        page.wait_for_function("document.getElementById('workdayPanel').getAttribute('aria-busy') === 'false'")
        page.locator("#source").select_option(label="Engineering and Product")
        grepper_count = int(re.match(r"([\d,]+)", page.locator("#grepperSummary").inner_text()).group(1).replace(",", ""))
        assert grepper_count > 0
        assert grepper_count < 2000
        assert page.locator("#workdayPanel").get_attribute("aria-busy") == "true"
        page.wait_for_function("document.getElementById('workdayPanel').getAttribute('aria-busy') === 'false'")
        workday_count = int(re.match(r"([\d,]+)", page.locator("#workdaySummary").inner_text()).group(1).replace(",", ""))
        assert workday_count == grepper_count

        # Resume weighting materially changes Grepper, but it does not reorder the
        # Workday side because Workday has no access to those ranking signals.
        page.locator("#source").select_option("")
        page.wait_for_function("document.getElementById('workdayPanel').getAttribute('aria-busy') === 'false'")
        workday_first_before_rank = page.locator("#workdayList .g-wd-job a").first.inner_text()
        page.locator("#resume").fill(
            "Frontend engineer. JavaScript JavaScript React React CSS HTML frontend design systems."
        )
        page.get_by_role("button", name="Rank the snapshot").click()

        first_ranked_title = page.locator("#grepperList .g-gr-job strong").first.inner_text()
        assert first_ranked_title.startswith("Frontend Software Engineer")
        assert page.locator("#keywordChips").get_by_text("javascript", exact=False).count() > 0
        assert page.locator("#keywordChips").get_by_text("react", exact=False).count() > 0
        assert page.locator("#grepperList .g-gr-job").first.locator(".g-gr-skill").count() > 0
        assert page.locator("#grepperList .g-gr-job.is-top").count() == 3
        assert page.locator("#workdayList .g-wd-job a").first.inner_text() == workday_first_before_rank

        page.locator(".g-compare").scroll_into_view_if_needed()
        page.wait_for_timeout(100)
        page.screenshot(path=str(ARTIFACT_DIR / "grepper-comparison.png"), full_page=False)

        context.close()
        browser.close()
