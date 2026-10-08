document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".boston");
    if (!page) return;

    const passageCard = page.querySelector(".bos-project-site");
    if (passageCard) {
        passageCard.classList.replace("bos-project-site", "bos-project-passage");
        passageCard.href = "https://tim-today.onrender.com/";
        passageCard.target = "_blank";
        passageCard.rel = "noopener noreferrer";
        const copy = {
            ".bos-card-label": "Daily Flyer",
            "h3": "Your Passage",
            "p": "A reflective daily-page implementation shaped around personal passages, warm presentation, and reusable content structure.",
            ".bos-card-action": "View site",
        };
        Object.entries(copy).forEach(([selector, text]) => {
            const node = passageCard.querySelector(selector);
            if (node) node.textContent = text;
        });
    }

    // The server embeds the same local JSON used by /, /projects and /technical.
    // No network request, copied URL list, or async race with the guided flow.
    const catalogue = document.getElementById("project-catalogue");
    if (!catalogue) return;
    const projectExamples = JSON.parse(catalogue.textContent);

    const element = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    };

    const buildProjectCard = (example) => {
        const card = element(example.href ? "a" : "details",
            `bos-flow-example-card bos-project-card bos-project-${example.theme}`);
        card.dataset.project = example.theme;
        card.dataset.projectFamily = example.family || "Independent";
        let content = card;

        if (example.href) {
            card.href = example.href;
            if (example.href.startsWith("https://")) {
                card.target = "_blank";
                card.rel = "noopener noreferrer";
            }
        } else {
            card.dataset.projectPreview = "true";
            content = element("summary", "bos-example-summary");
            card.appendChild(content);
        }

        const family = example.family ? `${example.family} · ` : "";
        content.append(
            element("em", "bos-example-category", `${family}${example.category}`),
            element("strong", "bos-example-title", example.title),
            element("span", "bos-example-description", example.body),
            element("span", "bos-example-action", example.action || "About this build"),
        );
        if (!example.href) {
            card.appendChild(element("p", "bos-example-notes", example.details));
            card.appendChild(element("p", "bos-example-link-note",
                "Build overview — a public launch link is not connected here yet."));
        }
        return card;
    };

    const syncProgressiveProjectCards = () => {
        const panel = page.querySelector('.bos-guided-flow.is-active[data-active-flow="opportunity"]');
        if (!panel) return;

        panel.querySelectorAll("a.bos-flow-example-card").forEach((card) => {
            if (card.querySelector("strong")?.textContent.trim() === "Your Passage") {
                card.href = "https://tim-today.onrender.com/";
                card.target = "_blank";
                card.rel = "noopener noreferrer";
            }
        });

        if (!["new-build", "improve-existing"].includes(panel.dataset.activeContext)) return;
        const grid = panel.querySelector(".bos-flow-example-grid");
        if (!grid || grid.dataset.projectShowcase === "dfe-v1") return;

        // Mark before writing: unrelated mutations must not reset inputs or focus.
        grid.dataset.projectShowcase = "dfe-v1";
        grid.dataset.syncedProjectCards = "true";
        const intro = element("p", "bos-project-showcase-intro");
        intro.dataset.projectShowcaseIntro = "true";
        intro.append(
            element("strong", "", "Different ideas. One reusable foundation."),
            element("span", "", "The Daily Flyer Engine (DFE) powers the marked projects below. Other tools and demos round out the collection. Open a project to explore it."),
        );
        grid.before(intro);
        grid.replaceChildren(...projectExamples.map(buildProjectCard));
    };

    const observer = new MutationObserver(syncProgressiveProjectCards);
    observer.observe(page, { childList: true, subtree: true });
    syncProgressiveProjectCards();
});
