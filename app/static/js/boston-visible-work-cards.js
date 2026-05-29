document.addEventListener("DOMContentLoaded", () => {
    const passageCard = document.querySelector(".boston .bos-project-site");

    if (!passageCard) {
        return;
    }

    passageCard.classList.remove("bos-project-site");
    passageCard.classList.add("bos-project-passage");
    passageCard.setAttribute("href", "https://tim-today.onrender.com/");
    passageCard.setAttribute("target", "_blank");
    passageCard.setAttribute("rel", "noopener noreferrer");

    const label = passageCard.querySelector(".bos-card-label");
    const title = passageCard.querySelector("h3");
    const body = passageCard.querySelector("p");
    const action = passageCard.querySelector(".bos-card-action");

    if (label) {
        label.textContent = "Daily Flyer";
    }

    if (title) {
        title.textContent = "Your Passage";
    }

    if (body) {
        body.textContent = "A reflective daily-page implementation shaped around personal passages, warm presentation, and reusable content structure.";
    }

    if (action) {
        action.textContent = "View site";
    }
});
