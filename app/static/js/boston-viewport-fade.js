document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".boston");
    if (!page) return;

    const choiceGrid = page.querySelector(".bos-choice-grid");
    if (!choiceGrid) return;

    const defaultItems = [
        ["solve", "Solve", "Something is broken, recurring, risky, unclear, or stuck."],
        ["launch", "Launch Idea", "A loose idea, workflow, prototype, or improvement needs shape."],
        ["experience", "HT Experience", "Background, proof, visible work, or role-fit context."],
        ["discovery", "Start a Discovery", "The situation is real, but the category is not obvious yet."]
    ];

    const appendTextNode = (parent, tagName, className, text) => {
        const node = document.createElement(tagName);
        if (className) node.className = className;
        node.textContent = text;
        parent.appendChild(node);
        return node;
    };

    const renderDefaultContext = () => {
        let panel = page.querySelector(".bos-default-context");
        if (panel) return panel;

        panel = document.createElement("section");
        panel.className = "bos-default-context";
        panel.setAttribute("aria-label", "Default context layer");

        const head = document.createElement("div");
        head.className = "bos-default-context-head";
        appendTextNode(head, "p", "bos-default-context-eyebrow", "Context layer");
        appendTextNode(head, "h3", "", "Pick the closest starting point.");
        appendTextNode(head, "p", "", "Each card opens a short path: what kind of situation this is, what context would help, and what a useful first move could look like.");

        const grid = document.createElement("div");
        grid.className = "bos-default-context-grid";
        defaultItems.forEach(([key, title, body]) => {
            const card = document.createElement("article");
            card.className = "bos-default-context-card";
            card.dataset.contextKey = key;
            appendTextNode(card, "strong", "", title);
            appendTextNode(card, "span", "", body);
            grid.appendChild(card);
        });

        panel.appendChild(head);
        panel.appendChild(grid);
        appendTextNode(panel, "p", "bos-default-context-note", "Start rough. The point is to choose the closest shape, not the perfect category.");

        choiceGrid.insertAdjacentElement("afterend", panel);
        return panel;
    };

    const syncDefaultContext = () => {
        const panel = renderDefaultContext();
        const activeGuidedFlow = page.querySelector(".bos-guided-flow.is-active[data-active-flow]");
        const selectedCard = page.querySelector(".bos-choice-card.is-selected");
        const shouldHide = Boolean(activeGuidedFlow || selectedCard);

        if (panel.hidden !== shouldHide) panel.hidden = shouldHide;
        panel.classList.toggle("is-hidden", shouldHide);
    };

    renderDefaultContext();
    syncDefaultContext();

    page.querySelectorAll(".bos-start-panel .bos-choice-card").forEach((card) => {
        card.addEventListener("click", () => {
            window.requestAnimationFrame(syncDefaultContext);
        });
    });

    const startPanel = page.querySelector(".bos-start-panel");
    if (!startPanel) return;

    const observer = new MutationObserver(() => syncDefaultContext());
    observer.observe(startPanel, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "data-active-flow", "data-active-context", "hidden"]
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const boston = document.querySelector(".boston");

    if (!boston || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const targets = [
        ...boston.querySelectorAll([
            ".bos-section-heading",
            ".bos-start-panel",
            ".bos-operating-line",
            ".bos-process-flow",
            ".bos-path-grid",
            ".bos-experience-grid",
            ".bos-stack-grid",
            ".bos-work-grid",
            ".bos-case-grid",
            ".bos-proof-card",
            ".bos-portfolio-detail",
            ".bos-contact"
        ].join(", "))
    ];

    targets.forEach((target) => target.classList.add("bos-viewport-fade"));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const target = entry.target;

                if (entry.isIntersecting) {
                    target.classList.add("is-visible");
                    target.classList.remove("is-past");
                    return;
                }

                target.classList.remove("is-visible");

                if (entry.boundingClientRect.top < 0) {
                    target.classList.add("is-past");
                } else {
                    target.classList.remove("is-past");
                }
            });
        },
        {
            threshold: 0.08,
            rootMargin: "18% 0px 18% 0px"
        }
    );

    targets.forEach((target) => observer.observe(target));
});
