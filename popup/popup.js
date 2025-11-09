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
const backgroundColor = document.getElementById("backgroundColor");
const resetButton = document.getElementById("resetButton");

// Voice DOM elements
const startVoiceBtn = document.getElementById("startVoiceBtn");
const stopVoiceBtn = document.getElementById("stopVoiceBtn");
const readPageBtn = document.getElementById("readPageBtn");
const voicePace = document.getElementById("voicePace"); // NEW
const voicePaceValue = document.getElementById("voicePaceValue"); // NEW

// NEW Visual DOM elements
const visualPace = document.getElementById("visualPace");
const visualPaceValue = document.getElementById("visualPaceValue");
const visualStartStopBtn = document.getElementById("visualStartStopBtn");

// Master Toggle elements
const toggleExtension = document.getElementById("toggleExtension");
const allControls = document.getElementById("all-controls-wrapper");

// Safety elements
const epilepsyCheck = document.getElementById("epilepsyCheck");
const disableAutoplay = document.getElementById("disableAutoplay");
const blueTint = document.getElementById("blueTint");
const sensitivity = document.getElementById("sensitivity");
const sensitivityValue = document.getElementById("sensitivityValue");


// Object to hold all default values
const DEFAULT_SETTINGS = {
    font: "Arial",
    removeItalics: false,
    textSize: 1.0,
    textColor: "#333333",
    backgroundColor: "#FFFFFF",
    linkSize: 1.05,
    linkColor: "#0645AD",
    linkHoverColor: "#003399",
    lineSpacing: 1.4,
    letterSpacing: 0.05,
    // NEW Pace Defaults
    voicePace: 300,
    visualPace: 300,
    // New Safety Defaults
    epilepsyCheck: true,
    disableAutoplay: true,
    blueTint: false,
    sensitivity: 5, // Corresponds to 5 flashes/sec
    // Master Toggle
    extensionEnabled: true
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
        backgroundColor: backgroundColor.value,
        linkSize: parseFloat(linkSize.value),
        linkColor: linkColor.value,
        linkHoverColor: linkHoverColor.value,
        lineSpacing: parseFloat(lineSpacing.value),
        letterSpacing: parseFloat(letterSpacing.value),
        // NEW Pace settings
        voicePace: parseInt(voicePace.value, 10),
        visualPace: parseInt(visualPace.value, 10)
    };

    // Save to Chrome storage
    chrome.storage.sync.set(options);

    // Send immediately to current tab for live updates
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "updateSettings", settings: options });

            // Send pace updates to content scripts
            sendVoiceCommand("VOICE_SET_PACE", options.voicePace);
            sendVoiceCommand("VISUAL_SET_PACE", options.visualPace);
        }
    });
}, 50);

// Function to update the popup UI from a settings object
function updatePopupUI(settings) {
    fontSelect.value = settings.font || DEFAULT_SETTINGS.font;
    removeItalics.checked = settings.removeItalics || DEFAULT_SETTINGS.removeItalics;
    textSize.value = settings.textSize || DEFAULT_SETTINGS.textSize;
    textColor.value = settings.textColor || DEFAULT_SETTINGS.textColor;
    backgroundColor.value = settings.backgroundColor || DEFAULT_SETTINGS.backgroundColor;
    linkSize.value = settings.linkSize || DEFAULT_SETTINGS.linkSize;
    linkColor.value = settings.linkColor || DEFAULT_SETTINGS.linkColor;
    linkHoverColor.value = settings.linkHoverColor || DEFAULT_SETTINGS.linkHoverColor;
    lineSpacing.value = settings.lineSpacing || DEFAULT_SETTINGS.lineSpacing;
    letterSpacing.value = settings.letterSpacing || DEFAULT_SETTINGS.letterSpacing;

    // NEW Pace UI updates
    voicePace.value = settings.voicePace || DEFAULT_SETTINGS.voicePace;
    voicePaceValue.textContent = voicePace.value;
    visualPace.value = settings.visualPace || DEFAULT_SETTINGS.visualPace;
    visualPaceValue.textContent = visualPace.value;

    // Update Safety UI
    epilepsyCheck.checked = settings.epilepsyCheck;
    disableAutoplay.checked = settings.disableAutoplay;
    blueTint.checked = settings.blueTint;
    sensitivity.value = settings.sensitivity;
    sensitivityValue.textContent = settings.sensitivity;
}

// New function to reset settings
function resetSettings() {
    updatePopupUI(DEFAULT_SETTINGS); // Set UI to defaults
    applySettings(); // Apply and save the text defaults

    // Explicitly save safety defaults
    chrome.storage.sync.set({
        epilepsyCheck: DEFAULT_SETTINGS.epilepsyCheck,
        disableAutoplay: DEFAULT_SETTINGS.disableAutoplay,
        blueTint: DEFAULT_SETTINGS.blueTint,
        sensitivity: DEFAULT_SETTINGS.sensitivity
    });

    // Manually trigger safety messages
    sendSafetyMessage("setEpilepsyCheck", DEFAULT_SETTINGS.epilepsyCheck);
    sendSafetyMessage("setBlueTint", DEFAULT_SETTINGS.blueTint);
}

