(async function () {
    const openDyslexicURL = chrome.runtime.getURL("fonts/OpenDyslexic-Regular.woff");
    let isEnabled = false;

    // --- Create and Inject the Stylesheet ---
    function insertStyleSheet() {
        let style = document.getElementById("clearview-style");
        if (style) return; // Already injected

        style = document.createElement("style");
        style.id = "clearview-style";
        style.textContent = `
      @font-face {
        font-family: 'OpenDyslexic';
        src: url('${openDyslexicURL}') format('woff');
        font-weight: normal;
        font-style: normal;
      }

      /* CSS variables are always defined */
      :root {
        --cv-font: 'OpenDyslexic', Arial, sans-serif;
        --cv-remove-italics: normal;
        --cv-line-height: 1.4;
        --cv-letter-spacing: 0.05em;
        --cv-text-size: 1em;
        --cv-text-color: inherit;
        --cv-background-color: #FFFFFF;
        --cv-link-size: 1.05em;
        --cv-link-color: #0645AD;
        --cv-link-hover-color: #003399;
      }

      /* Styles are applied ONLY when .clearview-enabled is present */
      html.clearview-enabled, 
      html.clearview-enabled body {
        background-color: var(--cv-background-color) !important;
      }

      html.clearview-enabled * {
        font-family: var(--cv-font) !important;
        font-style: var(--cv-remove-italics) !important;
        line-height: var(--cv-line-height) !important;
        letter-spacing: var(--cv-letter-spacing) !important;
      }
      
      /* Only target text-holding elements, not structural containers */
      html.clearview-enabled body p, 
      html.clearview-enabled body li, 
      html.clearview-enabled body span,
      html.clearview-enabled body b,
      html.clearview-enabled body i,
      html.clearview-enabled body strong,
      html.clearview-enabled body em,
      html.clearview-enabled body blockquote,
      html.clearview-enabled body code,
      html.clearview-enabled body pre,
      html.clearview-enabled body td,
      html.clearview-enabled body th {
         font-size: var(--cv-text-size) !important;
         color: var(--cv-text-color) !important;
      }

      html.clearview-enabled h1, 
      html.clearview-enabled h2, 
      html.clearview-enabled h3, 
      html.clearview-enabled h4, 
      html.clearview-enabled h5, 
      html.clearview-enabled h6 {
         background-color: transparent !important;
         color: var(--cv-text-color) !important;
      }

      html.clearview-enabled a {
        font-size: var(--cv-link-size) !important;
        font-weight: 600 !important;
        color: var(--cv-link-color) !important;
        text-decoration: underline !important;
        padding: 2px 4px !important;
        border-radius: 4px !important;
        background-color: transparent !important;
      }

      html.clearview-enabled a:hover, 
      html.clearview-enabled a:focus {
        background-color: #dbe9ff !important;
        color: var(--cv-link-hover-color) !important;
        outline: 2px solid #99c2ff !important;
      }

      html.clearview-enabled *:focus-visible:not(a) {
        outline: 2px solid #005fcc !important;
        box-shadow: 0 0 5px #005fcc !important;
        border-radius: 2px !important;
      }
    `;
        document.head.appendChild(style);
    }

    // --- NEW: Function to manage the blue tint filter ---
    function setBlueTint(enabled) {
        let tintStyle = document.getElementById("clearview-blue-tint-style");
        if (enabled) {
            if (tintStyle) return; // Already on
            tintStyle = document.createElement("style");
            tintStyle.id = "clearview-blue-tint-style";
            // This filter shifts reds to blues
            tintStyle.textContent = `
                html {
                    filter: sepia(0.8) hue-rotate(180deg) saturate(2) !important;
                }
            `;
            document.head.appendChild(tintStyle);
        } else {
            if (tintStyle) {
                tintStyle.remove(); // Turn off
            }
        }
    }

    // --- Apply CSS variables to root ---
    function updateVariables(opts) {
        const root = document.documentElement;
        if (!opts) return;

        // Determine font family string with fallbacks
        let fontName = opts.font;
        let fontCSS = "";

        if (fontName === "OpenDyslexic") {
            fontCSS = "'OpenDyslexic', Arial, sans-serif";
        } else if (fontName === "Times New Roman" || fontName === "Georgia") {
            fontCSS = `'${fontName}', serif`;
        } else {
            // Arial, Verdana, Tahoma, Courier New, and any new sans-serif/monospace font
            fontCSS = `'${fontName}', sans-serif`;
        }

        root.style.setProperty("--cv-font", fontCSS);
        root.style.setProperty("--cv-remove-italics", opts.removeItalics ? "normal" : "inherit");
        root.style.setProperty("--cv-text-size", (opts.textSize || 1.0) + "em");
        root.style.setProperty("--cv-text-color", opts.textColor || "inherit");
        root.style.setProperty("--cv-background-color", opts.backgroundColor || "#FFFFFF");
        root.style.setProperty("--cv-line-height", opts.lineSpacing || 1.4);
        root.style.setProperty("--cv-letter-spacing", (opts.letterSpacing || 0.05) + "em");
        root.style.setProperty("--cv-link-size", (opts.linkSize || 1.05) + "em");
        root.style.setProperty("--cv-link-color", opts.linkColor || "#0645AD");
        root.style.setProperty("--cv-link-hover-color", opts.linkHoverColor || "#003399");
    }

    // --- Enable or Disable Styling ---
    function setEnabled(newStatus, settings) {
        isEnabled = newStatus;
        if (isEnabled) {
            document.documentElement.classList.add("clearview-enabled");
            updateVariables(settings); // Apply current settings
        } else {
            document.documentElement.classList.remove("clearview-enabled");
        }
    }

    // --- Initial Load ---
    insertStyleSheet();
    const settings = await chrome.storage.sync.get();
    const initialStatus = settings.extensionEnabled !== false; // Default ON
    setEnabled(initialStatus, settings);

    // NEW: Set initial blue tint state
    setBlueTint(settings.blueTint === true);

    // --- Listen for live updates ---
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "updateSettings") {
            // Only apply if enabled
            if (isEnabled) {
                updateVariables(message.settings);
            }
        } else if (message.action === "setExtensionEnabled") {
            // This is the message from the master toggle
            (async () => {
                const currentSettings = await chrome.storage.sync.get();
                setEnabled(message.enabled, currentSettings);
            })();
        } else if (message.action === "setBlueTint") {
            // NEW: Listen for blue tint toggle
            setBlueTint(message.enabled);
        }
    });
})();