import "/static/js/boston-default-context.js";

document.addEventListener("DOMContentLoaded", () => {
    const boston = document.querySelector(".boston");

    if (!boston || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const targets = [
        ...boston.querySelectorAll([
            ".bos-section-heading",
            ".bos-start-panel",
            ".bos-operating-line",
            ".bos-process-flow",
            ".bos-path-grid",
            ".bos-experience-grid",
            ".bos-stack-grid",
            ".bos-work-grid",
            ".bos-case-grid",
            ".bos-proof-card",
            ".bos-portfolio-detail",
            ".bos-contact"
        ].join(", "))
    ];

    targets.forEach((target) => target.classList.add("bos-viewport-fade"));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const target = entry.target;

                if (entry.isIntersecting) {
                    target.classList.add("is-visible");
                    target.classList.remove("is-past");
                    return;
                }

                target.classList.remove("is-visible");

                if (entry.boundingClientRect.top < 0) {
                    target.classList.add("is-past");
                } else {
                    target.classList.remove("is-past");
                }
            });
        },
        {
            threshold: 0.08,
            rootMargin: "18% 0px 18% 0px"
        }
    );

    targets.forEach((target) => observer.observe(target));
});
