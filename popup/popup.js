// DOM elements
const fontSelect = document.getElementById("fontSelect");
const removeItalics = document.getElementById("removeItalics");
const linkSize = document.getElementById("linkSize");
const linkColor = document.getElementById("linkColor");
const linkHoverColor = document.getElementById("linkHoverColor");
const lineSpacing = document.getElementById("lineSpacing");
const letterSpacing = document.getElementById("letterSpacing");
const textSize = document.getElementById("textSize");
const textColor = document.getElementById("textColor");
const backgroundColor = document.getElementById("backgroundColor"); // New
const resetButton = document.getElementById("resetButton");

// Object to hold all default values
const DEFAULT_SETTINGS = {
    font: "OpenDyslexic",
    removeItalics: false,
    textSize: 1.0,
    textColor: "#333333",
    backgroundColor: "#FFFFFF", // New
    linkSize: 1.05,
    linkColor: "#0645AD",
    linkHoverColor: "#003399",
    lineSpacing: 1.4,
    letterSpacing: 0.05
};

// Debounce helper
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// Save and send settings to current tab
const applySettings = debounce(() => {
    const options = {
        font: fontSelect.value,
        removeItalics: removeItalics.checked,
        textSize: parseFloat(textSize.value),
        textColor: textColor.value,
        backgroundColor: backgroundColor.value, // New
        linkSize: parseFloat(linkSize.value),
        linkColor: linkColor.value,
        linkHoverColor: linkHoverColor.value,
        lineSpacing: parseFloat(lineSpacing.value),
        letterSpacing: parseFloat(letterSpacing.value)
    };

    // Save to Chrome storage
    chrome.storage.sync.set(options);

    // Send immediately to current tab for live updates
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "updateSettings", settings: options });
        }
    });
}, 50); // small debounce for performance

// Function to update the popup UI from a settings object
function updatePopupUI(settings) {
    fontSelect.value = settings.font || DEFAULT_SETTINGS.font;
    removeItalics.checked = settings.removeItalics || DEFAULT_SETTINGS.removeItalics;
    textSize.value = settings.textSize || DEFAULT_SETTINGS.textSize;
    textColor.value = settings.textColor || DEFAULT_SETTINGS.textColor;
    backgroundColor.value = settings.backgroundColor || DEFAULT_SETTINGS.backgroundColor; // New
    linkSize.value = settings.linkSize || DEFAULT_SETTINGS.linkSize;
    linkColor.value = settings.linkColor || DEFAULT_SETTINGS.linkColor;
    linkHoverColor.value = settings.linkHoverColor || DEFAULT_SETTINGS.linkHoverColor;
    lineSpacing.value = settings.lineSpacing || DEFAULT_SETTINGS.lineSpacing;
    letterSpacing.value = settings.letterSpacing || DEFAULT_SETTINGS.letterSpacing;
}

// New function to reset settings
function resetSettings() {
    updatePopupUI(DEFAULT_SETTINGS); // Set UI to defaults
    applySettings(); // Apply and save the defaults
}

// Initialize popup with saved settings
chrome.storage.sync.get().then((settings) => {
    updatePopupUI(settings);
});

// Event listeners
fontSelect.addEventListener("change", applySettings);
removeItalics.addEventListener("change", applySettings);
textSize.addEventListener("input", applySettings);
textColor.addEventListener("input", applySettings);
backgroundColor.addEventListener("input", applySettings); // New
linkSize.addEventListener("input", applySettings);
linkColor.addEventListener("input", applySettings);
linkHoverColor.addEventListener("input", applySettings);
lineSpacing.addEventListener("input", applySettings);
letterSpacing.addEventListener("input", applySettings);
resetButton.addEventListener("click", resetSettings);