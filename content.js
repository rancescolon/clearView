// content.js
(async function () {
    // Load saved settings from storage
    const settings = await chrome.storage.sync.get();

    // Apply text formatter with saved options
    if (Object.keys(settings).length > 0) {
        // Inject the text-formatter.js script first
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("scripts/text-formatter.js");
        script.onload = () => {
            formatPageText(settings);
        };
        document.head.appendChild(script);
    }
})();
