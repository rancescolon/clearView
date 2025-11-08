//Code for if the site needs to scrape site and do anything with it.
// will have to message the background script API or popup to do anything with the data.

// content.js
// Import modular scripts (assuming ES modules in Chrome extension context)
import './colorFixer.js';
import './textFormatter.js';
import './screenReader.js';
import './voiceNavigation.js';
import './epilepsyWarning.js';
import './utils.js';

// Initialize all features
chrome.storage.local.get(["colorScheme", "textOptions"], ({ colorScheme, textOptions }) => {
    if (colorScheme) applyColorScheme(colorScheme);
    if (textOptions) applyTextFormatting(textOptions);
});

// Observe dynamic changes
const observer = new MutationObserver(() => {
    chrome.storage.local.get(["colorScheme", "textOptions"], ({ colorScheme, textOptions }) => {
        if (colorScheme) applyColorScheme(colorScheme);
        if (textOptions) applyTextFormatting(textOptions);
    });
});
observer.observe(document.body, { childList: true, subtree: true });

// Initialize voice navigation and epilepsy detection
initVoiceNavigation();
detectFlashingContent();
