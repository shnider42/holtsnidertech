document.addEventListener("DOMContentLoaded", () => {
    const revealItems = document.querySelectorAll(".reveal");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
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