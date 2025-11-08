// colorFixer.js
export function applyColorScheme(scheme) {
    if (scheme === "light") {
        document.body.style.backgroundColor = "#F5F5F5";
        document.body.style.color = "#000000";
    } else if (scheme === "dark") {
        document.body.style.backgroundColor = "#222222";
        document.body.style.color = "#FFFFFF";
    }

    // Optional: update all links and headings for contrast
    document.querySelectorAll("a, h1, h2, h3").forEach(el => {
        el.style.color = scheme === "light" ? "#0000EE" : "#66CCFF";
    });
}
