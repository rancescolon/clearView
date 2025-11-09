(async function () {
    // Load saved settings
    const settings = await chrome.storage.sync.get();

    function applyTextFormatting(options) {
        const openDyslexicURL = chrome.runtime.getURL("fonts/OpenDyslexic-Regular.woff");

        const style = document.createElement("style");
        style.id = "clearview-style";

        style.textContent = `
      @font-face {
        font-family: 'OpenDyslexic';
        src: url('${openDyslexicURL}') format('woff');
        font-weight: normal;
        font-style: normal;
      }

      * {
        font-family: ${options.font || "Arial"}, Arial, sans-serif !important;
        ${options.removeItalics ? "font-style: normal !important;" : ""}
        line-height: ${options.lineSpacing || 1.4} !important;
        letter-spacing: ${options.letterSpacing || 0.05}em !important;
      }

      em, i {
        ${options.removeItalics ? "font-style: normal !important;" : ""}
      }

      a {
        font-size: ${options.linkSize || 1.05}em !important;
        font-weight: 600 !important;
        color: ${options.linkColor || "#0645AD"} !important;
        text-decoration: underline !important;
        padding: 2px 4px !important;
        border-radius: 4px !important;
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      a:hover, a:focus {
        background-color: #dbe9ff !important;
        color: ${options.linkHoverColor || "#003399"} !important;
        outline: 2px solid #99c2ff !important;
      }
    `;

        const existing = document.getElementById("clearview-style");
        if (existing) existing.remove();
        document.head.appendChild(style);
    }

    // Apply settings immediately
    applyTextFormatting(settings);

    // Listen for changes in storage (popup updates)
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "sync") {
            const newSettings = { ...settings };
            for (const key in changes) newSettings[key] = changes[key].newValue;
            applyTextFormatting(newSettings);
        }
    });
})();
