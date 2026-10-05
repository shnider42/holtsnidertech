"""Regression coverage for the shared Build/Improve project catalogue."""
import pytest
from playwright.sync_api import expect

# Reuse the real-site fixtures without collecting a second copy of its tests.
from test_homepage_browser import capture, live_site, page, start_card  # noqa: F401


TITLES = [
    "Irish Today", "Your Passage", "Loudsource", "Garage Journey", "DSL",
    "Bug Tracker", "Soph(more) Slump(?)", "Galaxy Granite", "Jiporady",
    "Career Compass", "Grepper",
]


def open_examples(page, context="new-build"):
    start_card(page, "bos-choice-opportunity").click()
    label = "Build something new" if context == "new-build" else "Improve something existing"
    page.get_by_role("button", name=label, exact=False).click()
    grid = page.locator('#guided-flow [data-project-showcase="dfe-v1"]')
    expect(grid.locator(".bos-flow-example-card")).to_have_count(len(TITLES))
    return grid


@pytest.mark.parametrize("context", ["new-build", "improve-existing"])
def test_both_build_paths_share_the_complete_catalogue(page, context):
    grid = open_examples(page, context)
    assert grid.locator(".bos-example-title").all_text_contents() == TITLES
    expect(grid.locator('[data-project-family="DFE"]')).to_have_count(8)
    expect(page.locator("[data-project-showcase-intro]")).to_have_count(1)
    assert page.locator('#guided-flow a[href*="github.com"]').count() == 0
    assert page.locator('#guided-flow a[href*="mypassages.net"]').count() == 0
    assert grid.locator('.bos-project-passage').get_attribute("href") == "https://tim-today.onrender.com/"
    assert grid.locator('.bos-project-grepper').get_attribute("href") == "/static/demos/grepper.html"
    assert grid.locator('.bos-project-bug-tracker').get_attribute("href") == "https://hllv-bug-track.onrender.com/"
    for link in grid.locator('a[href^="https://"]').all():
        assert link.get_attribute("target") == "_blank"
        assert {"noopener", "noreferrer"}.issubset(set(link.get_attribute("rel").split()))


def test_overviews_use_native_keyboard_behavior_without_fake_links(page):
    grid = open_examples(page)
    expect(grid.locator("details")).to_have_count(4)
    for theme in ["garage", "dsl", "soph-slump", "galaxy-granite"]:
        overview = grid.locator(f'[data-project="{theme}"]')
        assert overview.get_attribute("href") is None
        summary = overview.locator("summary")
        summary.focus()
        page.keyboard.press("Enter")
        expect(overview).to_have_attribute("open", "")
        expect(overview.locator(".bos-example-notes")).to_be_visible()
        summary.press("Enter")
        assert overview.get_attribute("open") is None


def test_unrelated_mutations_preserve_overviews_and_contact_fields(page):
    grid = open_examples(page)
    garage = grid.locator('[data-project="garage"]')
    garage.locator("summary").click()
    panel = page.locator("#guided-flow")
    panel.get_by_role("button", name="Add context (optional)").click()
    fields = panel.locator(".bos-context-fields:not(.bos-context-copy-panel) textarea")
    fields.first.fill("Preserve this project brief")
    page.evaluate("""() => {
        window.__firstExample = document.querySelector('[data-project-showcase] > :first-child');
        const node = document.createElement('span');
        node.dataset.showcaseTest = 'true';
        document.querySelector('.boston').append(node);
        node.remove();
    }""")
    page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
    assert page.evaluate("window.__firstExample === document.querySelector('[data-project-showcase] > :first-child')")
    expect(garage).to_have_attribute("open", "")
    expect(fields.first).to_have_value("Preserve this project brief")
    expect(grid.locator(".bos-flow-example-card")).to_have_count(len(TITLES))
    expect(page.locator("[data-project-showcase-intro]")).to_have_count(1)


@pytest.mark.parametrize("width,height,theme", [(1440, 1000, "dark"), (768, 1024, "dark"), (390, 844, "dark"), (320, 720, "light"), (1440, 1000, "light")])
def test_showcase_reflows_without_clipped_text(page, width, height, theme):
    page.set_viewport_size({"width": width, "height": height})
    page.evaluate("theme => localStorage.setItem('holtsnider-theme', theme)", theme)
    page.reload(wait_until="networkidle")
    grid = open_examples(page)
    assert grid.evaluate("node => node.scrollWidth <= node.clientWidth + 1")
    for card in grid.locator(".bos-flow-example-card").all():
        assert card.evaluate("node => node.scrollWidth <= node.clientWidth + 1")
        expect(card.locator(".bos-example-title")).to_be_visible()
        expect(card.locator(".bos-example-description")).to_be_visible()
    columns = grid.evaluate("node => getComputedStyle(node).gridTemplateColumns.split(' ').length")
    if width == 1440:
        assert columns == 4
    elif width <= 390:
        assert columns == 1
    grid.scroll_into_view_if_needed()
    capture(page, f"dfe-showcase-{width}-{theme}.png")
