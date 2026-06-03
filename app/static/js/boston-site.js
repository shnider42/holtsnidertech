document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".boston");
    if (!page) return;

    const FLOW_DATA = {
        solve: {
            eyebrow: "Context layer",
            title: "What kind of problem is this?",
            intro: "Start by separating urgent breakage from long-running friction. Both can become Solutions Engineering, but the first conversation is different.",
            actionLabel: "Bring this context to contact",
            actionTarget: "#contact",
            options: [
                {
                    title: "Something just happened",
                    body: "A system, tool, provider, workflow, or application is suddenly blocking people or creating time-sensitive pressure.",
                    examples: ["Data unavailable / outage", "Application broken", "Provider or platform issue", "Change or migration needed"],
                    questions: ["When did it start?", "Who is blocked?", "What changed recently?", "What have you already tried?"],
                    tag: "Time-sensitive triage",
                },
                {
                    title: "This keeps getting in the way",
                    body: "A recurring issue, annoying workflow, unreliable process, or long-standing gap needs to be made clearer, smaller, or better.",
                    examples: ["Nagging functionality", "Recurring workflow pain", "Manual/repetitive process", "Chronic reliability issue"],
                    questions: ["How often does it happen?", "Who does it affect?", "What would better look like?", "Is this a fix, automation, or redesign?"],
                    tag: "Systemic improvement",
                },
            ],
        },
        opportunity: {
            eyebrow: "Context layer",
            title: "What kind of idea are we shaping?",
            intro: "This path is for turning a loose idea, workflow, site, tool, or improvement into a useful first version. This is the Opportunity Engineering lane.",
            actionLabel: "Bring this idea to contact",
            actionTarget: "#contact",
            options: [
                {
                    title: "Build something new",
                    body: "You have a new idea for an app, workflow, automation, website feature, demo, or internal tool and need help shaping the useful first version.",
                    examples: ["Loudsource", "Jiporady", "Daily Flyer / Irish Today", "Career Compass", "Grepper"],
                    questions: ["Who is it for?", "What should it help them do?", "What is the smallest useful version?", "What would make it feel real?"],
                    tag: "New build",
                },
                {
                    title: "Improve something existing",
                    body: "You already have a site, workflow, tool, process, or rough project, and it needs to become clearer, more usable, or more valuable.",
                    examples: ["Feature cleanup", "Workflow improvement", "Automation idea", "Better presentation", "Tool integration"],
                    questions: ["What exists now?", "What feels clunky?", "What do users miss or avoid?", "What should the next version prove?"],
                    tag: "Existing improvement",
                },
            ],
        },
        experience: {
            eyebrow: "Context layer",
            title: "What background are you looking for?",
            intro: "This path is for people evaluating professional fit, engineering credibility, or resume-style experience rather than a creative project example.",
            actionLabel: "Go to experience section",
            actionTarget: "#experience",
            options: [
                {
                    title: "Engineering experience",
                    body: "Reliability, troubleshooting, infrastructure, automation, customer-facing support, and technical ownership across enterprise environments.",
                    examples: ["SRE / reliability", "Incident response", "Networking / infrastructure", "Automation", "Technical support"],
                    questions: ["What kind of role or work are you evaluating?", "Which technical area matters most?", "Do you need broad background or a specific example?"],
                    tag: "Professional fit",
                },
                {
                    title: "Enterprise systems background",
                    body: "Storage, lab infrastructure, root-cause investigation, release quality, and customer-facing engineering work from a long enterprise context.",
                    examples: ["PowerFlex", "Unity", "Dell / EMC", "Lab systems", "Release quality"],
                    questions: ["Is this about storage, infrastructure, or support?", "Do you need public proof or resume context?", "What kind of environment is closest?"],
                    tag: "Enterprise credibility",
                },
                {
                    title: "Current technical direction",
                    body: "Recent work and interests around practical AI tooling, project shaping, automation, web apps, and technical translation.",
                    examples: ["AI tooling", "Flask apps", "Workflow tools", "Quantum Solutions / Cipher", "Portfolio momentum"],
                    questions: ["Are you looking for current work?", "Do examples matter, or only professional history?", "What kind of collaboration are you considering?"],
                    tag: "Current work",
                },
            ],
        },
        discovery: {
            eyebrow: "Context layer",
            title: "Discovery path still being shaped",
            intro: "This path is intentionally light for now. The useful version is probably for people who know something is off but do not know whether it is a problem, opportunity, vendor issue, workflow issue, or technical gap.",
            actionLabel: "Send the fuzzy version",
            actionTarget: "#contact",
            options: [
                {
                    title: "Start with the messy version",
                    body: "Describe what is happening, what feels confusing, and what decision you are trying to make. The first job is naming the work.",
                    examples: ["Unclear next step", "Vendor confusion", "Process friction", "Tooling uncertainty"],
                    questions: ["What prompted this?", "What feels stuck?", "What decision are you trying to make?"],
                    tag: "Set aside / placeholder",
                },
            ],
        },
    };

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
            if (accent) {
                drawer.style.setProperty("--card-accent", accent);
            }
        });
    };

    const positionDrawer = (drawer, clientX, clientY) => {
        if (!window.matchMedia("(min-width: 851px)").matches) return;

        const margin = 14;
        const offset = 18;
        const width = drawer.offsetWidth || 300;
        const height = drawer.offsetHeight || 130;

        let left = clientX + offset;
        if (left + width + margin > window.innerWidth) {
            left = clientX - width - offset;
        }

        const above = clientY - height - offset;
        const below = clientY + offset;
        let top = above >= margin ? above : below;

        if (top + height + margin > window.innerHeight) {
            top = above;
        }

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

    const createList = (className, items) => {
        const list = document.createElement("ul");
        list.className = className;
        items.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            list.appendChild(li);
        });
        return list;
    };

    const renderFlow = (pathKey, shouldScroll = true) => {
        const data = FLOW_DATA[pathKey];
        const panel = ensureFlowPanel();
        if (!data || !panel) return;

        activePath = pathKey;
        page.querySelectorAll(".bos-choice-card").forEach((card) => {
            card.classList.toggle("is-selected", card.dataset.flowPath === pathKey);
        });

        panel.textContent = "";
        panel.classList.add("is-active");
        panel.dataset.activeFlow = pathKey;

        const header = document.createElement("div");
        header.className = "bos-guided-flow-head";

        const eyebrow = document.createElement("p");
        eyebrow.className = "bos-guided-flow-eyebrow";
        eyebrow.textContent = data.eyebrow;

        const title = document.createElement("h3");
        title.textContent = data.title;

        const intro = document.createElement("p");
        intro.className = "bos-guided-flow-intro";
        intro.textContent = data.intro;

        header.append(eyebrow, title, intro);

        const optionGrid = document.createElement("div");
        optionGrid.className = "bos-guided-flow-options";

        data.options.forEach((option) => {
            const optionCard = document.createElement("article");
            optionCard.className = "bos-guided-flow-option";

            const tag = document.createElement("p");
            tag.className = "bos-guided-flow-tag";
            tag.textContent = option.tag;

            const optionTitle = document.createElement("h4");
            optionTitle.textContent = option.title;

            const body = document.createElement("p");
            body.textContent = option.body;

            const examplesLabel = document.createElement("strong");
            examplesLabel.textContent = "Examples";

            const examples = createList("bos-guided-flow-chips", option.examples);

            const questionsLabel = document.createElement("strong");
            questionsLabel.textContent = "Useful context";

            const questions = createList("bos-guided-flow-questions", option.questions);

            optionCard.append(tag, optionTitle, body, examplesLabel, examples, questionsLabel, questions);
            optionGrid.appendChild(optionCard);
        });

        const action = document.createElement("div");
        action.className = "bos-guided-flow-action";

        const actionText = document.createElement("p");
        actionText.textContent = "The goal is to send enough context for a useful first reply without turning the site into a long form.";

        const actionLink = document.createElement("a");
        actionLink.href = data.actionTarget;
        actionLink.className = "bos-btn bos-btn-primary";
        actionLink.textContent = data.actionLabel;

        action.append(actionText, actionLink);
        panel.append(header, optionGrid, action);

        if (shouldScroll) {
            window.requestAnimationFrame(() => {
                panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
            });
        }
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

        page.querySelectorAll('.bos-links a[href*="style-lab"], .bos-links a[href="#paths"]').forEach((link) => link.remove());

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
        const startText = page.querySelector(".bos-start-heading .bos-section-text");
        if (startText) {
            startText.remove();
        }

        setCard(
            ".bos-choice-solve",
            "solve",
            "Solve",
            "Something broke, keeps breaking, or needs to be made smaller.",
            "Show problem flow",
            ["Something just broke", "Systemic problem"],
            "This becomes Solutions Engineering"
        );
        setCard(
            ".bos-choice-opportunity",
            "opportunity",
            "Launch Idea",
            "Shape a new idea or improve something that already exists.",
            "Show idea flow",
            ["New idea", "Improvement on existing idea"],
            "This becomes Opportunity Engineering"
        );
        setCard(
            ".bos-choice-experience",
            "experience",
            "HT Experience",
            "Jump to background, proof, portfolio, and role-fit context.",
            "Show experience flow",
            ["SRE / reliability", "Portfolio and demos", "Enterprise storage", "AI and automation"],
            "Show professional context"
        );
        setCard(
            ".bos-choice-not-sure",
            "discovery",
            "Start a Discovery",
            "You are not sure what category the problem belongs in yet.",
            "Show placeholder",
            ["The situation is fuzzy", "The next step is unclear", "The work needs a name"],
            "Discovery path still being shaped"
        );

        setHref(".bos-start-panel .bos-choice-solve", "#guided-flow");
        setHref(".bos-start-panel .bos-choice-opportunity", "#guided-flow");
        setHref(".bos-start-panel .bos-choice-experience", "#guided-flow");
        setHref(".bos-start-panel .bos-choice-not-sure", "#guided-flow");

        page.querySelector("#paths")?.remove();
        page.querySelector(".bos-operating-line")?.remove();
        page.querySelector("#experience .bos-section-text")?.remove();
        page.querySelector("#work .bos-section-text")?.remove();
        page.querySelector("#case-shapes .bos-section-text")?.remove();

        page.querySelectorAll(".bos-cta-strip").forEach((section) => section.remove());
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
                if (!selector || selector === "#") return;

                if (link.classList.contains("bos-choice-card")) {
                    return;
                }

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
