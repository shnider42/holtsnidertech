document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".boston");
    if (!page) return;

    const CONTACT_EMAIL = "chris@holtsnidertech.com";
    let discoveryAdvanceQueued = false;

    const qs = (selector, root = page) => root.querySelector(selector);
    const qsa = (selector, root = page) => Array.from(root.querySelectorAll(selector));

    const browseSections = ["#experience", "#work", "#case-shapes"]
        .map((selector) => qs(selector))
        .filter(Boolean);

    const setText = (selector, text, root = page) => {
        const node = qs(selector, root);
        if (node) node.textContent = text;
    };

    const setCardCopy = (selector, title, body, action) => {
        const card = qs(selector);
        if (!card) return;
        setText("h3", title, card);
        setText("p", body, card);
        setText(".bos-choice-action", action, card);
    };

    const setDrawerCopy = (selector, items, nextText) => {
        const card = qs(selector);
        const drawerId = card?.querySelector("[data-flow-drawer]")?.dataset.flowDrawer;
        if (!drawerId) return;

        document.querySelectorAll(`[data-flow-drawer="${drawerId}"]`).forEach((drawer) => {
            drawer.querySelectorAll("li").forEach((item, index) => {
                if (items[index]) item.textContent = items[index];
            });
            const next = drawer.querySelector("ul + span");
            if (next) next.textContent = nextText;
        });
    };

    const smoothScrollTo = (selector, updateHash = true) => {
        const target = qs(selector);
        if (!target) return;

        if (updateHash) {
            try {
                window.history.replaceState(null, "", selector);
            } catch (error) {
                // Ignore history failures.
            }
        }

        target.scrollIntoView({ behavior: "smooth", block: "start" });
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
        const panel = qs("#guided-flow");
        if (!panel) return;
        panel.classList.remove("is-active");
        panel.removeAttribute("data-active-flow");
        panel.removeAttribute("data-active-context");
        panel.textContent = "";
    };

    const resetActiveGuidedFlow = () => {
        const selected = qs(".bos-start-panel .bos-choice-card.is-selected");

        // Clicking an active guided card lets the original boston-site closure
        // clear its own internal activePath state. Merely hiding its DOM would
        // leave that closure stale and make the next same-card click misbehave.
        if (selected && !selected.classList.contains("bos-choice-experience")) {
            selected.click();
        } else {
            clearGuidedFlow();
        }

        qsa(".bos-start-panel .bos-choice-card").forEach((card) => card.classList.remove("is-selected"));
    };

    const generalMailto = (subject, intro) => {
        const body = `Hi Chris,\n\n${intro}\n\nHere's the messy version:\n\n`;
        return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const normalizeBrowseCopy = () => {
        setText("#experience .bos-section-heading h2", "Engineering background");
        setText(
            "#experience .bos-section-heading .bos-section-text",
            "The through-line is practical systems work: reliability, infrastructure, automation, troubleshooting, and translating technical detail into decisions people can act on."
        );

        const experienceCopy = [
            ["Reliability when systems matter", "Incident response, production-impacting failures, storage reliability, replication quality, data integrity, and long-term stability work."],
            ["Hands-on infrastructure and labs", "Rack-level systems, switches, VLANs, Fibre Channel, Linux, VMware, and realistic environments built to reproduce difficult problems."],
            ["Automation that removes repeat work", "Python, APIs, Terraform, GitHub workflows, CLI tools, and repeatable processes that make technical work easier to operate and review."],
            ["Technical depth without the fog", "Turning low-level engineering detail into useful direction for customers, engineers, vendors, stakeholders, and non-specialists."]
        ];

        qsa("#experience .bos-experience-grid .bos-card").forEach((card, index) => {
            const copy = experienceCopy[index];
            if (!copy) return;
            setText("h3", copy[0], card);
            setText("p", copy[1], card);
        });

        qsa("#experience .bos-stack-grid .bos-mini").forEach((card) => {
            const label = card.querySelector("strong");
            if (label?.textContent.trim() === "People") {
                label.textContent = "Communication";
                setText("p", "Customers, engineers, vendors, executives, documentation, technical writing, and cross-functional communication.", card);
            }
        });

        const experiencePrimary = qs("#experience .bos-actions .bos-btn");
        if (experiencePrimary) {
            experiencePrimary.href = "#work";
            experiencePrimary.textContent = "See public projects";
            if (experiencePrimary.dataset.clarityBrowseLink !== "true") {
                experiencePrimary.dataset.clarityBrowseLink = "true";
                experiencePrimary.addEventListener("click", (event) => {
                    event.preventDefault();
                    smoothScrollTo("#work");
                });
            }
        }

        setText("#work .bos-section-heading h2", "Projects you can actually open");
        setText(
            "#work .bos-section-heading .bos-section-text",
            "Public examples of how I turn a loose idea into something usable: different audiences, different problems, and enough working product to evaluate the idea for real."
        );

        qsa("#work .bos-work-card").forEach((card) => {
            const title = card.querySelector("h3")?.textContent?.trim();
            if (title === "Irish Today") {
                setText("p", "A live daily culture page that turns a repeatable content pipeline into a polished, themed experience.", card);
            } else if (title === "Grepper") {
                setText("p", "A job-search tool that parses Workday postings, ranks results, and packages the workflow into a usable browser-style demo.", card);
            } else if (title === "LoudSource Voting Flyer") {
                setText("p", "An interactive voting prototype that turns a static content concept into a participatory experience.", card);
            } else if (title === "Your Passage") {
                setText("p", "A personalized daily-page concept built from the same reusable content engine, adapted to a very different audience and tone.", card);
            }
        });

        const workSection = qs("#work");
        const workGrid = qs("#work .bos-work-grid");
        if (workGrid && workSection && !qs("[data-clarity-work-actions]", workSection)) {
            const actions = document.createElement("div");
            actions.className = "bos-actions";
            actions.dataset.clarityWorkActions = "true";

            const contact = document.createElement("a");
            contact.className = "bos-btn";
            contact.href = generalMailto("Holtsnider Tech - project conversation", "I was looking through your public work and wanted to talk about a project.");
            contact.textContent = "Talk about a project";

            const professional = document.createElement("a");
            professional.className = "bos-btn alt";
            professional.href = "#case-shapes";
            professional.textContent = "See professional work";
            professional.addEventListener("click", (event) => {
                event.preventDefault();
                smoothScrollTo("#case-shapes");
            });

            actions.append(contact, professional);
            workGrid.insertAdjacentElement("afterend", actions);
        }

        setText("#case-shapes .bos-section-heading h2", "Professional work behind the portfolio");
        setText(
            "#case-shapes .bos-section-heading .bos-section-text",
            "Not every useful project can be linked publicly. These are representative shapes of the enterprise, infrastructure, troubleshooting, and automation work behind the public demos."
        );

        const caseCopy = [
            ["Systems reliability", "Stabilize systems under pressure", "Enterprise storage reliability, incident response, replication quality, data integrity, and long-term stability in complex environments.", "Talk about systems work"],
            ["Lab engineering", "Build labs that reproduce reality", "Rack-level replica environments, networking, Fibre Channel, VLANs, realistic workloads, and pre-rollout testing that surfaces problems before customers do.", "Talk about lab strategy"],
            ["Root cause", "Find the failure across layers", "Packet captures, file-level analysis, operating systems, drivers, firmware, network paths, and the boundary between hardware and software.", "Start with the problem"],
            ["Operational tooling", "Turn manual work into repeatable systems", "Python tooling, CMDB and security API workflows, Terraform, GitHub provisioning, governance, and repeatable operational review.", "Talk about automation"]
        ];

        qsa("#case-shapes .bos-case-card").forEach((card, index) => {
            const copy = caseCopy[index];
            if (!copy) return;
            setText(".bos-card-label", copy[0], card);
            setText("h3", copy[1], card);
            setText("p", copy[2], card);
            setText(".bos-card-action", copy[3], card);
        });
    };

    const normalizeContactCopy = () => {
        setText("#contact h2", "Tell me what you're working through.");

        const paragraphs = qsa("#contact > div > p");
        if (paragraphs[0]) paragraphs[0].textContent = "You do not need a polished brief. Send the broken thing, the rough idea, the decision you are stuck on, or whatever context you already have.";
        if (paragraphs[1]) paragraphs[1].textContent = "I start by getting the system and constraints straight, then narrow the smallest useful next move — whether that is troubleshooting, automation, a prototype, or simply a clearer decision.";

        const primary = qs("#contact .bos-actions .bos-btn");
        if (primary) primary.textContent = "Email Chris";

        const secondary = qs("#contact .bos-actions .bos-btn.alt");
        if (secondary) {
            secondary.textContent = "Back to starting points";
            secondary.href = "#start";
            if (secondary.dataset.clarityReset !== "true") {
                secondary.dataset.clarityReset = "true";
                secondary.addEventListener("click", resetActiveGuidedFlow, { capture: true });
            }
        }

        setText("#contact .bos-contact-note", "Project, role-fit, troubleshooting, or “I’m not sure yet” are all valid starting points.");
    };

    const flowLabel = (pathKey) => ({
        solve: "Fix a problem",
        opportunity: "Build or improve something",
        discovery: "Not sure where to start"
    }[pathKey] || "General inquiry");

    const directEmailHref = (pathKey, contextTitle = "", notes = []) => {
        const subject = ({
            solve: "Holtsnider Tech - problem to solve",
            opportunity: "Holtsnider Tech - idea or improvement",
            discovery: "Holtsnider Tech - not sure where to start"
        }[pathKey] || "Holtsnider Tech inquiry");

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
        const selected = qs(".bos-start-panel .bos-choice-card.is-selected");
        if (selected && !selected.classList.contains("bos-choice-experience")) selected.click();
    };

    const ensureStartOverButton = (panel) => {
        if (!panel?.dataset.activeFlow || panel.dataset.activeContext) return;
        const header = qs(".bos-guided-flow-head", panel);
        if (!header || qs("[data-clarity-start-over]", header)) return;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "bos-flow-back";
        button.dataset.clarityStartOver = "true";
        button.textContent = "Back to starting points";
        button.addEventListener("click", collapseSelectedGuidedCard);
        header.appendChild(button);
    };

    const enhanceGuidedDetail = () => {
        const panel = qs("#guided-flow.is-active[data-active-context]");
        if (!panel) return;

        const fields = qs(".bos-context-fields:not(.bos-context-copy-panel)", panel);
        const action = qs(".bos-guided-flow-action", panel);
        if (!fields || !action || fields.dataset.clarityEnhanced === "true") return;

        fields.dataset.clarityEnhanced = "true";
        fields.classList.add("bos-runtime-hidden");
        fields.setAttribute("aria-label", "Optional additional context");
        qs(".bos-context-copy-panel", panel)?.remove();
        qs(".bos-flow-mailto", action)?.remove();

        const actionText = qs("p", action);
        if (actionText) actionText.textContent = "You can email now with no form. Add a little context only if it would make the first conversation easier.";

        const contextTitle = qs(".bos-guided-flow-head h3", panel)?.textContent?.trim() || "";
        const controls = document.createElement("div");
        controls.className = "bos-actions";
        controls.style.marginTop = "0";

        const emailLink = document.createElement("a");
        emailLink.className = "bos-btn";
        emailLink.textContent = "Email Chris";

        const collectNotes = () => qsa(".bos-context-field", fields).map((field) => ({
            label: qs("span", field)?.textContent?.trim() || "Note",
            value: qs("textarea", field)?.value || ""
        }));

        const updateEmailHref = () => {
            emailLink.href = directEmailHref(panel.dataset.activeFlow, contextTitle, collectNotes());
        };
        updateEmailHref();
        qsa("textarea", fields).forEach((textarea) => textarea.addEventListener("input", updateEmailHref));

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
            if (willOpen) qs("textarea", fields)?.focus();
        });

        controls.append(emailLink, detailToggle);
        action.appendChild(controls);

        const back = qs(".bos-flow-back", panel);
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
        resetActiveGuidedFlow();
        qs(".bos-choice-experience")?.classList.add("is-selected");
        showBrowseSections();
        normalizeBrowseCopy();
        window.requestAnimationFrame(() => smoothScrollTo("#experience"));
    };

    const installHeaderShortcuts = () => {
        const nav = qs(".bos-links");
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
            resetActiveGuidedFlow();
            smoothScrollTo("#contact");
        });

        nav.append(experienceLink, contactLink);
    };

    const normalizeGuidedCopy = () => {
        const panel = qs("#guided-flow");
        if (!panel) return;

        const eyebrow = qs(".bos-guided-flow-eyebrow", panel);
        if (eyebrow?.textContent === "Context layer") eyebrow.textContent = "Choose the closest fit";

        const heading = qs(".bos-guided-flow-head h3", panel);
        const intro = qs(".bos-guided-flow-intro", panel);
        if (heading?.textContent === "Discovery path still being shaped") {
            heading.textContent = "What feels unclear?";
            if (intro) intro.textContent = "You do not need the right category yet. Start with what changed, what feels stuck, or what decision you are trying to make.";
        }
        if (intro?.textContent === "Pick the closest starting point. This is the Opportunity Engineering lane.") {
            intro.textContent = "Pick the closest starting point. The idea can still be rough; we can narrow it from there.";
        }

        if (panel.classList.contains("is-active")
            && panel.dataset.activeFlow === "discovery"
            && !panel.dataset.activeContext
            && !discoveryAdvanceQueued) {
            const options = qsa(".bos-guided-flow-option-button", panel);
            if (options.length === 1) {
                discoveryAdvanceQueued = true;
                window.requestAnimationFrame(() => {
                    discoveryAdvanceQueued = false;
                    if (panel.dataset.activeFlow === "discovery" && !panel.dataset.activeContext && options[0].isConnected) options[0].click();
                });
                return;
            }
        }

        ensureStartOverButton(panel);
        enhanceGuidedDetail();
    };

    // First-screen copy: plain language first, branded terminology second.
    setText(".bos-hero .bos-kicker", "Technical problem solving + project building");
    setText(
        ".bos-hero .bos-lede",
        "I help untangle technical problems, improve systems and workflows, and turn rough ideas into working projects. Pick the closest starting point below."
    );

    setCardCopy(".bos-choice-solve", "Fix a Problem", "Something is broken, unreliable, confusing, or wasting time.", "Start troubleshooting");
    setCardCopy(".bos-choice-opportunity", "Build or Improve", "You have an idea, workflow, site, tool, or process you want to make better.", "Explore the idea");
    setCardCopy(".bos-choice-experience", "Experience & Work", "See the engineering background, public projects, and systems work behind Holtsnider Tech.", "Browse experience");
    setCardCopy(".bos-choice-not-sure", "Not Sure Yet", "You know something needs attention, but you are not sure what kind of problem it is yet.", "Start with what you know");

    setDrawerCopy(".bos-choice-solve", ["Something just broke", "A problem keeps coming back"], "Start with the problem");
    setDrawerCopy(".bos-choice-opportunity", ["Build something new", "Improve something that exists"], "Start with the idea");
    setDrawerCopy(".bos-choice-experience", ["Engineering background", "Public projects", "Enterprise systems", "Current technical work"], "Browse without a questionnaire");
    setDrawerCopy(".bos-choice-not-sure", ["The situation is fuzzy", "The next step is unclear", "You do not know what to call it"], "Start with the messy version");

    const experienceCard = qs(".bos-choice-experience");
    if (experienceCard) {
        experienceCard.href = "#experience";
        experienceCard.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            openExperienceBrowse();
        }, { capture: true });
    }

    [".bos-choice-solve", ".bos-choice-opportunity", ".bos-choice-not-sure"].forEach((selector) => {
        qs(selector)?.addEventListener("click", hideBrowseSections, { capture: true });
    });

    const observer = new MutationObserver(normalizeGuidedCopy);
    observer.observe(page, { childList: true, subtree: true });

    normalizeBrowseCopy();
    normalizeContactCopy();
    normalizeGuidedCopy();
    installHeaderShortcuts();
    window.addEventListener("resize", installHeaderShortcuts);
});
