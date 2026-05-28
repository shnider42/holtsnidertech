document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector(".site-nav");
    const portfolio = document.getElementById("portfolio");
    const root = document.documentElement;
    const themeToggle = document.querySelector("[data-theme-toggle]");
    const themeToggleLabel = document.querySelector("[data-theme-toggle-label]");
    const lightThemeStylesheet = document.getElementById("light-theme-stylesheet");
    // Keep the pause before section settling separate from the scroll animation duration.
    const SECTION_SETTLE_DELAY_MS = 250;
    const AUTO_SCROLL_DURATION_MS = 500;
    let isAutomaticScrollActive = false;
    let activeScrollAnimation = null;
    let scrollInterruptListenersBound = false;

    const ensureStylesheet = (href) => {
        if (document.querySelector(`link[href$="${href.split("/").pop()}"]`)) {
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
    };

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
            ["You do not need the work done yet. You need the situation made clearer.", "You do not need the situation made clearer"],
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

    const updateChoiceCard = (card, label, title, description, action) => {
        if (!card) {
            return;
        }

        const labelNode = card.querySelector(".bos-card-label");
        const titleNode = card.querySelector("h3");
        const descriptionNode = card.querySelector("p");
        const actionNode = card.querySelector(".bos-choice-action");

        if (labelNode) {
            labelNode.textContent = label;
        }
        if (titleNode) {
            titleNode.textContent = title;
        }
        if (descriptionNode) {
            descriptionNode.textContent = description;
        }
        if (actionNode) {
            actionNode.textContent = action;
        }
    };

    const polishBostonPublicCopy = () => {
        const boston = document.querySelector(".boston");
        if (!boston) {
            return;
        }

        const mark = boston.querySelector(".bos-mark");
        if (mark) {
            mark.setAttribute("href", "/");
            mark.setAttribute("aria-label", "Holtsnider Tech home");
            mark.textContent = "HT";
        }

        boston.querySelectorAll('.bos-links a[href*="style-lab"], .bos-links a[href*="/style-lab"]').forEach((link) => link.remove());
        document.querySelectorAll('a[href*="style-lab"], a[href*="/style-lab"]').forEach((link) => {
            if (!link.closest(".bos-project-site")) {
                link.remove();
            }
        });

        const heroKicker = boston.querySelector(".bos-hero .bos-kicker");
        if (heroKicker) {
            heroKicker.textContent = "Solutions Engineering + Opportunity Engineering";
        }

        const heroTitle = boston.querySelector(".bos-hero h1");
        if (heroTitle) {
            heroTitle.innerHTML = "Holtsnider <span>Tech</span>";
        }

        const heroLede = boston.querySelector(".bos-hero .bos-lede");
        if (heroLede) {
            heroLede.textContent = "Practical help for messy technical situations: solve what is broken, find what could work better, and turn unclear systems, workflows, and ideas into the next useful move.";
        }

        const primaryHeroAction = boston.querySelector('.bos-hero .bos-btn[href="#start"]');
        if (primaryHeroAction) {
            primaryHeroAction.setAttribute("href", "#paths");
            primaryHeroAction.textContent = "Follow the decision path";
        }

        const startHeading = boston.querySelector(".bos-start-heading h2");
        if (startHeading) {
            startHeading.textContent = "Where should we start?";
        }

        const startText = boston.querySelector(".bos-start-heading .bos-section-text");
        if (startText) {
            startText.textContent = "Pick the closest starting point. Tap a card to continue, or hover/focus for the first conversation cue.";
        }

        updateChoiceCard(boston.querySelector(".bos-choice-solve"), "01 / Solve", "Solve", "Address an issue", "Go to Solutions path");
        updateChoiceCard(boston.querySelector(".bos-choice-opportunity"), "02 / Launch an idea", "Launch an idea", "Find an opportunity to explore", "Go to Opportunity path");
        updateChoiceCard(boston.querySelector(".bos-choice-experience"), "03 / HT Experience", "HT Experience", "Chris's experience", "Go to experience");
        updateChoiceCard(boston.querySelector(".bos-choice-not-sure"), "04 / Start a discovery", "Start a discovery", "You're unsure, let's figure it out together!", "Go to Discovery path");

        const solveChoice = boston.querySelector(".bos-start-panel .bos-choice-solve");
        if (solveChoice) {
            solveChoice.setAttribute("href", "#solve");
        }
        const opportunityChoice = boston.querySelector(".bos-start-panel .bos-choice-opportunity");
        if (opportunityChoice) {
            opportunityChoice.setAttribute("href", "#opportunity");
        }
        const experienceChoice = boston.querySelector(".bos-start-panel .bos-choice-experience");
        if (experienceChoice) {
            experienceChoice.setAttribute("href", "#experience");
        }
        const discoveryChoice = boston.querySelector(".bos-start-panel .bos-choice-not-sure");
        if (discoveryChoice) {
            discoveryChoice.setAttribute("href", "#not-sure");
        }

        const siteCard = boston.querySelector(".bos-project-site");
        if (siteCard) {
            siteCard.setAttribute("href", "#contact");
            const action = siteCard.querySelector(".bos-card-action");
            if (action) {
                action.textContent = "Discuss site direction";
            }
        }

        boston.querySelectorAll(".bos-kicker").forEach((item) => {
            if (item.textContent.includes("candidate homepage")) {
                item.textContent = "Holtsnider Tech";
            }
        });

        boston.querySelectorAll(".bos-section-text").forEach((item) => {
            if (item.textContent.includes("portfolio is not finished")) {
                item.textContent = "Selected project families that show how Holtsnider Tech turns unclear ideas, workflows, and research problems into practical tools and demos.";
            }
        });

        boston.querySelectorAll(".bos-contact-note").forEach((item) => {
            item.textContent = "The useful first step is simple: describe the messy version, the constraint, or the decision you are trying to make.";
        });

        boston.querySelectorAll(".bos-cta-strip").forEach((section) => section.remove());
        document.querySelectorAll(".style-lab-link, .style-switcher, .variant-switcher").forEach((item) => item.remove());
    };

    const initBostonMotionToggle = () => {
        const boston = document.querySelector(".boston");
        const links = boston ? boston.querySelector(".bos-links") : null;
        if (!boston || !links || links.querySelector(".bos-motion-toggle")) {
            return null;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "bos-motion-toggle";

        const readPreference = () => {
            try {
                return window.localStorage.getItem("holtsnider-reduce-motion") === "true";
            } catch (error) {
                return false;
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
            const nextValue = !button.matches('[aria-pressed="true"]');
            applyPreference(nextValue);
            try {
                window.localStorage.setItem("holtsnider-reduce-motion", String(nextValue));
            } catch (error) {
                // Keep the visible toggle working even if storage is unavailable.
            }
        });

        return {
            isReduced: () => button.matches('[aria-pressed="true"]')
        };
    };

    polishBostonHeadings();
    polishBostonPublicCopy();
    const motionToggleState = initBostonMotionToggle();
    ensureStylesheet("/static/css/boston-ht3-flow-layout.css");

    const cancelAutomaticScroll = () => {
        if (!activeScrollAnimation) {
            return;
        }

        activeScrollAnimation.cancelled = true;
        activeScrollAnimation = null;
        isAutomaticScrollActive = false;
    };

    const bindScrollInterrupts = () => {
        if (scrollInterruptListenersBound) {
            return;
        }

        scrollInterruptListenersBound = true;
        window.addEventListener("wheel", cancelAutomaticScroll, { passive: true });
        window.addEventListener("touchstart", cancelAutomaticScroll, { passive: true });
        window.addEventListener("keydown", (event) => {
            const navigationKeys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Spacebar"];
            if (navigationKeys.includes(event.key)) {
                cancelAutomaticScroll();
            }
        });
    };

    const smoothScrollTo = (targetY, duration = AUTO_SCROLL_DURATION_MS) => {
        const startY = window.scrollY || window.pageYOffset;
        const distance = targetY - startY;
        const startTime = window.performance.now();
        const animation = { cancelled: false };

        if (Math.abs(distance) < 2) {
            return Promise.resolve();
        }

        if (activeScrollAnimation) {
            activeScrollAnimation.cancelled = true;
        }

        activeScrollAnimation = animation;

        return new Promise((resolve) => {
            const step = (currentTime) => {
                if (animation.cancelled) {
                    if (activeScrollAnimation === animation) {
                        activeScrollAnimation = null;
                    }
                    resolve({ cancelled: true });
                    return;
                }

                const elapsed = Math.min((currentTime - startTime) / duration, 1);
                const eased = elapsed < 0.5
                    ? 4 * elapsed * elapsed * elapsed
                    : 1 - Math.pow(-2 * elapsed + 2, 3) / 2;

                window.scrollTo({ top: startY + (distance * eased), left: 0, behavior: "auto" });

                if (elapsed < 1) {
                    window.requestAnimationFrame(step);
                    return;
                }

                if (activeScrollAnimation === animation) {
                    activeScrollAnimation = null;
                }
                resolve({ cancelled: false });
            };

            window.requestAnimationFrame(step);
        });
    };

    const scrollTargetToTop = (target, duration = AUTO_SCROLL_DURATION_MS) => {
        const targetY = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
        return smoothScrollTo(targetY, duration);
    };

    const runAutomaticScroll = (scrollTask) => {
        bindScrollInterrupts();
        isAutomaticScrollActive = true;
        return scrollTask().finally(() => {
            window.setTimeout(() => {
                if (!activeScrollAnimation) {
                    isAutomaticScrollActive = false;
                }
            }, 80);
        });
    };

    const initBostonAnchorScroll = () => {
        const boston = document.querySelector(".boston");
        if (!boston) {
            return;
        }

        boston.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener("click", (event) => {
                const selector = link.getAttribute("href");
                if (!selector || selector === "#") {
                    return;
                }

                const target = boston.querySelector(selector);
                if (!target) {
                    return;
                }

                event.preventDefault();
                runAutomaticScroll(() => scrollTargetToTop(target, AUTO_SCROLL_DURATION_MS));
                try {
                    window.history.replaceState(null, "", selector);
                } catch (error) {
                    // Ignore history failures; scrolling still worked.
                }
            });
        });
    };

    initBostonAnchorScroll();

    const initDesktopSectionSettle = () => {
        const boston = document.querySelector(".boston");
        const desktopQuery = window.matchMedia("(min-width: 1081px)");
        const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

        if (!boston) {
            return;
        }

        let settleTimer = null;

        const getTargets = () => [
            ...boston.querySelectorAll(".bos-wrap > .bos-section, .bos-contact")
        ].filter((section) => section.id);

        const isReduced = () => Boolean(motionToggleState && motionToggleState.isReduced());

        const chooseTarget = () => {
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            const firstScreen = boston.querySelector(".bos-first-screen");

            if (firstScreen && firstScreen.getBoundingClientRect().bottom > viewportHeight * 0.35) {
                return null;
            }

            const candidates = getTargets()
                .map((section) => {
                    const rect = section.getBoundingClientRect();
                    const containsFocusLine = rect.top <= viewportHeight * 0.54 && rect.bottom >= viewportHeight * 0.38;
                    const tooTallToSnap = rect.height > viewportHeight * 1.35;

                    return {
                        section,
                        rect,
                        containsFocusLine,
                        tooTallToSnap,
                        score: Math.abs(rect.top)
                    };
                })
                .filter((candidate) => !candidate.tooTallToSnap && candidate.rect.bottom > 0 && candidate.rect.top < viewportHeight);

            if (!candidates.length) {
                return null;
            }

            const containing = candidates.filter((candidate) => candidate.containsFocusLine);
            const pool = containing.length ? containing : candidates;

            pool.sort((a, b) => a.score - b.score);
            return pool[0];
        };

        const settleSection = () => {
            if (!desktopQuery.matches || reducedMotionQuery.matches || isReduced() || isAutomaticScrollActive) {
                return;
            }

            const target = chooseTarget();
            if (!target || Math.abs(target.rect.top) < 10) {
                return;
            }

            runAutomaticScroll(() => scrollTargetToTop(target.section, AUTO_SCROLL_DURATION_MS));
        };

        const requestSettle = () => {
            if (!desktopQuery.matches || reducedMotionQuery.matches || isReduced() || isAutomaticScrollActive) {
                return;
            }

            window.clearTimeout(settleTimer);
            settleTimer = window.setTimeout(settleSection, SECTION_SETTLE_DELAY_MS);
        };

        window.addEventListener("scroll", requestSettle, { passive: true });
        window.addEventListener("resize", () => window.clearTimeout(settleTimer));
    };

    initDesktopSectionSettle();

    const initBostonMotion = () => {
        const boston = document.querySelector(".boston");
        if (!boston) {
            return;
        }

        const motionItems = [
            ...boston.querySelectorAll(
                ".bos-hero-grid, .bos-operating-line, .bos-section-heading, .bos-picker, .bos-process-flow, .bos-proof-card, .bos-portfolio-detail, .bos-contact"
            )
        ];

        if (!motionItems.length) {
            return;
        }

        motionItems.forEach((item, index) => {
            item.classList.add("bos-motion-item");
            item.style.setProperty("--bos-reveal-delay", `${Math.min(index * 28, 140)}ms`);
        });

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || (motionToggleState && motionToggleState.isReduced())) {
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

    const loadBostonProcessFlow = async () => {
        const boston = document.querySelector(".boston");
        const diagnostic = boston ? boston.querySelector("#diagnostic") : null;
        if (!diagnostic || boston.querySelector("#process-flow")) {
            return;
        }

        try {
            const response = await fetch("/static/html/boston-process-flow.html");
            if (!response.ok) {
                return;
            }

            diagnostic.insertAdjacentHTML("beforebegin", await response.text());
        } catch (error) {
            console.warn("Unable to load Boston process flow", error);
        }
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

            const detailResponse = await fetch("/static/html/boston-daily-flyer-detail.html");
            if (detailResponse.ok) {
                proofGrid.insertAdjacentHTML("afterend", await detailResponse.text());
            }

            const topicResponse = await fetch("/static/html/boston-topic-coverage-mapper-detail.html");
            const dailyDetail = boston.querySelector(".bos-daily-detail");
            if (topicResponse.ok) {
                const insertTarget = dailyDetail || proofGrid;
                insertTarget.insertAdjacentHTML("afterend", await topicResponse.text());
            }
        } catch (error) {
            console.warn("Unable to load Boston portfolio roadmap", error);
        }
    };

    Promise.all([loadBostonProcessFlow(), loadBostonPortfolioRoadmap()]).finally(initBostonMotion);

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