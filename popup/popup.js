function debounce(func, delay = 150) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
}


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

    const saved = await chrome.storage.sync.get();
    for (const key in controls) {
        if (saved[key] !== undefined) {
            if (controls[key].type === "checkbox") controls[key].checked = saved[key];
            else controls[key].value = saved[key];
        }
    }

    applySettings();

    // Example for debounced popup.js (already works with this content.js):
    const debouncedSave = debounce(() => {
        const options = {
            font: fontSelect.value,
            removeItalics: removeItalics.checked,
            linkSize: linkSize.value,
            linkColor: linkColor.value,
            linkHoverColor: linkHoverColor.value,
            lineSpacing: lineSpacing.value,
            letterSpacing: letterSpacing.value
        };
        chrome.storage.sync.set(options);
    }, 150);



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
