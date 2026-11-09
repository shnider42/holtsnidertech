document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".boston");
    const dataNode = document.getElementById("featured-projects-data");
    if (!page || !dataNode) return;

    // The selected work and guided examples use the same server catalogue.
    // Keep content out of this controller so URLs and descriptions cannot drift.
    let catalogue;
    try {
        catalogue = JSON.parse(dataNode.textContent);
    } catch (error) {
        return;
    }
    if (!Array.isArray(catalogue.projects)) return;

    const safeProjectUrl = (value) => {
        if (typeof value !== "string") return null;
        try {
            const url = new URL(value, window.location.origin);
            if (url.protocol === "https:" ||
                (url.origin === window.location.origin && value.startsWith("/"))) {
                return url.href;
            }
        } catch (error) {
            // An invalid catalogue link must never become an executable href.
        }
        return null;
    };

    const projects = catalogue.projects
        .filter((project) => project && typeof project.title === "string")
        .map((project) => ({ ...project, href: safeProjectUrl(project.url) }))
        .filter((project) => project.href);
    if (!projects.length) return;

    const element = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    };

    const buildProjectCard = (project) => {
        const card = element("a", "bos-flow-example-card bos-featured-flow-card");
        card.dataset.project = project.id;
        card.href = project.href;
        if (new URL(project.href).origin !== window.location.origin) {
            card.target = "_blank";
            card.rel = "noopener noreferrer";
        }

        // Only local cover paths supplied by the server may become image URLs.
        // The server also provides a cover when new catalogue art is not bundled.
        if (typeof project.art_url === "string" && /^\/static\/img\/projects\/[a-z0-9-]+\.svg$/.test(project.art_url)) {
            const art = element("img", "bos-project-art");
            art.src = project.art_url;
            art.alt = "";
            art.width = 720;
            art.height = 420;
            art.loading = "lazy";
            art.decoding = "async";
            card.appendChild(art);
        }

        const copy = element("div", "bos-featured-card-copy");
        copy.append(
            element("em", "bos-example-category", project.focus || project.type),
            element("strong", "bos-example-title", project.title),
            element("span", "bos-example-description", project.description),
            element("span", "bos-example-action", "Open project"),
        );
        card.appendChild(copy);
        return card;
    };

    const syncProgressiveProjectCards = () => {
        const panel = page.querySelector('.bos-guided-flow.is-active[data-active-flow="opportunity"]');
        if (!panel || !["new-build", "improve-existing"].includes(panel.dataset.activeContext)) return;

        const grid = panel.querySelector(".bos-flow-example-grid");
        if (!grid || grid.dataset.projectShowcase === "selected-v2") return;

        // Mark first: subsequent observer callbacks must preserve keyboard focus,
        // the contact fields, and any draft the visitor has started writing.
        grid.dataset.projectShowcase = "selected-v2";
        grid.dataset.syncedProjectCards = "true";

        const intro = element("p", "bos-project-showcase-intro");
        intro.dataset.projectShowcaseIntro = "true";
        intro.append(
            element("strong", "", "A few things I've built"),
            element("span", "", "Information people can use, tools they can explore, and games they can play. Each starts with a different audience and a practical design problem."),
        );

        const links = element("div", "bos-project-directory-actions");
        const projectCount = Number.isInteger(catalogue.count) && catalogue.count > 0
            ? " " + catalogue.count : "";
        const directory = element("a", "bos-project-directory-link", "Browse all" + projectCount + " projects →");
        directory.href = "/projects";

        const supporting = element("p", "bos-project-supporting-demo");
        const grepper = element("a", "", "Grepper, a job-search workflow demo");
        grepper.href = "/static/demos/grepper.html";
        supporting.append(document.createTextNode("Also explore "), grepper, document.createTextNode("."));
        links.append(directory, supporting);

        grid.before(intro);
        grid.replaceChildren(...projects.map(buildProjectCard));
        grid.after(links);
    };

    // The existing flow controller replaces this panel when a choice changes.
    // Observe child changes only; none of the contact handlers are replaced.
    const observer = new MutationObserver(syncProgressiveProjectCards);
    observer.observe(page, { childList: true, subtree: true });
    syncProgressiveProjectCards();
});
