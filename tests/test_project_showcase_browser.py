"""Regression coverage for selected projects within both Build/Improve paths."""
import re
from urllib.parse import urlsplit

import pytest
from playwright.sync_api import expect

# Reuse the real-site fixtures without collecting a second copy of its tests.
from test_homepage_browser import (  # noqa: F401
    FEATURED_PROJECT_IDS, canonical_projects, capture, featured_projects,
    live_site, page, start_card,
)


def open_examples(page, context="new-build"):
    start_card(page, "bos-choice-opportunity").click()
    label = "Build something new" if context == "new-build" else "Improve something existing"
    page.get_by_role("button", name=label, exact=False).click()
    grid = page.locator("#guided-flow .bos-flow-example-grid")
    expect(grid.locator(".bos-flow-example-card")).to_have_count(len(FEATURED_PROJECT_IDS))
    expect(grid.locator('[data-project="further-in"]')).to_have_count(1)
    return grid


def clipped_text(card):
    # Measure actual text lines, including vertical clipping, independently of
    # the artwork. The grid assertion also checks horizontal page overflow.
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
def test_both_build_paths_share_canonical_selected_projects(page, context):
    grid = open_examples(page, context)
    selected = featured_projects(page)
    assert grid.locator(".bos-example-title").all_text_contents() == [project["title"] for project in selected]
    assert grid.locator(".bos-flow-example-card").evaluate_all("cards => cards.map(card => card.dataset.project)") == FEATURED_PROJECT_IDS
    for project in selected:
        card = grid.locator(f'a[data-project="{project["id"]}"]')
        expect(card).to_have_attribute("href", project["url"])
        expect(card.locator(".bos-example-description")).to_have_text(project["description"])
        expect(card.locator("img")).to_have_attribute("src", project["art_url"])
    panel = page.locator("#guided-flow")
    expect(panel.get_by_role("link", name=re.compile(r"Browse all \d+ projects"))).to_have_attribute("href", "/projects")
    expect(panel.get_by_role("link", name="Grepper, a job-search workflow demo")).to_have_attribute("href", "/static/demos/grepper.html")
    for link in grid.locator('a[href^="https://"]').all():
        assert link.get_attribute("target") == "_blank"
        assert {"noopener", "noreferrer"}.issubset(set(link.get_attribute("rel").split()))


@pytest.mark.parametrize("project_id", FEATURED_PROJECT_IDS)
def test_selected_projects_open_in_new_tabs_from_the_keyboard(page, project_id):
    grid = open_examples(page)
    href = next(project["url"] for project in featured_projects(page) if project["id"] == project_id)
    host = urlsplit(href).netloc
    # Keep site regression tests offline and deterministic. A separate GitHub
    # workflow checks the actual public HTTP pages without starting/joining games.
    page.context.route(f"https://{host}/**", lambda route: route.fulfill(
        status=200, content_type="text/html", body="<title>Link target fixture</title>"))
    card = grid.locator(f'a[data-project="{project_id}"]')
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


def test_browse_all_opens_the_native_directory_from_a_build_path(page):
    projects = canonical_projects(page)
    open_examples(page)
    browse = page.locator("#guided-flow").get_by_role("link", name=re.compile(r"Browse all \d+ projects"))
    expect(browse).to_contain_text(f"Browse all {len(projects)} projects")
    browse.click()
    expect(page).to_have_url(re.compile(r"/projects$"))
    expect(page.locator("#project-grid .pr-project")).to_have_count(len(projects))
    expect(page.get_by_role("navigation", name="Main navigation").get_by_role("link", name="Projects", exact=True)).to_have_attribute("aria-current", "page")


def test_unrelated_mutations_preserve_link_focus_and_contact_fields(page):
    grid = open_examples(page)
    project = grid.locator('a[data-project="irish-today"]')
    panel = page.locator("#guided-flow")
    panel.get_by_role("button", name="Add context (optional)").click()
    fields = panel.locator(".bos-context-fields:not(.bos-context-copy-panel) textarea")
    fields.first.fill("Preserve this project brief")
    project.focus()
    page.evaluate("""() => {
        window.__firstExample = document.querySelector('#guided-flow .bos-flow-example-grid > :first-child');
        const node = document.createElement('span');
        node.dataset.showcaseTest = 'true';
        document.querySelector('.boston').append(node);
        node.remove();
    }""")
    page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
    assert page.evaluate("window.__firstExample === document.querySelector('#guided-flow .bos-flow-example-grid > :first-child')")
    expect(project).to_be_focused()
    expect(fields.first).to_have_value("Preserve this project brief")
    expect(grid.locator(".bos-flow-example-card")).to_have_count(len(FEATURED_PROJECT_IDS))
    expect(panel.get_by_role("link", name=re.compile(r"Browse all \d+ projects"))).to_have_count(1)


@pytest.mark.parametrize("width,height,theme", [(1440, 1000, "dark"), (768, 1024, "dark"), (390, 844, "dark"), (320, 720, "light"), (1440, 1000, "light")])
def test_showcase_reflows_without_clipped_text(page, width, height, theme):
    page.set_viewport_size({"width": width, "height": height})
    page.evaluate("theme => localStorage.setItem('holtsnider-theme', theme)", theme)
    page.reload(wait_until="networkidle")
    grid = open_examples(page)
    grid.scroll_into_view_if_needed()
    # Capture before layout assertions so failures still have visual evidence.
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
    card = grid.locator('[data-project="irish-today"]')
    assert not clipped_text(card)
    # Negative control: the measurement must reject real clipped copy rather
    # than merely ignoring every overflow after excluding decorative artwork.
    page.add_style_tag(content="""
        #guided-flow [data-project="irish-today"] .bos-example-description {
            white-space: nowrap !important;
            overflow-wrap: normal !important;
        }
    """)
    assert clipped_text(card)
