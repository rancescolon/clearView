// utils.js
export function saveOptions(key, value) {
    chrome.storage.local.set({ [key]: value });
}

export async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
}
