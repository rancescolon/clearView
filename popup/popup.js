document.addEventListener("DOMContentLoaded", async () => {
    const fontSelect = document.getElementById("fontSelect");

    // Load last used font
    const { selectedFont } = await chrome.storage.sync.get("selectedFont");
    if (selectedFont) fontSelect.value = selectedFont;

    // Apply immediately
    applyFont(fontSelect.value);

    // Apply live on change
    fontSelect.addEventListener("change", async () => {
        const newFont = fontSelect.value;
        await chrome.storage.sync.set({ selectedFont: newFont });
        applyFont(newFont);
    });
});

async function applyFont(font) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Inject text-formatter.js into the page
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["scripts/text-formatter.js"]
    });

    // Call the function inside the page
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (f) => formatPageText(f),
        args: [font]
    });
}
