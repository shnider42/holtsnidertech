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

    const renderBostonDiagnostic = () => {
        const picker = document.querySelector(".boston .bos-picker");
        if (!picker) {
            return;
        }

        picker.innerHTML = `
            <input class="bos-option-input" type="radio" name="bos-problem" id="bos-problem-data" checked>
            <input class="bos-option-input" type="radio" name="bos-problem" id="bos-problem-automation">
            <input class="bos-option-input" type="radio" name="bos-problem" id="bos-problem-website">
            <input class="bos-option-input" type="radio" name="bos-problem" id="bos-problem-troubleshooting">

            <div class="bos-options" role="list" aria-label="Problem types">
                <label class="bos-option" for="bos-problem-data"><em>01</em><strong>Advice / translation</strong></label>
                <label class="bos-option" for="bos-problem-automation"><em>02</em><strong>Specific technical problem</strong></label>
                <label class="bos-option" for="bos-problem-website"><em>03</em><strong>Existing team problem</strong></label>
                <label class="bos-option" for="bos-problem-troubleshooting"><em>04</em><strong>Longer-term support</strong></label>
            </div>

            <div class="bos-panels">
                <article class="bos-panel panel-data">
                    <span class="bos-path-kicker">Diagnostic path / Advice</span>
                    <h3>You do not need the work done yet. You need the situation made clearer.</h3>
                    <p class="bos-path-note">Good first step: a consulting call to translate the options and risks.</p>
                    <p>For a small business facing DNS, hosting, cloud, vendor, security, software, or general IT choices, the first value may be independent guidance before anyone touches the system.</p>
                    <div class="bos-panel-grid">
                        <div class="bos-mini">
                            <strong>Useful outputs</strong>
                            <ul class="bos-list">
                                <li>Plain-English explanation</li>
                                <li>Questions to ask a provider</li>
                                <li>Decision tradeoffs</li>
                            </ul>
                        </div>
                        <div class="bos-mini">
                            <strong>Fit</strong>
                            <p>Small-business tech guidance, provider selection, vendor translation, and ad hoc technical sanity checks.</p>
                        </div>
                    </div>
                </article>

                <article class="bos-panel panel-automation">
                    <span class="bos-path-kicker">Diagnostic path / Hands-on</span>
                    <h3>There is a specific technical problem and you need someone to work through it.</h3>
                    <p class="bos-path-note">Good first step: isolate what changed, what fails, and what evidence exists.</p>
                    <p>This is the direct problem-solving lane: debugging, troubleshooting, small tooling, workflow repair, deployment weirdness, data cleanup, or practical implementation work.</p>
                    <div class="bos-panel-grid">
                        <div class="bos-mini">
                            <strong>Useful outputs</strong>
                            <ul class="bos-list">
                                <li>Root-cause notes</li>
                                <li>Fix or workaround</li>
                                <li>Small tool or cleanup path</li>
                            </ul>
                        </div>
                        <div class="bos-mini">
                            <strong>Fit</strong>
                            <p>When there is a concrete issue, limited context, and a need to start untangling the problem directly.</p>
                        </div>
                    </div>
                </article>

                <article class="bos-panel panel-website">
                    <span class="bos-path-kicker">Diagnostic path / Team advisory</span>
                    <h3>Your team has the work, but needs another technical lens.</h3>
                    <p class="bos-path-note">Good first step: review the current thinking and pressure-test the path forward.</p>
                    <p>This is for existing technical teams that need outside perspective on reliability, testing, process, rollout risk, customer impact, or cross-functional communication.</p>
                    <div class="bos-panel-grid">
                        <div class="bos-mini">
                            <strong>Useful outputs</strong>
                            <ul class="bos-list">
                                <li>Problem framing</li>
                                <li>Risk review</li>
                                <li>Next-step recommendation</li>
                            </ul>
                        </div>
                        <div class="bos-mini">
                            <strong>Fit</strong>
                            <p>Technical review, QE/SRE-style judgment, stakeholder translation, and practical second-opinion support.</p>
                        </div>
                    </div>
                </article>

                <article class="bos-panel panel-troubleshooting">
                    <span class="bos-path-kicker">Diagnostic path / Ongoing</span>
                    <h3>Some problems are not one-and-done. They need a steady technical partner.</h3>
                    <p class="bos-path-note">Good first step: define the support shape before promising the solution.</p>
                    <p>This is for longer-term support, fractional technical help, recurring advisory time, or a bigger conversation about embedded support or full-time fit.</p>
                    <div class="bos-panel-grid">
                        <div class="bos-mini">
                            <strong>Useful outputs</strong>
                            <ul class="bos-list">
                                <li>Support scope</li>
                                <li>Operating rhythm</li>
                                <li>Priority map</li>
                            </ul>
                        </div>
                        <div class="bos-mini">
                            <strong>Fit</strong>
                            <p>When the need is ongoing guidance, technical ownership, recurring support, or a deeper working relationship.</p>
                        </div>
                    </div>
                </article>
            </div>
        `;
    };

    renderBostonDiagnostic();

    const ensureStyle = () => {
        if (document.querySelector('link[href$="proof-capabilities.css"]')) {
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/static/css/proof-capabilities.css";
        document.head.appendChild(link);
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