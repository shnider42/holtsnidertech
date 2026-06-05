document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".boston");
    if (!page) return;

    page.querySelectorAll('.bos-links a[href="#start"], .bos-links a[href="#contact"], .bos-motion-toggle').forEach((item) => {
        item.remove();
    });

    document.body.classList.remove("bos-reduce-motion");

    try {
        window.localStorage.removeItem("holtsnider-reduce-motion");
    } catch (error) {
        // Ignore storage failures.
    }
});
