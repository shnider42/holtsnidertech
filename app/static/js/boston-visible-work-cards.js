document.addEventListener("DOMContentLoaded", () => {
    const passageCard = document.querySelector(".boston .bos-project-site");

    if (passageCard) {
        passageCard.classList.remove("bos-project-site");
        passageCard.classList.add("bos-project-passage");
        passageCard.setAttribute("href", "https://tim-today.onrender.com/");
        passageCard.setAttribute("target", "_blank");
        passageCard.setAttribute("rel", "noopener noreferrer");

        const label = passageCard.querySelector(".bos-card-label");
        const title = passageCard.querySelector("h3");
        const body = passageCard.querySelector("p");
        const action = passageCard.querySelector(".bos-card-action");

        if (label) {
            label.textContent = "Daily Flyer";
        }

        if (title) {
            title.textContent = "Your Passage";
        }

        if (body) {
            body.textContent = "A reflective daily-page implementation shaped around personal passages, warm presentation, and reusable content structure.";
        }

        if (action) {
            action.textContent = "View site";
        }
    }

    const projectExamples = [
        {
            title: "Irish Today",
            body: "Daily Flyer family: a repeatable daily culture page with themed presentation.",
            href: "https://daily-flyer.onrender.com/",
            theme: "irish",
            family: "Daily Flyer",
        },
        {
            title: "Your Passage",
            body: "Daily Flyer family: a personalized daily-page concept grown from the same engine.",
            href: "https://tim-today.onrender.com/",
            theme: "passage",
            family: "Daily Flyer",
        },
        {
            title: "Loudsource",
            body: "Daily Flyer family: an interactive vote-to-queue music concept.",
            href: "/static/demos/loudsource-vote.html",
            theme: "loudsource",
            family: "Daily Flyer",
        },
        {
            title: "Jiporady",
            body: "Custom browser game / living-room trivia concept.",
            href: "/static/demos/jiporady.html",
            theme: "jiporady",
        },
        {
            title: "Career Compass",
            body: "Career-direction tooling / structured job-search thinking.",
            href: "#contact",
            theme: "career-compass",
        },
        {
            title: "Grepper",
            body: "Job-search scraping, parsing, ranking, and demo workflow.",
            href: "/static/demos/grepper.html",
            theme: "grepper",
        },
    ];

    const buildProjectCard = (example) => {
        const card = document.createElement("a");
        card.className = `bos-flow-example-card bos-project-card bos-project-${example.theme}`;
        card.dataset.project = example.theme;
        card.href = example.href;

        if (example.href.startsWith("http")) {
            card.target = "_blank";
            card.rel = "noopener noreferrer";
        }

        const family = example.family ? `<em>${example.family}</em>` : "";
        card.innerHTML = `${family}<strong>${example.title}</strong><span>${example.body}</span>`;
        return card;
    };

    const syncProgressiveProjectCards = () => {
        const panel = document.querySelector(".boston .bos-guided-flow.is-active");
        if (!panel || panel.dataset.activeFlow !== "opportunity") {
            return;
        }

        panel.querySelectorAll(".bos-flow-example-card").forEach((card) => {
            const title = card.querySelector("strong")?.textContent?.trim();
            if (title === "Your Passage") {
                card.setAttribute("href", "https://tim-today.onrender.com/");
                card.setAttribute("target", "_blank");
                card.setAttribute("rel", "noopener noreferrer");
            }
        });

        if (panel.dataset.activeContext !== "improve-existing") {
            return;
        }

        const exampleGrid = panel.querySelector(".bos-flow-example-grid");
        if (!exampleGrid || exampleGrid.dataset.syncedProjectCards === "true") {
            return;
        }

        exampleGrid.textContent = "";
        projectExamples.forEach((example) => exampleGrid.appendChild(buildProjectCard(example)));
        exampleGrid.dataset.syncedProjectCards = "true";
    };

    const observer = new MutationObserver(() => syncProgressiveProjectCards());
    observer.observe(document.body, { childList: true, subtree: true });
    syncProgressiveProjectCards();
});
