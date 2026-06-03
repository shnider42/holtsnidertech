document.addEventListener("DOMContentLoaded", () => {
    const stack = document.querySelector(".boston .bos-stack-grid");

    if (!stack) {
        return;
    }

    stack.setAttribute("tabindex", "0");
    stack.setAttribute("aria-label", "Systems stack experience. Scroll horizontally, drag sideways on desktop, or use Shift plus mouse wheel.");

    let isDragging = false;
    let isInteracting = false;
    let startX = 0;
    let startScrollLeft = 0;
    let hasMoved = false;
    let idleTimer = null;
    let autoDriftFrame = null;
    let lastDriftTime = null;
    let driftDirection = 1;

    const setInteracting = () => {
        isInteracting = true;
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => {
            isInteracting = false;
        }, 2200);
    };

    const startDrag = (event) => {
        if (event.button !== 0) {
            return;
        }

        isDragging = true;
        setInteracting();
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
        setInteracting();
        event.preventDefault();
    };

    const stopDrag = () => {
        if (!isDragging) {
            return;
        }

        isDragging = false;
        stack.classList.remove("is-dragging");
        document.body.style.cursor = "";
        setInteracting();
    };

    const canAutoDrift = () => {
        return stack.scrollWidth > stack.clientWidth + 4
            && !isDragging
            && !isInteracting
            && !document.body.classList.contains("bos-reduce-motion")
            && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    };

    const drift = (time) => {
        if (lastDriftTime === null) {
            lastDriftTime = time;
        }

        const elapsed = Math.min(time - lastDriftTime, 60);
        lastDriftTime = time;

        if (canAutoDrift()) {
            const maxScroll = stack.scrollWidth - stack.clientWidth;
            const next = stack.scrollLeft + (driftDirection * elapsed * 0.012);

            if (next >= maxScroll - 1) {
                driftDirection = -1;
                stack.scrollLeft = maxScroll;
            } else if (next <= 1) {
                driftDirection = 1;
                stack.scrollLeft = 0;
            } else {
                stack.scrollLeft = next;
            }
        }

        autoDriftFrame = window.requestAnimationFrame(drift);
    };

    stack.addEventListener("mousedown", startDrag);
    window.addEventListener("mousemove", moveDrag);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("blur", stopDrag);

    stack.addEventListener("mouseenter", setInteracting);
    stack.addEventListener("focusin", setInteracting);
    stack.addEventListener("touchstart", setInteracting, { passive: true });

    stack.addEventListener("click", (event) => {
        if (!hasMoved) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        hasMoved = false;
    });

    stack.addEventListener("wheel", (event) => {
        setInteracting();

        if (!event.shiftKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
            return;
        }

        event.preventDefault();
        stack.scrollLeft += event.deltaY;
    }, { passive: false });

    stack.addEventListener("keydown", (event) => {
        const cardWidth = stack.querySelector(".bos-mini")?.getBoundingClientRect().width || 280;

        if (event.key === "ArrowRight") {
            event.preventDefault();
            setInteracting();
            stack.scrollBy({ left: cardWidth, behavior: "smooth" });
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            setInteracting();
            stack.scrollBy({ left: -cardWidth, behavior: "smooth" });
        }
    });

    autoDriftFrame = window.requestAnimationFrame(drift);

    window.addEventListener("beforeunload", () => {
        if (autoDriftFrame) {
            window.cancelAnimationFrame(autoDriftFrame);
        }
    });
});
