document.addEventListener("DOMContentLoaded", () => {
    const stack = document.querySelector(".boston .bos-stack-grid");

    if (!stack) {
        return;
    }

    stack.setAttribute("tabindex", "0");
    stack.setAttribute("aria-label", "Systems stack experience. Scroll horizontally, drag sideways on desktop, or use the left and right arrow keys.");

    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let hasMoved = false;

    const startDrag = (event) => {
        if (event.button !== 0) {
            return;
        }

        isDragging = true;
        startX = event.clientX;
        startScrollLeft = stack.scrollLeft;
        hasMoved = false;
        stack.classList.add("is-dragging");
        document.body.style.cursor = "grabbing";
    };

    const moveDrag = (event) => {
        if (!isDragging) {
            return;
        }

        const distance = event.clientX - startX;
        if (Math.abs(distance) > 4) {
            hasMoved = true;
        }

        stack.scrollLeft = startScrollLeft - distance;
        event.preventDefault();
    };

    const stopDrag = () => {
        if (!isDragging) {
            return;
        }

        isDragging = false;
        stack.classList.remove("is-dragging");
        document.body.style.cursor = "";
    };

    stack.addEventListener("mousedown", startDrag);
    window.addEventListener("mousemove", moveDrag);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("blur", stopDrag);

    stack.addEventListener("click", (event) => {
        if (!hasMoved) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        hasMoved = false;
    });

    stack.addEventListener("wheel", (event) => {
        if (!event.shiftKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
            return;
        }

        event.preventDefault();
        stack.scrollLeft += event.deltaY;
    }, { passive: false });

    stack.addEventListener("keydown", (event) => {
        const cardWidth = stack.querySelector(".bos-mini")?.getBoundingClientRect().width || 280;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const behavior = reducedMotion ? "auto" : "smooth";

        if (event.key === "ArrowRight") {
            event.preventDefault();
            stack.scrollBy({ left: cardWidth, behavior });
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            stack.scrollBy({ left: -cardWidth, behavior });
        }
    });
});
