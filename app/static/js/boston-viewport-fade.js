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

document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".boston");
    if (!page) return;

    const contextTextFromHref = (href) => {
        const rawHref = href || "";
        const queryStart = rawHref.indexOf("?");
        const address = rawHref.startsWith("mailto:")
            ? decodeURIComponent(rawHref.slice(7, queryStart === -1 ? undefined : queryStart))
            : "chris@holtsnidertech.com";
        const params = new URLSearchParams(queryStart === -1 ? "" : rawHref.slice(queryStart + 1));
        return [
            `To: ${address}`,
            `Subject: ${params.get("subject") || "Holtsnider Tech inquiry"}`,
            "",
            params.get("body") || "Hi Chris,\n\nI came through the Holtsnider Tech site flow and wanted to share this context.\n\nThanks,"
        ].join("\n");
    };

    const relabelContextActions = () => {
        page.querySelectorAll(".bos-flow-mailto").forEach((link) => {
            link.textContent = "Show copyable context";
            link.setAttribute("role", "button");
        });
    };

    document.addEventListener("click", (event) => {
        const link = event.target.closest(".bos-flow-mailto");
        if (!link || !page.contains(link)) return;
        event.preventDefault();
        window.prompt("Copy this context text:", contextTextFromHref(link.getAttribute("href") || link.href));
    });

    relabelContextActions();
    new MutationObserver(relabelContextActions).observe(page, { childList: true, subtree: true });
});
