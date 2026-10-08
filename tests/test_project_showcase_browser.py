"""Regression coverage for the shared Build/Improve project catalogue."""
from pathlib import Path
from urllib.parse import urlsplit

import pytest
from playwright.sync_api import expect
from test_homepage_browser import capture, live_site, page, start_card  # noqa: F401

TITLES = [
    "Irish Today", "Your Passage", "Loudsource", "Garage Journey", "DSL",
    "Bug Tracker", "Soph(more) Slump(?)", "Galaxy Granite", "Jiporady",
    "Career Compass", "Grepper",
]
PUBLIC_BUILDS = {
    "garage": "https://jbmw.onrender.com/?theme=garage_journey",
    "dsl": "https://sl-jake.onrender.com/",
    "bug-tracker": "https://hllv-bug-track.onrender.com/",
    "soph-slump": "https://soph-slump.onrender.com/?theme=qb_year_two",
    "galaxy-granite": "https://galgran.onrender.com/?theme=galaxy_granite_daily",
}


def open_examples(page, context="new-build"):
    start_card(page, "bos-choice-opportunity").click()
    label = "Build something new" if context == "new-build" else "Improve something existing"
    page.get_by_role("button", name=label, exact=False).click()
    grid = page.locator('#guided-flow [data-project-showcase="dfe-v1"]')
    expect(grid.locator(".bos-flow-example-card")).to_have_count(len(TITLES))
    return grid


def clipped_text(card):
    # Measure text, not deliberately clipped decorative pseudo-elements.
    return card.evaluate("""card => {
    const box = card.getBoundingClientRect();
    const left = box.left + card.clientLeft;
    const top = box.top + card.clientTop;
    const right = left + card.clientWidth;
    const bottom = top + card.clientHeight;
    const issues = [];
    for (const node of card.querySelectorAll('.bos-example-category, .bos-example-title, .bos-example-description, .bos-example-action')) {
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
            if (rect.width && rect.height && (rect.left < left - 1 || rect.right > right + 1 || rect.top < top - 1 || rect.bottom > bottom + 1)) {
                issues.push({field: node.className, text: node.textContent, textBox: rect.toJSON(), cardBox: box.toJSON()});
            }
        }
    }
    return issues;
}""")


@pytest.mark.parametrize("context", ["new-build", "improve-existing"])
def test_both_build_paths_share_the_complete_catalogue(page, context):
    grid = open_examples(page, context)
    assert grid.locator(".bos-example-title").all_text_contents() == TITLES
    expect(grid.locator('[data-project-family="DFE"]')).to_have_count(8)
    expect(page.locator("[data-project-showcase-intro]")).to_have_count(1)
    expect(grid.locator("details")).to_have_count(0)
    assert "public launch link is not connected" not in grid.inner_text()
    assert page.locator('#guided-flow a[href*="github.com"]').count() == 0
    assert page.locator('#guided-flow a[href*="mypassages.net"]').count() == 0
    assert grid.locator('.bos-project-passage').get_attribute("href") == "https://tim-today.onrender.com/"
    assert grid.locator('.bos-project-grepper').get_attribute("href") == "/static/demos/grepper.html"
    for theme, href in PUBLIC_BUILDS.items():
        expect(grid.locator(f'a[data-project="{theme}"]')).to_have_attribute("href", href)
    for link in grid.locator('a[href^="https://"]').all():
        assert link.get_attribute("target") == "_blank"
        assert {"noopener", "noreferrer"}.issubset(set(link.get_attribute("rel").split()))


@pytest.mark.parametrize("theme", list(PUBLIC_BUILDS))
def test_public_builds_open_in_new_tabs_from_the_keyboard(page, theme):
    grid = open_examples(page)
    href = PUBLIC_BUILDS[theme]
    host = urlsplit(href).netloc
    page.context.route(f"https://{host}/**", lambda route: route.fulfill(
        status=200, content_type="text/html", body="<title>Link target fixture</title>"))
    card = grid.locator(f'a[data-project="{theme}"]')
    original_url = page.url
    card.focus()
    with page.context.expect_page() as opened:
        page.keyboard.press("Enter")
    target = opened.value
    target.wait_for_url(href)
    expect(target).to_have_title("Link target fixture")
    assert target.evaluate("window.opener === null")
    assert page.url == original_url
    target.close()


