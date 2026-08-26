document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".boston");
    if (!page) return;

    const browseSections = ["#experience", "#work", "#case-shapes"]
        .map((selector) => page.querySelector(selector))
        .filter(Boolean);

    const setCardCopy = (selector, title, body, action) => {
        const card = page.querySelector(selector);
        if (!card) return;

        const titleNode = card.querySelector("h3");
        const bodyNode = card.querySelector("p");
        const actionNode = card.querySelector(".bos-choice-action");

        if (titleNode) titleNode.textContent = title;
        if (bodyNode) bodyNode.textContent = body;
        if (actionNode) actionNode.textContent = action;
    };

    const setDrawerCopy = (selector, items, nextText) => {
        const card = page.querySelector(selector);
        if (!card) return;

        const drawerId = card.querySelector("[data-flow-drawer]")?.dataset.flowDrawer;
        if (!drawerId) return;

        document.querySelectorAll(`[data-flow-drawer="${drawerId}"]`).forEach((drawer) => {
            const listItems = drawer.querySelectorAll("li");
            listItems.forEach((item, index) => {
                if (items[index]) item.textContent = items[index];
            });

            const next = drawer.querySelector("ul + span");
            if (next) next.textContent = nextText;
        });
    };

    const hideBrowseSections = () => {
        browseSections.forEach((section) => {
            section.hidden = true;
            section.classList.add("bos-runtime-hidden");
        });
    };

    const showBrowseSections = () => {
        browseSections.forEach((section) => {
            section.hidden = false;
            section.classList.remove("bos-runtime-hidden");
        });
    };

    const clearGuidedFlow = () => {
        const panel = page.querySelector("#guided-flow");
        if (!panel) return;

        panel.classList.remove("is-active");
        panel.removeAttribute("data-active-flow");
        panel.removeAttribute("data-active-context");
        panel.textContent = "";
    };

    // Keep the visual system, but make the four entry points read like visitor intents.
    setCardCopy(
        ".bos-choice-solve",
        "Fix a Problem",
        "Something is broken, unreliable, confusing, or wasting time.",
        "Start troubleshooting"
    );
    setCardCopy(
        ".bos-choice-opportunity",
        "Build or Improve",
        "You have an idea, workflow, site, tool, or process you want to make better.",
        "Explore the idea"
    );
    setCardCopy(
        ".bos-choice-experience",
        "Experience & Work",
        "See the engineering background, public projects, and systems work behind Holtsnider Tech.",
        "Browse experience"
    );
    setCardCopy(
        ".bos-choice-not-sure",
        "Not Sure Yet",
        "You know something needs attention, but you are not sure what kind of problem it is yet.",
        "Start with what you know"
    );

    setDrawerCopy(
        ".bos-choice-solve",
        ["Something just broke", "A problem keeps coming back"],
        "Start with the problem"
    );
    setDrawerCopy(
        ".bos-choice-opportunity",
        ["Build something new", "Improve something that exists"],
        "Start with the idea"
    );
    setDrawerCopy(
        ".bos-choice-experience",
        ["Engineering background", "Public projects", "Enterprise systems", "Current technical work"],
        "Browse without a questionnaire"
    );
    setDrawerCopy(
        ".bos-choice-not-sure",
        ["The situation is fuzzy", "The next step is unclear", "You do not know what to call it"],
        "Start with the messy version"
    );

    const experienceCard = page.querySelector(".bos-choice-experience");
    if (experienceCard) {
        experienceCard.setAttribute("href", "#experience");
        experienceCard.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            clearGuidedFlow();
            page.querySelectorAll(".bos-choice-card").forEach((card) => card.classList.remove("is-selected"));
            experienceCard.classList.add("is-selected");
            showBrowseSections();

            window.requestAnimationFrame(() => {
                page.querySelector("#experience")?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }, { capture: true });
    }

    // Guided paths should stay focused; hide browsing sections again when returning to them.
    [".bos-choice-solve", ".bos-choice-opportunity", ".bos-choice-not-sure"].forEach((selector) => {
        page.querySelector(selector)?.addEventListener("click", hideBrowseSections, { capture: true });
    });

    const normalizeGuidedCopy = () => {
        const panel = page.querySelector("#guided-flow");
        if (!panel) return;

        const eyebrow = panel.querySelector(".bos-guided-flow-eyebrow");
        if (eyebrow?.textContent === "Context layer") eyebrow.textContent = "Choose the closest fit";

        const heading = panel.querySelector(".bos-guided-flow-head h3");
        const intro = panel.querySelector(".bos-guided-flow-intro");

        if (heading?.textContent === "Discovery path still being shaped") {
            heading.textContent = "What feels unclear?";
            if (intro) {
                intro.textContent = "You do not need the right category yet. Start with what changed, what feels stuck, or what decision you are trying to make.";
            }
        }

        if (intro?.textContent === "Pick the closest starting point. This is the Opportunity Engineering lane.") {
            intro.textContent = "Pick the closest starting point. The idea can still be rough; we can narrow it from there.";
        }
    };

    const observer = new MutationObserver(normalizeGuidedCopy);
    observer.observe(page, { childList: true, subtree: true });
    normalizeGuidedCopy();
});
