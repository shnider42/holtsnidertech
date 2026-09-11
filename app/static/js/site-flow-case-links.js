document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".boston");
    if (!page) return;

    const startPanel = page.querySelector(".bos-start-panel");
    const guidedFlow = page.querySelector("#guided-flow");
    const caseCards = Array.from(page.querySelectorAll("#case-shapes .bos-case-card"));

    const wireToGuidedPath = (cardIndex, startSelector, pathKey) => {
        const card = caseCards[cardIndex];
        const start = startPanel?.querySelector(startSelector);
        if (!card || !start) return;

        card.href = "#guided-flow";
        card.dataset.clarityGuidedPath = pathKey;
        card.addEventListener("click", (event) => {
            event.preventDefault();
            start.click();
            window.requestAnimationFrame(() => {
                guidedFlow?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });
    };

    // The original case cards pointed to #solve / #opportunity, but those old
    // static sections are removed by the current Boston runtime. Route the cards
    // into the actual guided flows instead of leaving dead anchors behind.
    wireToGuidedPath(2, ".bos-choice-solve", "solve");
    wireToGuidedPath(3, ".bos-choice-opportunity", "opportunity");
});
