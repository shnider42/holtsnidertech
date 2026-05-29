document.addEventListener("DOMContentLoaded", () => {
    const stack = document.querySelector(".boston .bos-stack-grid");

    if (!stack) {
        return;
    }

    stack.setAttribute("tabindex", "0");
    stack.setAttribute("aria-label", "Systems stack experience. Drag horizontally or use Shift plus mouse wheel to scroll sideways.");

    let isDragging = false;
    let pointerId = null;
    let startX = 0;
    let startScrollLeft = 0;
    let hasMoved = false;

    const stopDragging = () => {
        if (!isDragging) {
            return;
        }

        if (pointerId !== null && stack.hasPointerCapture(pointerId)) {
            stack.releasePointerCapture(pointerId);
        }

        isDragging = false;
        pointerId = null;
        stack.classList.remove("is-dragging");
    };

    stack.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 || event.pointerType === "touch") {
            return;
        }

        isDragging = true;
        pointerId = event.pointerId;
        startX = event.clientX;
        startScrollLeft = stack.scrollLeft;
        hasMoved = false;
        stack.classList.add("is-dragging");
        stack.setPointerCapture(pointerId);
        event.preventDefault();
    });

    stack.addEventListener("pointermove", (event) => {
        if (!isDragging || event.pointerId !== pointerId) {
            return;
        }

        const distance = event.clientX - startX;
        if (Math.abs(distance) > 3) {
            hasMoved = true;
        }

        stack.scrollLeft = startScrollLeft - distance;
        event.preventDefault();
    });

    stack.addEventListener("pointerup", stopDragging);
    stack.addEventListener("pointercancel", stopDragging);
    stack.addEventListener("lostpointercapture", stopDragging);

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
        const cardWidth = stack.querySelector(".bos-mini")?.getBoundingClientRect().width || 260;

        if (event.key === "ArrowRight") {
            event.preventDefault();
            stack.scrollBy({ left: cardWidth, behavior: "smooth" });
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            stack.scrollBy({ left: -cardWidth, behavior: "smooth" });
        }
    });
});
