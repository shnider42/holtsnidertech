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

    const setCard = (selector, label, title, body, action) => {
        const card = page.querySelector(selector);
        if (!card) return;
        const labelNode = card.querySelector(".bos-card-label");
        const titleNode = card.querySelector("h3");
        const bodyNode = card.querySelector("p");
        const actionNode = card.querySelector(".bos-choice-action");
        if (labelNode) labelNode.textContent = label;
        if (titleNode) titleNode.textContent = title;
        if (bodyNode) bodyNode.textContent = body;
        if (actionNode) actionNode.textContent = action;
    };

    const normalizeCopy = () => {
        const mark = page.querySelector(".bos-mark");
        if (mark) {
            mark.href = "/";
            mark.setAttribute("aria-label", "Holtsnider Tech home");
            mark.textContent = "Holtsnider Tech";
        }

        page.querySelectorAll('.bos-links a[href*="style-lab"]').forEach((link) => link.remove());

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
            primaryAction.href = "#paths";
            primaryAction.textContent = "Follow the decision path";
        }

        setText(".bos-start-heading h2", "Where should we start?");
        setText(".bos-start-heading .bos-section-text", "Pick the closest starting point. Tap a card to continue, or hover/focus for the first conversation cue.");

        setCard(".bos-choice-solve", "01 / Solve", "Solve", "Address an issue", "Go to Solutions path");
        setCard(".bos-choice-opportunity", "02 / Launch an idea", "Launch an idea", "Find an opportunity to explore", "Go to Opportunity path");
        setCard(".bos-choice-experience", "03 / HT Experience", "HT Experience", "Chris's experience", "Go to experience");
        setCard(".bos-choice-not-sure", "04 / Start a discovery", "Start a discovery", "Not sure where this fits yet", "Go to Discovery path");

        setHref(".bos-start-panel .bos-choice-solve", "#solve");
        setHref(".bos-start-panel .bos-choice-opportunity", "#opportunity");
        setHref(".bos-start-panel .bos-choice-experience", "#experience");
        setHref(".bos-start-panel .bos-choice-not-sure", "#not-sure");

        page.querySelectorAll(".bos-cta-strip").forEach((section) => section.remove());
        page.querySelectorAll(".bos-contact-note").forEach((note) => {
            note.textContent = "The useful first step is simple: describe the messy version, the constraint, or the decision you are trying to make.";
        });
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
    initMotionToggle();
    initAnchorScroll();
});
