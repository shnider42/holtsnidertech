document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".boston");
    if (!page) return;

    const CONTACT_EMAIL = "chris@holtsnidertech.com";

    const FLOW_DATA = {
        solve: {
            title: "What kind of problem is this?",
            intro: "Pick the closest shape. The details can stay rough.",
            actionLabel: "Email this problem context",
            subject: "Holtsnider Tech problem context",
            options: [
                {
                    id: "just-happened",
                    title: "Something just happened",
                    short: "New, urgent, or blocking.",
                    tag: "Time-sensitive",
                    detailTitle: "Start with the breakage",
                    detailIntro: "Useful context is what changed, who is blocked, and what has already been tried.",
                    examples: [
                        { title: "Data unavailable / outage", body: "People cannot get to something they expected to use." },
                        { title: "Application broken", body: "A tool, site, app, or workflow suddenly stopped behaving correctly." },
                        { title: "Provider issue", body: "A vendor, platform, or managed service is creating pressure." },
                        { title: "Change needed", body: "Something is bad enough that switching, migrating, or redesigning may be on the table." }
                    ],
                    questions: ["When did it start?", "Who is blocked?", "What changed recently?", "What have you already tried?", "Other notes"]
                },
                {
                    id: "keeps-happening",
                    title: "This keeps getting in the way",
                    short: "Recurring, annoying, or system-wide.",
                    tag: "Systemic",
                    detailTitle: "Start with the pattern",
                    detailIntro: "Useful context is how often it happens, who it affects, and what better would look like.",
                    examples: [
                        { title: "Nagging functionality", body: "Something technically works but repeatedly gets in the way." },
                        { title: "Workflow pain", body: "A process is manual, brittle, or harder than it should be." },
                        { title: "Recurring reliability issue", body: "The same category of failure keeps coming back." },
                        { title: "Long-standing gap", body: "Everyone has learned to work around it, but it should probably be fixed." }
                    ],
                    questions: ["How often does it happen?", "Who does it affect?", "What would better look like?", "Is this a fix, automation, or redesign?", "Other notes"]
                }
            ]
        },
        opportunity: {
            title: "What kind of idea are we shaping?",
            intro: "Pick the closest starting point. This is the Opportunity Engineering lane.",
            actionLabel: "Email this idea context",
            subject: "Holtsnider Tech idea context",
            options: [
                {
                    id: "new-build",
                    title: "Build something new",
                    short: "A new app, site, workflow, prototype, or tool.",
                    tag: "New idea",
                    detailTitle: "Shape the useful first version",
                    detailIntro: "These examples show the kind of creative technical shaping I can bring to a fuzzy idea.",
                    examples: [
                        { title: "Irish Today", body: "Daily Flyer family: a repeatable daily culture page with themed presentation.", href: "https://daily-flyer.onrender.com/", theme: "irish", family: "Daily Flyer" },
                        { title: "Your Passage", body: "Daily Flyer family: a personalized daily-page concept grown from the same engine.", href: "https://mypassages.net/", theme: "passage", family: "Daily Flyer" },
                        { title: "Loudsource", body: "Daily Flyer family: an interactive vote-to-queue music concept.", href: "/static/demos/loudsource-vote.html", theme: "loudsource", family: "Daily Flyer" },
                        { title: "Jiporady", body: "Custom browser game / living-room trivia concept.", href: "/static/demos/jiporady.html", theme: "jiporady" },
                        { title: "Career Compass", body: "Career-direction tooling / structured job-search thinking.", href: "#contact", theme: "career-compass" },
                        { title: "Grepper", body: "Job-search scraping, parsing, ranking, and demo workflow.", href: "/static/demos/grepper.html", theme: "grepper" }
                    ],
                    questions: ["Who is it for?", "What should it help them do?", "What is the smallest useful version?", "What would make it feel real?", "Other notes"]
                },
                {
                    id: "improve-existing",
                    title: "Improve something existing",
                    short: "A site, workflow, tool, process, or rough draft already exists.",
                    tag: "Existing idea",
                    detailTitle: "Make the next version clearer",
                    detailIntro: "The goal is to identify what is clunky, what matters, and what the next useful version should prove.",
                    examples: [
                        { title: "Feature cleanup", body: "Make an existing thing easier to understand or use." },
                        { title: "Workflow improvement", body: "Reduce manual steps or confusion in a current process." },
                        { title: "Better presentation", body: "Turn existing work into something easier to evaluate." },
                        { title: "Automation idea", body: "Add practical tooling around work people already do." }
                    ],
                    questions: ["What exists now?", "What feels clunky?", "What do users miss or avoid?", "What should the next version prove?", "Other notes"]
                }
            ]
        },
        experience: {
            title: "What background are you looking for?",
            intro: "For LinkedIn, resume, role-fit, or professional credibility context.",
            actionLabel: "Email about professional background",
            subject: "Holtsnider Tech professional background",
            options: [
                {
                    id: "engineering",
                    title: "Engineering experience",
                    short: "Reliability, troubleshooting, automation, and technical ownership.",
                    tag: "Role fit",
                    detailTitle: "Professional engineering context",
                    detailIntro: "This is the more resume-like lane: technical work, responsibility, and environments.",
                    examples: [
                        { title: "SRE / reliability", body: "Incident response, production-impacting issues, and operational thinking." },
                        { title: "Automation", body: "Python, scripting, APIs, repeatable workflows, and practical tooling." },
                        { title: "Technical support", body: "Customer-facing engineering, escalation, and clear next steps." }
                    ],
                    questions: ["What role or work are you evaluating?", "Which technical area matters most?", "Do you need broad background or a specific example?", "What should I emphasize?", "Other notes"]
                },
                {
                    id: "enterprise",
                    title: "Enterprise systems background",
                    short: "Storage, infrastructure, release quality, and complex environments.",
                    tag: "Enterprise",
                    detailTitle: "Enterprise systems context",
                    detailIntro: "This lane is for storage, infrastructure, lab, and customer-impacting engineering credibility.",
                    examples: [
                        { title: "PowerFlex / Unity", body: "Enterprise storage systems and reliability context." },
                        { title: "Lab infrastructure", body: "Rack systems, networking, Fibre Channel, VMware, and realistic environments." },
                        { title: "Root-cause work", body: "Cross-layer investigation across systems, logs, network paths, and assumptions." }
                    ],
                    questions: ["Is this about storage, infrastructure, or support?", "What environment is closest?", "Do you need public proof or resume context?", "What problem domain matters?", "Other notes"]
                },
                {
                    id: "current-direction",
                    title: "Current technical direction",
                    short: "AI tooling, web apps, workflow tools, and project shaping.",
                    tag: "Current work",
                    detailTitle: "Current work and direction",
                    detailIntro: "This lane connects professional experience with the newer public work and project-building momentum.",
                    examples: [
                        { title: "AI tooling", body: "Practical AI-assisted workflows, review, summarization, and technical acceleration." },
                        { title: "Web apps", body: "Flask apps, demos, portfolio systems, and workflow prototypes." },
                        { title: "Quantum Solutions / Cipher", body: "Security/risk tooling, infrastructure analysis, and technical translation." }
                    ],
                    questions: ["Are you looking for current work?", "Do examples matter, or only professional history?", "What kind of collaboration are you considering?", "What should I point you to first?", "Other notes"]
                }
            ]
        },
        discovery: {
            title: "Discovery path still being shaped",
            intro: "Use this when the situation is real, but the category is not obvious yet.",
            actionLabel: "Email the fuzzy version",
            subject: "Holtsnider Tech discovery context",
            options: [
                {
                    id: "messy-version",
                    title: "Start with the messy version",
                    short: "Name the work before solving it.",
                    tag: "Discovery",
                    detailTitle: "Describe the unclear situation",
                    detailIntro: "The first goal is to separate symptoms, constraints, risks, and possible next moves.",
                    examples: [
                        { title: "Unclear next step", body: "You know something needs attention, but not what to call it." },
                        { title: "Vendor confusion", body: "You need help translating claims, options, or tradeoffs." },
                        { title: "Tooling uncertainty", body: "You are unsure whether this is a tool, process, platform, or people problem." }
                    ],
                    questions: ["What prompted this?", "What feels stuck?", "What decision are you trying to make?", "What have you considered so far?", "Other notes"]
                }
            ]
        }
    };

    const flowState = { path: null, context: null, notes: {} };
    let activePath = null;
    let flowPanel = null;

    const setText = (selector, text) => {
        const node = page.querySelector(selector);
        if (node) node.textContent = text;
    };

    const setHref = (selector, href) => {
        const node = page.querySelector(selector);
        if (node) node.setAttribute("href", href);
    };

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const slugify = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const buildDrawer = (drawerItems, drawerNext, extraClass, drawerId) => {
        const drawer = document.createElement("div");
        drawer.className = `bos-choice-drawer ${extraClass}`;
        drawer.setAttribute("aria-hidden", "true");
        drawer.dataset.flowDrawer = drawerId;

        const drawerLabel = document.createElement("strong");
        drawerLabel.textContent = "Common starts";
        drawer.appendChild(drawerLabel);

        const list = document.createElement("ul");
        drawerItems.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            list.appendChild(li);
        });
        drawer.appendChild(list);

        const next = document.createElement("span");
        next.textContent = drawerNext;
        drawer.appendChild(next);

        return drawer;
    };

    const applyCardAccent = (card, ...drawers) => {
        const accent = window.getComputedStyle(card).getPropertyValue("--card-accent").trim();
        drawers.forEach((drawer) => {
            if (accent) drawer.style.setProperty("--card-accent", accent);
        });
    };

    const positionDrawer = (drawer, clientX, clientY) => {
        if (!window.matchMedia("(min-width: 851px)").matches) return;

        const margin = 14;
        const offset = 18;
        const width = drawer.offsetWidth || 300;
        const height = drawer.offsetHeight || 130;

        let left = clientX + offset;
        if (left + width + margin > window.innerWidth) left = clientX - width - offset;

        const above = clientY - height - offset;
        const below = clientY + offset;
        let top = above >= margin ? above : below;
        if (top + height + margin > window.innerHeight) top = above;

        drawer.style.left = `${clamp(left, margin, window.innerWidth - width - margin)}px`;
        drawer.style.top = `${clamp(top, margin, window.innerHeight - height - margin)}px`;
    };

    const attachDrawerTracking = (card, drawer) => {
        const show = (clientX, clientY) => {
            drawer.classList.add("is-active");
            positionDrawer(drawer, clientX, clientY);
        };

        const hide = () => {
            drawer.classList.remove("is-active");
            drawer.style.left = "";
            drawer.style.top = "";
        };

        card.addEventListener("mouseenter", (event) => show(event.clientX, event.clientY));
        card.addEventListener("mousemove", (event) => show(event.clientX, event.clientY));
        card.addEventListener("mouseleave", hide);
        card.addEventListener("focusin", () => {
            const rect = card.getBoundingClientRect();
            show(rect.left + rect.width / 2, rect.top);
        });
        card.addEventListener("focusout", () => {
            window.setTimeout(() => {
                if (!card.contains(document.activeElement)) hide();
            }, 0);
        });
    };

    const hideMiddleSections = () => {
        page.querySelector("#paths")?.remove();
        page.querySelector(".bos-operating-line")?.remove();
        page.querySelectorAll(".bos-cta-strip, #experience, #work, #case-shapes").forEach((section) => {
            section.classList.add("bos-runtime-hidden");
            section.hidden = true;
        });
    };

    const ensureFlowPanel = () => {
        if (flowPanel) return flowPanel;

        const choiceGrid = page.querySelector(".bos-choice-grid");
        if (!choiceGrid) return null;

        flowPanel = document.createElement("section");
        flowPanel.id = "guided-flow";
        flowPanel.className = "bos-guided-flow";
        flowPanel.setAttribute("aria-live", "polite");
        choiceGrid.insertAdjacentElement("afterend", flowPanel);
        return flowPanel;
    };

    const buildMailtoHref = () => {
        const data = FLOW_DATA[flowState.path];
        const context = data?.options.find((option) => option.id === flowState.context);
        const subject = encodeURIComponent(data?.subject || "Holtsnider Tech inquiry");
        const lines = [
            "Hi Chris,",
            "",
            "I came through the Holtsnider Tech site flow with this context:",
            "",
            `Starting point: ${data ? data.title : flowState.path || "Not selected"}`,
            `Selected context: ${context ? context.title : "Not selected"}`,
            ""
        ];

        Object.entries(flowState.notes).forEach(([question, answer]) => {
            if (answer.trim()) lines.push(`${question}: ${answer.trim()}`);
        });

        lines.push("", "Thanks,");
        return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${encodeURIComponent(lines.join("\n"))}`;
    };

    const createButton = (className, text) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = className;
        button.textContent = text;
        return button;
    };

    const renderFlow = (pathKey, shouldScroll = true) => {
        const data = FLOW_DATA[pathKey];
        const panel = ensureFlowPanel();
        if (!data || !panel) return;

        activePath = pathKey;
        flowState.path = pathKey;
        flowState.context = null;
        flowState.notes = {};

        page.querySelectorAll(".bos-choice-card").forEach((card) => {
            card.classList.toggle("is-selected", card.dataset.flowPath === pathKey);
        });

        panel.textContent = "";
        panel.classList.add("is-active");
        panel.dataset.activeFlow = pathKey;

        const header = document.createElement("div");
        header.className = "bos-guided-flow-head";
        header.innerHTML = `<p class="bos-guided-flow-eyebrow">Context layer</p><h3>${data.title}</h3><p class="bos-guided-flow-intro">${data.intro}</p>`;

        const optionGrid = document.createElement("div");
        optionGrid.className = "bos-guided-flow-options bos-guided-flow-options-compact";

        data.options.forEach((option) => {
            const optionButton = createButton("bos-guided-flow-option bos-guided-flow-option-button", option.title);
            optionButton.dataset.contextId = option.id;
            optionButton.innerHTML = `<span class="bos-guided-flow-tag">${option.tag}</span><strong>${option.title}</strong><span>${option.short}</span>`;
            optionButton.addEventListener("click", () => renderDetail(pathKey, option.id));
            optionGrid.appendChild(optionButton);
        });

        panel.append(header, optionGrid);

        if (shouldScroll) {
            window.requestAnimationFrame(() => panel.scrollIntoView({ behavior: "smooth", block: "nearest" }));
        }
    };

    const renderDetail = (pathKey, contextId) => {
        const data = FLOW_DATA[pathKey];
        const option = data?.options.find((item) => item.id === contextId);
        const panel = ensureFlowPanel();
        if (!data || !option || !panel) return;

        flowState.path = pathKey;
        flowState.context = contextId;
        flowState.notes = {};

        panel.textContent = "";
        panel.classList.add("is-active");
        panel.dataset.activeFlow = pathKey;
        panel.dataset.activeContext = contextId;

        const header = document.createElement("div");
        header.className = "bos-guided-flow-head";
        header.innerHTML = `<p class="bos-guided-flow-eyebrow">${option.tag}</p><h3>${option.detailTitle}</h3><p class="bos-guided-flow-intro">${option.detailIntro}</p>`;

        const back = createButton("bos-flow-back", "Back to context choices");
        back.addEventListener("click", () => renderFlow(pathKey, false));
        header.appendChild(back);

        const examples = document.createElement("div");
        examples.className = "bos-flow-example-grid";
        option.examples.forEach((example) => {
            const tagName = example.href ? "a" : "article";
            const card = document.createElement(tagName);
            const theme = example.theme || slugify(example.title);
            card.className = `bos-flow-example-card bos-project-card bos-project-${theme}`;
            card.dataset.project = theme;
            if (example.href) {
                card.href = example.href;
                if (example.href.startsWith("http")) {
                    card.target = "_blank";
                    card.rel = "noopener noreferrer";
                }
            }
            const family = example.family ? `<em>${example.family}</em>` : "";
            card.innerHTML = `${family}<strong>${example.title}</strong><span>${example.body}</span>`;
            examples.appendChild(card);
        });

        const fields = document.createElement("div");
        fields.className = "bos-context-fields";
        option.questions.forEach((question) => {
            const label = document.createElement("label");
            label.className = "bos-context-field";
            const labelText = document.createElement("span");
            labelText.textContent = question;
            const textarea = document.createElement("textarea");
            textarea.rows = question === "Other notes" ? 4 : 2;
            textarea.placeholder = "Optional";
            textarea.addEventListener("input", () => {
                flowState.notes[question] = textarea.value;
                const mailLink = panel.querySelector(".bos-flow-mailto");
                if (mailLink) mailLink.href = buildMailtoHref();
            });
            label.append(labelText, textarea);
            fields.appendChild(label);
        });

        const action = document.createElement("div");
        action.className = "bos-guided-flow-action";
        const actionText = document.createElement("p");
        actionText.textContent = "These fields are optional. They are here to make the eventual email or meeting context more useful.";
        const actionLink = document.createElement("a");
        actionLink.className = "bos-btn bos-btn-primary bos-flow-mailto";
        actionLink.href = buildMailtoHref();
        actionLink.textContent = data.actionLabel;
        action.append(actionText, actionLink);

        panel.append(header, examples, fields, action);
        window.requestAnimationFrame(() => panel.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    };

    const collapseFlow = () => {
        activePath = null;
        flowState.path = null;
        flowState.context = null;
        flowState.notes = {};
        page.querySelectorAll(".bos-choice-card").forEach((card) => card.classList.remove("is-selected"));

        if (!flowPanel) return;
        flowPanel.classList.remove("is-active");
        flowPanel.removeAttribute("data-active-flow");
        flowPanel.removeAttribute("data-active-context");
        flowPanel.textContent = "";
    };

    const setCard = (selector, pathKey, title, body, action, drawerItems, drawerNext) => {
        const card = page.querySelector(selector);
        if (!card) return;

        const labelNode = card.querySelector(".bos-card-label");
        const titleNode = card.querySelector("h3");
        const bodyNode = card.querySelector("p");
        const actionNode = card.querySelector(".bos-choice-action");

        card.dataset.flowPath = pathKey;
        if (labelNode) labelNode.remove();
        if (titleNode) titleNode.textContent = title;
        if (bodyNode) bodyNode.textContent = body;
        if (actionNode) actionNode.textContent = action;

        const drawerId = `flow-${selector.replace(/[^a-z0-9_-]/gi, "")}`;
        document.querySelectorAll(`[data-flow-drawer="${drawerId}"]`).forEach((drawer) => drawer.remove());

        const inlineDrawer = buildDrawer(drawerItems, drawerNext, "bos-choice-inline", drawerId);
        const floatingDrawer = buildDrawer(drawerItems, drawerNext, "bos-choice-floating", drawerId);

        applyCardAccent(card, inlineDrawer, floatingDrawer);
        card.appendChild(inlineDrawer);
        document.body.appendChild(floatingDrawer);
        attachDrawerTracking(card, floatingDrawer);

        card.addEventListener("click", (event) => {
            event.preventDefault();
            if (activePath === pathKey) {
                collapseFlow();
                return;
            }
            renderFlow(pathKey);
        });
    };

    const normalizeCopy = () => {
        const mark = page.querySelector(".bos-mark");
        if (mark) {
            mark.href = "/";
            mark.setAttribute("aria-label", "Holtsnider Tech home");
            mark.textContent = "Holtsnider Tech";
        }

        page.querySelectorAll('.bos-links a[href*="style-lab"], .bos-links a[href="#paths"], .bos-links a[href="#work"], .bos-links a[href="#experience"]').forEach((link) => link.remove());

        setText(".bos-hero .bos-kicker", "Solutions Engineering + Opportunity Engineering");

        const heroTitle = page.querySelector(".bos-hero h1");
        if (heroTitle) {
            heroTitle.textContent = "Holtsnider ";
            const span = document.createElement("span");
            span.textContent = "Tech";
            heroTitle.appendChild(span);
        }

        setText(".bos-hero .bos-lede", "Practical help for messy technical situations: solve what is broken, find what could work better, and turn unclear systems, workflows, and ideas into the next useful move.");

        const primaryAction = page.querySelector('.bos-hero .bos-btn[href="#start"]');
        if (primaryAction) {
            primaryAction.href = "#start";
            primaryAction.textContent = "Pick a starting point";
        }

        setText(".bos-start-heading h2", "Where should we start?");
        page.querySelector(".bos-start-heading .bos-section-text")?.remove();

        setCard(".bos-choice-solve", "solve", "Solve", "Something broke, keeps breaking, or needs to be made smaller.", "Show problem flow", ["Something just broke", "Systemic problem"], "This becomes Solutions Engineering");
        setCard(".bos-choice-opportunity", "opportunity", "Launch Idea", "Shape a new idea or improve something that already exists.", "Show idea flow", ["New idea", "Improvement on existing idea"], "This becomes Opportunity Engineering");
        setCard(".bos-choice-experience", "experience", "HT Experience", "Jump to background, proof, portfolio, and role-fit context.", "Show experience flow", ["SRE / reliability", "Portfolio and demos", "Enterprise storage", "AI and automation"], "Show professional context");
        setCard(".bos-choice-not-sure", "discovery", "Start a Discovery", "You are not sure what category the problem belongs in yet.", "Show placeholder", ["The situation is fuzzy", "The next step is unclear", "The work needs a name"], "Discovery path still being shaped");

        setHref(".bos-start-panel .bos-choice-solve", "#guided-flow");
        setHref(".bos-start-panel .bos-choice-opportunity", "#guided-flow");
        setHref(".bos-start-panel .bos-choice-experience", "#guided-flow");
        setHref(".bos-start-panel .bos-choice-not-sure", "#guided-flow");

        hideMiddleSections();

        page.querySelectorAll(".bos-contact-note").forEach((note) => {
            note.textContent = "The useful first step is simple: describe the messy version, the constraint, or the decision you are trying to make.";
        });
    };

    const initFloatingHeaderState = () => {
        const updateHeaderState = () => {
            page.classList.toggle("bos-at-top", (window.scrollY || window.pageYOffset) <= 4);
        };
        updateHeaderState();
        window.addEventListener("scroll", updateHeaderState, { passive: true });
        window.addEventListener("resize", updateHeaderState);
    };

    const initMotionToggle = () => {
        const links = page.querySelector(".bos-links");
        if (!links) return;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "bos-motion-toggle";

        const readPreference = () => {
            try {
                return window.localStorage.getItem("holtsnider-reduce-motion") !== "false";
            } catch (error) {
                return true;
            }
        };

        const applyPreference = (enabled) => {
            document.body.classList.toggle("bos-reduce-motion", enabled);
            button.setAttribute("aria-pressed", String(enabled));
            button.textContent = enabled ? "Motion reduced" : "Reduce motion";
        };

        applyPreference(readPreference());
        links.appendChild(button);

        button.addEventListener("click", () => {
            const enabled = !button.matches('[aria-pressed="true"]');
            applyPreference(enabled);
            try {
                window.localStorage.setItem("holtsnider-reduce-motion", String(enabled));
            } catch (error) {
                // Ignore storage failures.
            }
        });
    };

    const initAnchorScroll = () => {
        page.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener("click", (event) => {
                const selector = link.getAttribute("href");
                if (!selector || selector === "#" || link.classList.contains("bos-choice-card")) return;

                const target = page.querySelector(selector);
                if (!target) return;

                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                try {
                    window.history.replaceState(null, "", selector);
                } catch (error) {
                    // Ignore history failures.
                }
            });
        });
    };

    normalizeCopy();
    initFloatingHeaderState();
    initMotionToggle();
    initAnchorScroll();
});
