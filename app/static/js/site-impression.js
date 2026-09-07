document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".boston");
    if (!page) return;

    const setText = (selector, text, root = page) => {
        const node = root.querySelector(selector);
        if (node) node.textContent = text;
    };

    const startPanel = page.querySelector(".bos-start-panel");
    const setStartDescription = (selector, text) => {
        const card = startPanel?.querySelector(selector);
        if (card) setText("p", text, card);
    };

    // First 30 seconds: say plainly what Holtsnider Tech is useful for.
    setText(".bos-hero .bos-kicker", "Solve messy technical problems. Build useful things.");
    setText(
        ".bos-hero .bos-lede",
        "I untangle technical problems when they’re stuck, unclear, or crossing too many layers — and turn rough ideas into working systems. Pick the closest starting point below."
    );

    setStartDescription(
        ".bos-choice-solve",
        "Something broke, keeps breaking, or is harder than it should be."
    );
    setStartDescription(
        ".bos-choice-opportunity",
        "You have an idea, workflow, tool, or process worth making real."
    );
    setStartDescription(
        ".bos-choice-experience",
        "See the systems work, engineering background, and public projects."
    );
    setStartDescription(
        ".bos-choice-not-sure",
        "Something feels off or stuck, but you do not know what to call it yet."
    );

    // Make Experience read like evidence, not a resume section.
    setText("#experience .bos-section-heading h2", "What I actually work on");
    setText(
        "#experience .bos-section-heading .bos-section-text",
        "Reliability, infrastructure, automation, troubleshooting, and the part that often matters most: turning technical detail into a decision somebody can actually use."
    );

    // Give the public portfolio a hierarchy instead of treating every card equally.
    setText("#work .bos-section-heading h2", "Selected work you can open");
    setText(
        "#work .bos-section-heading .bos-section-text",
        "The first two are the clearest public examples of how I work: take something fuzzy, build enough of it to test for real, then keep improving it. The others show how the same approach adapts to different problems and audiences."
    );

    const workCards = Array.from(page.querySelectorAll("#work .bos-work-card"));
    const workLabels = [
        "Featured · live build",
        "Featured · working prototype",
        "Interactive prototype",
        "Adapted concept"
    ];
    workCards.forEach((card, index) => {
        const label = card.querySelector(".bos-card-label");
        if (label && workLabels[index]) label.textContent = workLabels[index];
    });

    setText("#case-shapes .bos-section-heading h2", "The work that does not fit in a public demo");
    setText(
        "#case-shapes .bos-section-heading .bos-section-text",
        "A lot of the heavier engineering work lives in customer systems, labs, incidents, and internal tooling. These are representative examples without pretending I can publish the underlying work."
    );

    // End every path like a conversation with a person, not a consulting intake form.
    setText("#contact h2", "Send me the messy version.");
    const contactParagraphs = Array.from(page.querySelectorAll("#contact > div > p"));
    if (contactParagraphs[0]) {
        contactParagraphs[0].textContent = "Tell me what broke, what you are trying to build, or the decision you cannot get unstuck. It does not need to be polished.";
    }
    if (contactParagraphs[1]) {
        contactParagraphs[1].textContent = "I will get the system and constraints straight, then help narrow the next useful move.";
    }
    setText(
        "#contact .bos-contact-note",
        "Problem, project, role, or ‘I’m not sure yet’ are all valid starting points."
    );
});