// Function to send voice commands to the content script
function sendVoiceCommand(action, value) { // Added value parameter
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            // Construct message based on action and optional value
            const message = value !== undefined ? { action: action, pace: value } : { action: action };

            chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                } else if (response) {
                    console.log(response.status);
                }

                // NEW: Update visual button state after a toggle command
                if (action === "VISUAL_TOGGLE_READING") {
                    if (visualStartStopBtn.textContent.includes("Start")) {
                        visualStartStopBtn.textContent = "Stop Visual Read";
                        visualStartStopBtn.classList.add("reading");
                    } else {
                        visualStartStopBtn.textContent = "Start Visual Read";
                        visualStartStopBtn.classList.remove("reading");
                    }
                }
            });
        }
    });
}

// NEW: Helper for sending safety messages
function sendSafetyMessage(action, value) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: action,
                enabled: value
            });
        }
    });
}


// Function to update the "Read Page" button state
function updateReadButtonState(isReading) {
    if (isReading) {
        readPageBtn.textContent = "Stop Reading";
        readPageBtn.classList.add("reading");
    } else {
        readPageBtn.textContent = "Read Page";
        readPageBtn.classList.remove("reading");
    }
}


// Initialize popup with saved settings
chrome.storage.sync.get().then((settings) => {
    // Merge loaded settings with defaults to ensure all keys exist
    const activeSettings = { ...DEFAULT_SETTINGS, ...settings };

    // Handle new settings (default to true if not present)
    activeSettings.epilepsyCheck = activeSettings.epilepsyCheck !== false;
    activeSettings.disableAutoplay = activeSettings.disableAutoplay !== false;

    // Set the master toggle state
    toggleExtension.checked = activeSettings.extensionEnabled;
    if (!activeSettings.extensionEnabled) {
        allControls.classList.add("disabled");
    }

    // Update the rest of the UI
    updatePopupUI(activeSettings);

    // Initialize the visual button text
    // NOTE: Cannot reliably read visual state, so default to 'Start' on popup load.
    visualStartStopBtn.textContent = "Start Visual Read";
    visualStartStopBtn.classList.remove("reading");
});


// Get the current reading state when popup opens
chrome.storage.local.get("isReading", (data) => {
    updateReadButtonState(data.isReading);
});

// Listen for live changes to reading state
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.isReading) {
        updateReadButtonState(changes.isReading.newValue);
    }
});


// Event listeners
fontSelect.addEventListener("change", applySettings);
removeItalics.addEventListener("change", applySettings);
textSize.addEventListener("input", applySettings);
textColor.addEventListener("input", applySettings);
backgroundColor.addEventListener("input", applySettings);
linkSize.addEventListener("input", applySettings);
linkColor.addEventListener("input", applySettings);
lineSpacing.addEventListener("input", applySettings);
letterSpacing.addEventListener("input", applySettings);
resetButton.addEventListener("click", resetSettings);

// NEW Pace Control Event Listeners
voicePace.addEventListener("input", () => voicePaceValue.textContent = voicePace.value);
voicePace.addEventListener("change", applySettings);

visualPace.addEventListener("input", () => visualPaceValue.textContent = visualPace.value);
visualPace.addEventListener("change", applySettings);


// Voice control event listeners
startVoiceBtn.addEventListener("click", () => sendVoiceCommand("VOICE_START"));
stopVoiceBtn.addEventListener("click", () => sendVoiceCommand("VOICE_STOP"));
readPageBtn.addEventListener("click", () => sendVoiceCommand("VOICE_TOGGLE_READING"));

// NEW Visual Control Event Listener
visualStartStopBtn.addEventListener("click", () => sendVoiceCommand("VISUAL_TOGGLE_READING"));


// --- NEW Safety Event Listeners ---

epilepsyCheck.addEventListener("change", () => {
    const isEnabled = epilepsyCheck.checked;
    chrome.storage.sync.set({ epilepsyCheck: isEnabled });
    sendSafetyMessage("setEpilepsyCheck", isEnabled);
});

disableAutoplay.addEventListener("change", () => {
    const isEnabled = disableAutoplay.checked;
    chrome.storage.sync.set({ disableAutoplay: isEnabled });
    // Note: This setting is read by epilepsy-check.js on page load.
    // We can also send a message for the current page, though it may be too late.
    sendSafetyMessage("setDisableAutoplay", isEnabled);
});

blueTint.addEventListener("change", () => {
    const isEnabled = blueTint.checked;
    chrome.storage.sync.set({ blueTint: isEnabled });
    // This message is handled by text-formatter.js
    sendSafetyMessage("setBlueTint", isEnabled);
});

sensitivity.addEventListener("input", () => {
    sensitivityValue.textContent = sensitivity.value;
});

sensitivity.addEventListener("change", () => {
    // This just saves. The script reads this value on page load.
    chrome.storage.sync.set({ sensitivity: parseInt(sensitivity.value, 10) });
});


// Master Toggle Event Listener
toggleExtension.addEventListener("change", () => {
    const isEnabled = toggleExtension.checked;
    chrome.storage.sync.set({ extensionEnabled: isEnabled });

    if (isEnabled) {
        allControls.classList.remove("disabled");
    } else {
        allControls.classList.add("disabled");
    }

    // Tell content scripts to turn on/off
    sendSafetyMessage("setExtensionEnabled", isEnabled);
});