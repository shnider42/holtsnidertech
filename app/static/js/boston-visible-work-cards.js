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

    // One catalogue for both Build/Improve paths. Branch provenance and link
    // verification notes live in docs/DFE_SHOWCASE.md, not in the visitor UI.
    // An absent href deliberately renders an expandable overview, not a dead link.
    const projectExamples = [
        {
            title: "Irish Today", theme: "irish", family: "DFE", category: "Daily culture",
            body: "Irish history, language, and culture in a repeatable daily page.",
            href: "https://daily-flyer.onrender.com/", action: "Open site",
        },
        {
            title: "Your Passage", theme: "passage", family: "DFE", category: "Personal publishing",
            body: "A quieter, personalized daily reading experience from the same engine.",
            href: "https://tim-today.onrender.com/", action: "Open site",
        },
        {
            title: "Loudsource", theme: "loudsource", family: "DFE", category: "Music & participation",
            body: "Vote tracks up the queue and turn a music page into a shared experience.",
            href: "/static/demos/loudsource-vote.html", action: "Try voting demo",
        },
        {
            title: "Garage Journey", theme: "garage", family: "DFE", category: "Guides & workshops",
            body: "Vehicle-specific workshops, repair references, and a growing guitar workbench.",
            details: "Start with a vehicle or instrument, then explore its workshop, diagrams, manuals, and useful reference sources. The car-to-guitar expansion explores how the same guide structure can serve a different kind of owner.",
        },
        {
            title: "DSL", theme: "dsl", family: "DFE", category: "WWII tactics",
            body: "Turn-based battles with shared matches, co-op play, and fog of war.",
            details: "Double Secret Probation Squad Leader turns the engine toward an interactive hex-map game: move units, manage actions, and coordinate with another player. Maps, AI opponents, and rules are still evolving.",
        },
        {
            title: "Bug Tracker", theme: "bug-tracker", family: "DFE", category: "Evidence & sources",
            body: "Hell Let Loose Vietnam issues, with official updates separated from player reports.",
            href: "https://hllv-bug-track.onrender.com/", action: "Open bug tracker",
        },
        {
            title: "Soph(more) Slump(?)", theme: "soph-slump", family: "DFE", category: "Sports comparisons",
            body: "Explore first- and second-year performance in football, baseball, and bowling.",
            details: "Compare players, switch presets, and choose how much statistical detail to show. This is a historical-data explorer, not a live sports feed or a claim that every player follows the same second-year pattern.",
        },
        {
            title: "Galaxy Granite", theme: "galaxy-granite", family: "DFE", category: "Business publishing",
            body: "A simpler countertop-business journal: useful articles, project notes, and a clear next step.",
            details: "A business-site prototype with rotating homeowner topics, previous/next reading, and a clear quote-to-installation process. It explores a focused journal rather than reproducing an entire company website.",
        },
        {
            title: "Jiporady", theme: "jiporady", category: "Browser game",
            body: "A living-room trivia board built for playing together.",
            href: "/static/demos/jiporady.html", action: "Try trivia demo",
        },
        {
            title: "Career Compass", theme: "career-compass", category: "Career tooling",
            body: "Structured job-search thinking and clearer career direction.",
            href: "#contact", action: "Discuss the idea",
        },
        {
            title: "Grepper", theme: "grepper", category: "Job-search workflow",
            body: "Compare job-posting search with profile-based parsing and ranking.",
            href: "/static/demos/grepper.html", action: "Try Grepper demo",
        },
    ];

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

        // Retain the existing link repair even for other opportunity contexts.
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

        // Mark before writing: later observer callbacks must not rebuild cards,
        // close an overview, lose keyboard focus, or touch the contact fields.
        grid.dataset.projectShowcase = "dfe-v1";
        grid.dataset.syncedProjectCards = "true";
        const intro = element("p", "bos-project-showcase-intro");
        intro.dataset.projectShowcaseIntro = "true";
        intro.append(
            element("strong", "", "Different ideas. One reusable foundation."),
            element("span", "", "The Daily Flyer Engine (DFE) powers the marked projects below. Other tools and demos round out the collection. Open a link, or expand a build overview."),
        );
        grid.before(intro);
        grid.replaceChildren(...projectExamples.map(buildProjectCard));
    };

    // The guided panel is created/replaced by the existing flow controller.
    // Observe only this page, not document.body; do not observe our attributes.
    const observer = new MutationObserver(syncProgressiveProjectCards);
    observer.observe(page, { childList: true, subtree: true });
    syncProgressiveProjectCards();
});
