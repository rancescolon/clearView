// epilepsyWarning.js
export function detectFlashingContent() {
    document.querySelectorAll("*").forEach(el => {
        const bg = window.getComputedStyle(el).backgroundColor;
        if (bg === "rgb(255, 255, 255)" || bg === "rgb(255, 0, 0)") {
            console.warn("Epilepsy warning: flashing content detected");
            // Optional: pause animations or provide user warning
        }
    });
}
