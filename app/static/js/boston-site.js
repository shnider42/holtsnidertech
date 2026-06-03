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

    const setCard = (selector, label, title, body, action, drawerItems, drawerNext) => {
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

        card.querySelector(".bos-choice-drawer")?.remove();

        const drawer = document.createElement("div");
        drawer.className = "bos-choice-drawer";
        drawer.setAttribute("aria-hidden", "true");

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

        card.appendChild(drawer);
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
        setText(".bos-start-heading .bos-section-text", "Pick the closest starting point. Each card moves into the next layer: context, examples, and the first useful action.");

        setCard(
            ".bos-choice-solve",
            "01 / Solve",
            "Solve",
            "Something broke, keeps breaking, or needs to be made smaller.",
            "Go to Solutions path",
            ["Something just broke", "Systemic problem"],
            "Next: make the failure smaller"
        );
        setCard(
            ".bos-choice-opportunity",
            "02 / Launch Idea",
            "Launch Idea",
            "Shape a new idea or improve something that already exists.",
            "Go to Opportunity path",
            ["New idea", "Improvement on existing idea"],
            "Next: define the smallest useful version"
        );
        setCard(
            ".bos-choice-experience",
            "03 / HT Experience",
            "HT Experience",
            "Jump to background, proof, portfolio, and role-fit context.",
            "Go to experience",
            ["SRE / reliability", "Portfolio and demos", "Enterprise storage", "AI and automation"],
            "Next: see relevant experience"
        );
        setCard(
            ".bos-choice-not-sure",
            "04 / Start a Discovery",
            "Start a Discovery",
            "You are not sure what category the problem belongs in yet.",
            "Go to Discovery path",
            ["The situation is fuzzy", "The next step is unclear", "The work needs a name"],
            "Next: clarify the first move"
        );

        setHref(".bos-start-panel .bos-choice-solve", "#solve");
        setHref(".bos-start-panel .bos-choice-opportunity", "#opportunity");
        setHref(".bos-start-panel .bos-choice-experience", "#experience");
        setHref(".bos-start-panel .bos-choice-not-sure", "#not-sure");

        setText("#paths .bos-section-heading h2", "What kind of work does this become?");
        setText("#paths .bos-section-heading .bos-section-text", "After the starting point is clear, the work usually turns into Solutions Engineering, Opportunity Engineering, or Discovery. This layer keeps those lenses without repeating the first question.");

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
