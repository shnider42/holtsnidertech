document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".boston");
    if (!page) return;

    const CONTACT_EMAIL = "chris@holtsnidertech.com";
    const browseSections = ["#experience", "#work", "#case-shapes"]
        .map((selector) => page.querySelector(selector))
        .filter(Boolean);

    const setText = (selector, text) => {
        const node = page.querySelector(selector);
        if (node) node.textContent = text;
    };

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

    const normalizeBrowseCopy = () => {
        setText("#experience .bos-section-heading h2", "Engineering background");
        setText(
            "#experience .bos-section-heading .bos-section-text",
            "The through-line is practical systems work: reliability, infrastructure, automation, troubleshooting, and translating technical detail into decisions people can act on."
        );

        const experienceCards = page.querySelectorAll("#experience .bos-experience-grid .bos-card");
        const experienceCopy = [
            [
                "Reliability when systems matter",
                "Incident response, production-impacting failures, storage reliability, replication quality, data integrity, and long-term stability work."
            ],
            [
                "Hands-on infrastructure and labs",
                "Rack-level systems, switches, VLANs, Fibre Channel, Linux, VMware, and realistic environments built to reproduce difficult problems."
            ],
            [
                "Automation that removes repeat work",
                "Python, APIs, Terraform, GitHub workflows, CLI tools, and repeatable processes that make technical work easier to operate and review."
            ],
            [
                "Technical depth without the fog",
                "Turning low-level engineering detail into useful direction for customers, engineers, vendors, stakeholders, and non-specialists."
            ]
        ];

        experienceCards.forEach((card, index) => {
            const copy = experienceCopy[index];
            if (!copy) return;
            const heading = card.querySelector("h3");
            const body = card.querySelector("p");
            if (heading) heading.textContent = copy[0];
            if (body) body.textContent = copy[1];
        });

        const experiencePrimary = page.querySelector("#experience .bos-actions .bos-btn");
        if (experiencePrimary) experiencePrimary.textContent = "Talk about a role or project";

        setText("#work .bos-section-heading h2", "Projects you can actually open");
        setText(
            "#work .bos-section-heading .bos-section-text",
            "Public examples of how I turn a loose idea into something usable: different audiences, different problems, and enough working product to evaluate the idea for real."
        );

        page.querySelectorAll("#work .bos-work-card").forEach((card) => {
            const title = card.querySelector("h3")?.textContent?.trim();
            const body = card.querySelector("p");
            if (!body) return;

            if (title === "Irish Today") {
                body.textContent = "A live daily culture page that turns a repeatable content pipeline into a polished, themed experience.";
            } else if (title === "Grepper") {
                body.textContent = "A job-search tool that parses Workday postings, ranks results, and packages the workflow into a usable browser-style demo.";
            } else if (title === "LoudSource Voting Flyer") {
                body.textContent = "An interactive voting prototype that turns a static content concept into a participatory experience.";
            } else if (title === "Your Passage") {
                body.textContent = "A personalized daily-page concept built from the same reusable content engine, adapted to a very different audience and tone.";
            }
        });

        setText("#case-shapes .bos-section-heading h2", "Professional work behind the portfolio");
        setText(
            "#case-shapes .bos-section-heading .bos-section-text",
            "Not every useful project can be linked publicly. These are representative shapes of the enterprise, infrastructure, troubleshooting, and automation work behind the public demos."
        );
    };

    const normalizeContactCopy = () => {
        setText("#contact h2", "Tell me what you're working through.");

        const paragraphs = page.querySelectorAll("#contact > div > p");
        if (paragraphs[0]) {
            paragraphs[0].textContent = "You do not need a polished brief. Send the broken thing, the rough idea, the decision you are stuck on, or whatever context you already have.";
        }
        if (paragraphs[1]) {
            paragraphs[1].textContent = "I start by getting the system and constraints straight, then narrow the smallest useful next move — whether that is troubleshooting, automation, a prototype, or simply a clearer decision.";
        }

        const contactPrimary = page.querySelector("#contact .bos-actions .bos-btn");
        if (contactPrimary) contactPrimary.textContent = "Email Chris";

        const contactSecondary = page.querySelector("#contact .bos-actions .bos-btn.alt");
        if (contactSecondary) contactSecondary.textContent = "Back to starting points";

        setText(
            "#contact .bos-contact-note",
            "Project, role-fit, troubleshooting, or “I’m not sure yet” are all valid starting points."
        );
    };

    const flowLabel = (pathKey) => {
        const labels = {
            solve: "Fix a problem",
            opportunity: "Build or improve something",
            discovery: "Not sure where to start"
        };
        return labels[pathKey] || "General inquiry";
    };

    const directEmailHref = (pathKey, contextTitle = "", notes = []) => {
        const subjects = {
            solve: "Holtsnider Tech - problem to solve",
            opportunity: "Holtsnider Tech - idea or improvement",
            discovery: "Holtsnider Tech - not sure where to start"
        };
        const subject = subjects[pathKey] || "Holtsnider Tech inquiry";
        const lines = [
            "Hi Chris,",
            "",
            "I came through the Holtsnider Tech site and wanted to reach out.",
            `Starting point: ${flowLabel(pathKey)}`
        ];

        if (contextTitle) lines.push(`Closest fit: ${contextTitle}`);

        const usefulNotes = notes.filter((item) => item.value.trim());
        if (usefulNotes.length) {
            lines.push("", "A little context:");
            usefulNotes.forEach((item) => lines.push(`${item.label}: ${item.value.trim()}`));
        }

        lines.push("", "Here's the messy version:", "");
        return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    };

    const collapseSelectedGuidedCard = () => {
        const selected = page.querySelector(".bos-start-panel .bos-choice-card.is-selected");
        if (selected) selected.click();
    };

    const ensureStartOverButton = (panel) => {
        if (!panel?.dataset.activeFlow || panel.dataset.activeContext) return;
        const header = panel.querySelector(".bos-guided-flow-head");
        if (!header || header.querySelector("[data-clarity-start-over]")) return;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "bos-flow-back";
        button.dataset.clarityStartOver = "true";
        button.textContent = "Back to starting points";
        button.addEventListener("click", collapseSelectedGuidedCard);
        header.appendChild(button);
    };

    const enhanceGuidedDetail = () => {
        const panel = page.querySelector("#guided-flow.is-active[data-active-context]");
        if (!panel) return;

        const fields = panel.querySelector(".bos-context-fields:not(.bos-context-copy-panel)");
        const copyPanel = panel.querySelector(".bos-context-copy-panel");
        const action = panel.querySelector(".bos-guided-flow-action");
        if (!fields || !action || fields.dataset.clarityEnhanced === "true") return;

        fields.dataset.clarityEnhanced = "true";
        fields.classList.add("bos-runtime-hidden");
        fields.setAttribute("aria-label", "Optional additional context");
        copyPanel?.classList.add("bos-runtime-hidden");

        const actionText = action.querySelector("p");
        if (actionText) {
            actionText.textContent = "You can email now with no form. Add a little context only if it would make the first conversation easier.";
        }

        const legacyNoteButton = action.querySelector(".bos-flow-mailto");
        legacyNoteButton?.classList.add("bos-runtime-hidden");

        const contextTitle = panel.querySelector(".bos-guided-flow-head h3")?.textContent?.trim() || "";
        const controls = document.createElement("div");
        controls.className = "bos-actions";
        controls.style.marginTop = "0";

        const emailLink = document.createElement("a");
        emailLink.className = "bos-btn";
        emailLink.textContent = "Email Chris";

        const collectNotes = () => Array.from(fields.querySelectorAll(".bos-context-field")).map((field) => ({
            label: field.querySelector("span")?.textContent?.trim() || "Note",
            value: field.querySelector("textarea")?.value || ""
        }));

        const updateEmailHref = () => {
            emailLink.href = directEmailHref(panel.dataset.activeFlow, contextTitle, collectNotes());
        };
        updateEmailHref();
        fields.querySelectorAll("textarea").forEach((textarea) => textarea.addEventListener("input", updateEmailHref));

        const detailToggle = document.createElement("button");
        detailToggle.type = "button";
        detailToggle.className = "bos-btn alt";
        detailToggle.textContent = "Add context (optional)";
        detailToggle.setAttribute("aria-expanded", "false");

        detailToggle.addEventListener("click", () => {
            const willOpen = fields.classList.contains("bos-runtime-hidden");
            fields.classList.toggle("bos-runtime-hidden", !willOpen);
            detailToggle.setAttribute("aria-expanded", String(willOpen));
            detailToggle.textContent = willOpen ? "Hide optional context" : "Add context (optional)";
            if (willOpen) fields.querySelector("textarea")?.focus();
        });

        controls.append(emailLink, detailToggle);
        action.appendChild(controls);

        const back = panel.querySelector(".bos-flow-back");
        if (panel.dataset.activeFlow === "discovery" && back && back.dataset.clarityDiscoveryBack !== "true") {
            back.dataset.clarityDiscoveryBack = "true";
            back.textContent = "Back to starting points";
            back.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();
                collapseSelectedGuidedCard();
            }, { capture: true });
        }
    };

    const openExperienceBrowse = () => {
        const experienceCard = page.querySelector(".bos-choice-experience");
        clearGuidedFlow();
        page.querySelectorAll(".bos-choice-card").forEach((card) => card.classList.remove("is-selected"));
        experienceCard?.classList.add("is-selected");
        showBrowseSections();
        normalizeBrowseCopy();

        try {
            window.history.replaceState(null, "", "#experience");
        } catch (error) {
            // Ignore history failures.
        }

        window.requestAnimationFrame(() => {
            page.querySelector("#experience")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    };

    const installHeaderShortcuts = () => {
        const nav = page.querySelector(".bos-links");
        if (!nav) return;

        nav.querySelectorAll("[data-clarity-nav]").forEach((item) => item.remove());
        if (!window.matchMedia("(min-width: 851px)").matches) return;

        const experienceLink = document.createElement("a");
        experienceLink.href = "#experience";
        experienceLink.dataset.clarityNav = "experience";
        experienceLink.textContent = "Experience & Work";
        experienceLink.addEventListener("click", (event) => {
            event.preventDefault();
            openExperienceBrowse();
        });

        const contactLink = document.createElement("a");
        contactLink.href = "#contact";
        contactLink.dataset.clarityNav = "contact";
        contactLink.textContent = "Contact";
        contactLink.addEventListener("click", (event) => {
            event.preventDefault();
            try {
                window.history.replaceState(null, "", "#contact");
            } catch (error) {
                // Ignore history failures.
            }
            page.querySelector("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });

        nav.append(experienceLink, contactLink);
    };

    // Keep the visual system, but make the first screen understandable to a cold visitor.
    setText(".bos-hero .bos-kicker", "Technical problem solving + project building");
    setText(
        ".bos-hero .bos-lede",
        "I help untangle technical problems, improve systems and workflows, and turn rough ideas into working projects. Pick the closest starting point below."
    );

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
            openExperienceBrowse();
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

        // Discovery currently has one possible context. Do not make the visitor
        // click a second card merely to reach the only available next step.
        if (panel.classList.contains("is-active")
            && panel.dataset.activeFlow === "discovery"
            && !panel.dataset.activeContext
            && panel.dataset.clarityAutoAdvanced !== "true") {
            const options = panel.querySelectorAll(".bos-guided-flow-option-button");
            if (options.length === 1) {
                panel.dataset.clarityAutoAdvanced = "true";
                window.requestAnimationFrame(() => options[0].click());
                return;
            }
        }

        ensureStartOverButton(panel);
        enhanceGuidedDetail();
    };

    const observer = new MutationObserver(normalizeGuidedCopy);
    observer.observe(page, { childList: true, subtree: true });
    normalizeGuidedCopy();
    normalizeBrowseCopy();
    normalizeContactCopy();
    installHeaderShortcuts();

    window.addEventListener("resize", installHeaderShortcuts);
});
