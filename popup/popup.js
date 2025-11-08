document.addEventListener("DOMContentLoaded", async () => {
    const controls = {
        font: document.getElementById("fontSelect"),
        removeItalics: document.getElementById("removeItalics"),
        linkSize: document.getElementById("linkSize"),
        linkColor: document.getElementById("linkColor"),
        linkHoverColor: document.getElementById("linkHoverColor"),
        lineSpacing: document.getElementById("lineSpacing"),
        letterSpacing: document.getElementById("letterSpacing"),
    };

    // Load saved settings
    const saved = await chrome.storage.sync.get();
    for (const key in controls) {
        if (saved[key] !== undefined) {
            if (controls[key].type === "checkbox") controls[key].checked = saved[key];
            else controls[key].value = saved[key];
        }
    }

    // Apply immediately
    applySettings();

    const debouncedApply = debounce(() => {
        saveSettings();
        applySettings();
    }, 150); // 150ms delay

    // Listen to changes on all controls
    for (const key in controls) {
        controls[key].addEventListener("input", debouncedApply);
    }

    async function saveSettings() {
        const data = {};
        for (const key in controls) {
            data[key] = controls[key].type === "checkbox" ? controls[key].checked : controls[key].value;
        }
        await chrome.storage.sync.set(data);
    }

    async function applySettings() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["scripts/text-formatter.js"]
        });

        const options = {};
        for (const key in controls) {
            options[key] = controls[key].type === "checkbox" ? controls[key].checked : controls[key].value;
        }

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (opts) => formatPageText(opts),
            args: [options]
        });
    }
});


// Debounce helper
function debounce(func, delay = 200) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
}
