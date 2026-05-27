document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector(".site-nav");
    const portfolio = document.getElementById("portfolio");
    const root = document.documentElement;
    const themeToggle = document.querySelector("[data-theme-toggle]");
    const themeToggleLabel = document.querySelector("[data-theme-toggle-label]");
    const lightThemeStylesheet = document.getElementById("light-theme-stylesheet");

    const applyTheme = (theme) => {
        const isLight = theme === "light";

        root.dataset.theme = isLight ? "light" : "dark";

        if (lightThemeStylesheet) {
            lightThemeStylesheet.disabled = !isLight;
        }

        if (themeToggle) {
            themeToggle.setAttribute("aria-pressed", String(isLight));
            themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
        }

        if (themeToggleLabel) {
            themeToggleLabel.textContent = isLight ? "Light mode" : "Dark mode";
        }
    };

    let savedTheme = "dark";

    try {
        savedTheme = window.localStorage.getItem("holtsnider-theme") || "dark";
    } catch (error) {
        savedTheme = "dark";
    }

    applyTheme(savedTheme === "light" ? "light" : "dark");

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
            applyTheme(nextTheme);

            try {
                window.localStorage.setItem("holtsnider-theme", nextTheme);
            } catch (error) {
                // Keep the visible toggle working even if storage is unavailable.
            }
        });
    }

    const polishBostonHeadings = () => {
        const boston = document.querySelector(".boston");
        if (!boston) {
            return;
        }

        const replacements = new Map([
            ["Practical technical help, built close to the problem.", "Practical technical help, built close to the problem"],
            ["Start with the problem, not the tool.", "Start with the problem, not the tool"],
            ["You do not need the work done yet. You need the situation made clearer.", "You do not need the work done yet. You need the situation made clearer"],
            ["Bring the messy version.", "Bring the messy version"],
            ["Proof, not pitch.", "Proof, not pitch"],
            ["Good technical work should survive contact with real people.", "Good technical work should survive contact with real people"],
            ["There is a specific technical problem and you need someone to work through it.", "There is a specific technical problem and you need someone to work through it"],
            ["Your team has the work, but needs another technical lens.", "Your team has the work, but needs another technical lens"],
            ["Some problems are not one-and-done. They need a steady technical partner.", "Some problems are not one-and-done. They need a steady technical partner"]
        ]);

        boston.querySelectorAll("h1, h2, h3").forEach((heading) => {
            const replacement = replacements.get(heading.textContent.trim());
            if (replacement) {
                heading.textContent = replacement;
            }
        });
    };

    polishBostonHeadings();

    const ensureStylesheet = (href) => {
        if (document.querySelector(`link[href$="${href.split("/").pop()}"]`)) {
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
    };

    const initBostonMotion = () => {
        const boston = document.querySelector(".boston");
        if (!boston) {
            return;
        }

        const motionItems = [
            ...boston.querySelectorAll(
                ".bos-hero-grid, .bos-operating-line, .bos-section-heading, .bos-picker, .bos-cta-strip, .bos-proof-card, .bos-contact"
            )
        ];

        if (!motionItems.length) {
            return;
        }

        motionItems.forEach((item, index) => {
            item.classList.add("bos-motion-item");
            item.style.setProperty("--bos-reveal-delay", `${Math.min(index * 28, 140)}ms`);
        });

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            motionItems.forEach((item) => item.classList.add("is-visible"));
            return;
        }

        document.body.classList.add("bos-motion-ready");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const item = entry.target;

                    if (entry.isIntersecting) {
                        item.classList.add("is-visible");
                        item.classList.remove("is-past");
                        return;
                    }

                    item.classList.remove("is-visible");

                    if (entry.boundingClientRect.top < 0) {
                        item.classList.add("is-past");
                    } else {
                        item.classList.remove("is-past");
                    }
                });
            },
            {
                threshold: 0.04,
                rootMargin: "22% 0px 22% 0px"
            }
        );

        motionItems.forEach((item) => observer.observe(item));
    };

    const loadBostonPortfolioRoadmap = async () => {
        const boston = document.querySelector(".boston");
        const proofGrid = boston ? boston.querySelector(".bos-proof-grid") : null;
        if (!proofGrid) {
            return;
        }

        ensureStylesheet("/static/css/boston-portfolio-roadmap.css");

        try {
            const response = await fetch("/static/html/boston-portfolio-roadmap.html");
            if (!response.ok) {
                return;
            }

            proofGrid.innerHTML = await response.text();
            proofGrid.classList.add("is-roadmap");
        } catch (error) {
            console.warn("Unable to load Boston portfolio roadmap", error);
        }
    };

    loadBostonPortfolioRoadmap().finally(initBostonMotion);

    const ensureStyle = () => {
        ensureStylesheet("/static/css/proof-capabilities.css");
    };

    const showReveals = (rootNode) => {
        rootNode.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
    };

    const refactorPortfolio = async () => {
        if (!portfolio) {
            return;
        }

        ensureStyle();

        const proofLinks = nav ? nav.querySelectorAll('a[href="#proof"], a[href="#capabilities"]') : [];
        proofLinks.forEach((link) => link.remove());

        const grid = portfolio.querySelector(".portfolio-grid");
        if (!grid) {
            return;
        }

        try {
            const response = await fetch("/static/html/portfolio-cards.html");
            if (!response.ok) {
                return;
            }

            const html = await response.text();
            grid.innerHTML = html;
            showReveals(grid);
        } catch (error) {
            console.warn("Unable to load portfolio cards", error);
        }
    };

    refactorPortfolio();

    const revealItems = document.querySelectorAll(".reveal");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heroScrub = document.querySelector(".hero-scrub");

    if (prefersReducedMotion) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    const onLoadItems = document.querySelectorAll(".reveal-on-load");
    onLoadItems.forEach((item, index) => {
        window.setTimeout(() => {
            item.classList.add("is-visible");
        }, 80 + (index * 60));
    });

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
            });
        },
        {
            threshold: 0.14,
            rootMargin: "0px 0px -8% 0px"
        }
    );

    revealItems.forEach((item) => {
        if (item.classList.contains("reveal-on-load")) {
            return;
        }

        observer.observe(item);
    });

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const updateHeroScrub = () => {
        if (!heroScrub) {
            return;
        }

        const rect = heroScrub.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        const start = viewportHeight * 0.92;
        const end = -rect.height * 0.22;
        const rawProgress = (start - rect.top) / (start - end);
        const progress = clamp(rawProgress, 0, 1);

        const eased = 1 - Math.pow(1 - progress, 1.9);
        const percent = `${(eased * 100).toFixed(2)}%`;

        const tilt = `${((eased - 0.5) * 5.5).toFixed(2)}deg`;
        const shift = `${(eased * -18).toFixed(2)}px`;
        const orbit = `${(eased * 22).toFixed(2)}deg`;

        root.style.setProperty("--hero-scrub-progress", eased.toFixed(4));
        root.style.setProperty("--hero-scrub-percent", percent);
        root.style.setProperty("--hero-panel-tilt", tilt);
        root.style.setProperty("--hero-column-shift", shift);
        root.style.setProperty("--hero-orbit-rotate", orbit);
    };

    let ticking = false;

    const requestScrubUpdate = () => {
        if (ticking) {
            return;
        }

        ticking = true;
        window.requestAnimationFrame(() => {
            updateHeroScrub();
            ticking = false;
        });
    };

    updateHeroScrub();

    window.addEventListener("scroll", requestScrubUpdate, { passive: true });
    window.addEventListener("resize", requestScrubUpdate);
});