def test_unpublished_build_fallback_still_supports_native_keyboard_overviews(page):
    # Simulate only in this browser; the shipped catalogue retains all live URLs.
    source = (Path(__file__).resolve().parents[1] / "app/static/js/boston-visible-work-cards.js").read_text()
    line = 'const projectExamples = JSON.parse(catalogue.textContent);'
    assert source.count(line) == 1
    source = source.replace(line, line + '\n    Object.assign(projectExamples.find(p => p.theme === "garage"), {href: null, action: null});')
    page.route("**/static/js/boston-visible-work-cards.js", lambda route: route.fulfill(
        status=200, content_type="application/javascript", body=source))
    page.reload(wait_until="networkidle")
    grid = open_examples(page)
    overview = grid.locator('details[data-project="garage"]')
    expect(grid.locator("details")).to_have_count(1)
    assert overview.get_attribute("href") is None
    summary = overview.locator("summary")
    summary.focus()
    summary.press("Enter")
    expect(overview).to_have_attribute("open", "")
    expect(overview.locator(".bos-example-notes")).to_be_visible()
    summary.press("Enter")
    assert overview.get_attribute("open") is None


def test_unrelated_mutations_preserve_link_focus_and_contact_fields(page):
    grid = open_examples(page)
    garage = grid.locator('a[data-project="garage"]')
    panel = page.locator("#guided-flow")
    panel.get_by_role("button", name="Add context (optional)").click()
    fields = panel.locator(".bos-context-fields:not(.bos-context-copy-panel) textarea")
    fields.first.fill("Preserve this project brief")
    garage.focus()
    page.evaluate("""() => {
        window.__firstExample = document.querySelector('[data-project-showcase] > :first-child');
        const node = document.createElement('span');
        node.dataset.showcaseTest = 'true';
        document.querySelector('.boston').append(node);
        node.remove();
    }""")
    page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
    assert page.evaluate("window.__firstExample === document.querySelector('[data-project-showcase] > :first-child')")
    expect(garage).to_be_focused()
    expect(fields.first).to_have_value("Preserve this project brief")
    expect(grid.locator(".bos-flow-example-card")).to_have_count(len(TITLES))
    expect(page.locator("[data-project-showcase-intro]")).to_have_count(1)


@pytest.mark.parametrize("width,height,theme", [(1440, 1000, "dark"), (768, 1024, "dark"), (390, 844, "dark"), (320, 720, "light"), (1440, 1000, "light")])
def test_showcase_reflows_without_clipped_text(page, width, height, theme):
    page.set_viewport_size({"width": width, "height": height})
    page.evaluate("theme => localStorage.setItem('holtsnider-theme', theme)", theme)
    page.reload(wait_until="networkidle")
    grid = open_examples(page)
    grid.scroll_into_view_if_needed()
    capture(page, f"dfe-showcase-{width}-{theme}.png")
    assert grid.evaluate("node => node.scrollWidth <= node.clientWidth + 1")
    for card in grid.locator(".bos-flow-example-card").all():
        clipping = clipped_text(card)
        assert not clipping, clipping
        expect(card.locator(".bos-example-title")).to_be_visible()
        expect(card.locator(".bos-example-description")).to_be_visible()
    columns = grid.evaluate("node => getComputedStyle(node).gridTemplateColumns.split(' ').length")
    if width == 1440:
        assert columns == 4
    elif width <= 390:
        assert columns == 1


def test_text_measurement_catches_real_clipping(page):
    grid = open_examples(page)
    card = grid.locator('[data-project="irish"]')
    assert not clipped_text(card)
    page.add_style_tag(content="""
        #guided-flow [data-project="irish"] .bos-example-description {
            white-space: nowrap !important;
            overflow-wrap: normal !important;
        }
    """)
    assert clipped_text(card)
