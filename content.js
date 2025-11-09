(async function () {
    // Load saved settings
    const settings = await chrome.storage.sync.get();

    if (Object.keys(settings).length === 0) return;

    // Generate CSS from text-formatter
    const css = getTextFormattingCSS(settings);

    // Insert CSS into the page
    let style = document.getElementById("clearview-style");
    if (!style) {
        style = document.createElement("style");
        style.id = "clearview-style";
        document.head.appendChild(style);
    }
    style.textContent = css;

    // Listen for storage changes to update CSS dynamically
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "sync") {
            const updatedSettings = { ...settings };
            for (const key in changes) updatedSettings[key] = changes[key].newValue;

            const updatedCSS = getTextFormattingCSS(updatedSettings);
            style.textContent = updatedCSS;
        }
    });
})();
