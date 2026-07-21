(() => {
    "use strict";

    const header = document.querySelector(".site-header");
    const menuButton = document.querySelector(".menu-button");
    const nav = document.querySelector(".site-nav");
    const navLinks = nav ? [...nav.querySelectorAll("a")] : [];
    const revealItems = [...document.querySelectorAll(".reveal")];
    const yearNode = document.querySelector("[data-current-year]");

    if (yearNode) {
        yearNode.textContent = new Date().getFullYear();
    }

    const setHeaderState = () => {
        if (!header) return;
        header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    const closeMenu = () => {
        if (!menuButton || !nav) return;
        menuButton.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        document.body.classList.remove("menu-open");
    };

    if (menuButton && nav) {
        menuButton.addEventListener("click", () => {
            const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
            menuButton.setAttribute("aria-expanded", String(willOpen));
            nav.classList.toggle("is-open", willOpen);
            document.body.classList.toggle("menu-open", willOpen);
        });

        navLinks.forEach((link) => link.addEventListener("click", closeMenu));

        window.addEventListener("resize", () => {
            if (window.innerWidth > 920) closeMenu();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeMenu();
        });
    }

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                currentObserver.unobserve(entry.target);
            });
        },
        {
            threshold: 0.14,
            rootMargin: "0px 0px -36px",
        },
    );

    revealItems.forEach((item) => observer.observe(item));
})();
