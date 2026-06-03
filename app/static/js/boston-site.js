document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".boston");
    if (!page) return;

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

    const setCard = (selector, title, body, action, drawerItems, drawerNext) => {
        const card = page.querySelector(selector);
        if (!card) return;

        const labelNode = card.querySelector(".bos-card-label");
        const titleNode = card.querySelector("h3");
        const bodyNode = card.querySelector("p");
        const actionNode = card.querySelector(".bos-choice-action");

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
            "Solve",
            "Something broke, keeps breaking, or needs to be made smaller.",
            "Go to contact",
            ["Something just broke", "Systemic problem"],
            "Later in flow: Solutions Engineering"
        );
        setCard(
            ".bos-choice-opportunity",
            "Launch Idea",
            "Shape a new idea or improve something that already exists.",
            "Go to contact",
            ["New idea", "Improvement on existing idea"],
            "Later in flow: Opportunity Engineering"
        );
        setCard(
            ".bos-choice-experience",
            "HT Experience",
            "Jump to background, proof, portfolio, and role-fit context.",
            "Go to experience",
            ["SRE / reliability", "Portfolio and demos", "Enterprise storage", "AI and automation"],
            "Next: see relevant experience"
        );
        setCard(
            ".bos-choice-not-sure",
            "Start a Discovery",
            "You are not sure what category the problem belongs in yet.",
            "Go to contact",
            ["The situation is fuzzy", "The next step is unclear", "The work needs a name"],
            "Next: clarify the first move"
        );

        setHref(".bos-start-panel .bos-choice-solve", "#contact");
        setHref(".bos-start-panel .bos-choice-opportunity", "#contact");
        setHref(".bos-start-panel .bos-choice-experience", "#experience");
        setHref(".bos-start-panel .bos-choice-not-sure", "#contact");

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
