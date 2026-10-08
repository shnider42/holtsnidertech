"""Guard the navigation boundaries between simple pages and the guided UI."""
import pytest
from playwright.sync_api import expect
from test_client_first import ARTIFACTS, visitor  # noqa: F401
from test_homepage_browser import live_site  # noqa: F401


@pytest.mark.parametrize("width", [320, 390, 1440])
def test_guided_return_navigation_is_not_covered(visitor, live_site, width):
    visitor.set_viewport_size({"width": width, "height": 844})
    visitor.goto(live_site + "/guided", wait_until="networkidle")
    nav = visitor.get_by_role("navigation", name="Website navigation")
    bar = nav.bounding_box()
    header = visitor.locator(".bos-head").bounding_box()
    assert header["y"] >= bar["y"] + bar["height"] - 1
    assert visitor.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
    ARTIFACTS.mkdir(exist_ok=True)
    visitor.screenshot(path=str(ARTIFACTS / f"guided-return-{width}.png"))
    # Real pointer activation: no forced clicks that would hide an overlap.
    nav.get_by_role("link", name="Back to the simple homepage").click()
    expect(visitor.locator(".cf-hero")).to_be_visible()


@pytest.mark.parametrize("anchor,target", [
    ("experience", "/technical"), ("case-shapes", "/technical"),
    ("start", "/guided#start"), ("guided-flow", "/guided#guided-flow"),
])
def test_old_bookmarks_also_work_on_a_full_document_load(visitor, live_site, anchor, target):
    # The existing test covers hash-only navigation from the already-loaded home.
    visitor.goto(live_site + "/projects", wait_until="networkidle")
    visitor.goto(live_site + "/#" + anchor, wait_until="networkidle")
    visitor.wait_for_url(live_site + target)
