// frontend logic for the popupx
// will have to message the background script API or popup to do anything with the data.

// popup.js
const colorSchemeEl = document.getElementById("colorScheme");
const fontFamilyEl = document.getElementById("fontFamily");
const fontSizeEl = document.getElementById("fontSize");

document.getElementById("startVoice").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => { initVoiceNavigation(); }
    });
});

document.getElementById("readPage").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => readPage() });
});

document.getElementById("pauseReading").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => pauseReading() });
});

document.getElementById("resumeReading").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => resumeReading() });
});

// Save settings to chrome.storage
colorSchemeEl.addEventListener("change", () => {
    const value = colorSchemeEl.value;
    chrome.storage.local.set({ colorScheme: value });
    applySettingsToActiveTab();
});

fontFamilyEl.addEventListener("change", () => saveTextSettings());
fontSizeEl.addEventListener("change", () => saveTextSettings());

function saveTextSettings() {
    const options = {
        fontFamily: fontFamilyEl.value,
        fontSize: fontSizeEl.value + "px"
    };
    chrome.storage.local.set({ textOptions: options });
    applySettingsToActiveTab();
}

async function applySettingsToActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => {}, args: [] });
}
