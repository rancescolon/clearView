// scripts/epilepsy-check.js

(function () {
    // Don't run in iframes
    if (window.self !== window.top) {
        return;
    }

    // --- Configuration ---
    let flashTimestamps = [];
    let FLASH_THRESHOLD_COUNT = 5; // Default: 5 flashes (set from storage)
    const FLASH_THRESHOLD_TIME = 1000; // ...in 1 second

    // *** THIS IS THE FIX ***
    // Cooldown to prevent a single complex event (like page load) from firing multiple times
    let isFlashCooldown = false;
    const FLASH_COOLDOWN_MS = 100; // Ignore changes for 100ms after one is detected
    // This still allows us to detect flashes up to 10hz (10 flashes/sec)

    let isWarningActive = false;
    let mutationObserver = null;
    let isCheckEnabled = true;
    let isAutoplayDisabled = true;

    /**
     * Shows the epilepsy warning modal and freezes the page.
     */
    function showWarning() {
        if (isWarningActive) return;
        isWarningActive = true;

        // Stop observing to prevent further triggers
        if (mutationObserver) mutationObserver.disconnect();

        // Freeze animations and media
        document.documentElement.classList.add('clearview-epilepsy-freeze');
        document.querySelectorAll('video, audio').forEach(media => media.pause());

        // --- Create Warning UI ---
        const overlay = document.createElement('div');
        overlay.id = 'clearview-epilepsy-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(20, 20, 20, 0.9);
            z-index: 2147483646; /* Max-ish z-index */
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            color: #fff;
            backdrop-filter: blur(5px);
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background-color: #333;
            border: 2px solid #f00;
            border-radius: 8px;
            padding: 24px;
            width: 90%;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        `;

        modal.innerHTML = `
  <div style="
    background-color: #1a1a1a; /* Dark background */
    color: #ffffff; /* All text set to white by default */
    padding: 35px;
    border-radius: 16px;
    text-align: center;
    max-width: 480px;
    margin: auto;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4); /* Reduced and simpler shadow */
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    border: none; /* Removed border */
  ">
    <h2 style="
      margin-top: 0;
      font-size: 2em;
      font-weight: 700;
      color: #ffda47; /* Yellow for the warning icon, stands out */
      text-shadow: none; /* Removed text shadow */
      margin-bottom: 20px;
    ">
      ⚠️ Epilepsy Warning
    </h2>
    <p style="
      font-size: 1.25em;
      line-height: 1.5;
      margin: 25px 0;
      color: #ffffff; /* Explicitly white for main warning text */
    ">
      This page appears to contain <span style="font-weight: bold; color: #ffffff;">rapidly flashing content</span>.
    </p>
    <p style="
      font-size: 1.05em;
      margin-bottom: 30px;
      color: #e0e0e0; /* Slightly off-white for secondary text */
      font-style: italic;
    ">
      Detected <strong style="color: white">${flashTimestamps.length}</strong> rapid changes in the last second.
    </p>
    <div style="margin-top: 30px; display: flex; justify-content: center; gap: 15px;">
      <button id="cv-epilepsy-proceed" style="
        background-color: #4CAF50; /* Green for proceed */
        color: white;
        padding: 14px 25px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-weight: 600;
        transition: background-color 0.3s ease, transform 0.1s;
      " onmouseover="this.style.backgroundColor='#6bc56e'" onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform='scale(1)'">Proceed Anyway</button>
      <button id="cv-epilepsy-back" style="
        background-color: #f44336; /* Red for go back */
        color: white;
        padding: 14px 25px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-weight: 600;
        transition: background-color 0.3s ease, transform 0.1s;
      " onmouseover="this.style.backgroundColor='#ff6a5e'" onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform='scale(1)'">Go Back</button>
    </div>
  </div>
`;

        overlay.appendChild(modal);

        if (document.body) {
            document.body.appendChild(overlay);
        } else {
            document.addEventListener('DOMContentLoaded', () => document.body.appendChild(overlay));
        }

        // --- Add Button Listeners ---
        setTimeout(() => {
            document.getElementById('cv-epilepsy-proceed').addEventListener('click', () => {
                document.documentElement.classList.remove('clearview-epilepsy-freeze');
                overlay.remove();
                sessionStorage.setItem('clearview-epilepsy-dismissed', 'true');
                isWarningActive = false;
            });

            document.getElementById('cv-epilepsy-back').addEventListener('click', () => {
                window.location.href = 'about:blank';
            });
        }, 0);
    }

    /**
     * Records a "flash event". Now includes a cooldown.
     */
    function recordFlash() {
        // *** THIS IS THE FIX ***
        // If we're already warned, or the check is off, or we're in the cooldown period, do nothing.
        if (isWarningActive || !isCheckEnabled || isFlashCooldown) return;

        // 1. Start the cooldown
        isFlashCooldown = true;

        // 2. Add the timestamp and prune the list
        const now = Date.now();
        flashTimestamps.push(now);
        flashTimestamps = flashTimestamps.filter(timestamp => now - timestamp < FLASH_THRESHOLD_TIME);

        // 3. Check the threshold
        if (flashTimestamps.length >= FLASH_THRESHOLD_COUNT) {
            console.warn(`ClearView: Rapid flashing detected! (${flashTimestamps.length} events). Triggering warning.`);
            showWarning();
        }

        // 4. End the cooldown after a short period
        setTimeout(() => {
            isFlashCooldown = false;
        }, FLASH_COOLDOWN_MS);
    }

    /**
     * The MutationObserver callback.
     * This logic is correct: it calls recordFlash() *once* per batch of changes.
     * The new cooldown logic in recordFlash() prevents this from firing too often.
     */
    const observerCallback = (mutations) => {
        if (mutations.length > 0) {
            recordFlash(); // Just record 1 event, not mutations.length
        }
    };

    /**
     * Injects the "freeze" stylesheet and starts the MutationObserver.
     */
    function initializeObserver() {
        if (!document.body || !document.head) {
            requestAnimationFrame(initializeObserver);
            return;
        }

        if (!isCheckEnabled || sessionStorage.getItem('clearview-epilepsy-dismissed')) {
            return;
        }

        // Inject "freeze" style
        if (!document.getElementById('clearview-epilepsy-freeze-style')) {
            const freezeStyle = document.createElement('style');
            freezeStyle.id = 'clearview-epilepsy-freeze-style';
            freezeStyle.textContent = `
                html.clearview-epilepsy-freeze * {
                    animation-play-state: paused !important;
                    animation: none !important;
                    transition: none !important;
                }
            `;
            document.head.appendChild(freezeStyle);
        }

        // Start the Flash-Detection Observer
        if (mutationObserver) mutationObserver.disconnect();

        mutationObserver = new MutationObserver(observerCallback);
        mutationObserver.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['style', 'class', 'src', 'fill', 'stroke', 'hidden']
        });
    }

    /**
     * Finds and disables all autoplaying media.
     */
    function stopAllAutoplay() {
        if (!isAutoplayDisabled) return;

        document.querySelectorAll('video[autoplay], audio[autoplay]').forEach(media => {
            if (media.pause) media.pause();
            media.autoplay = false;
        });
    }

    /**
     * Turns the flash check on or off.
     */
    function setCheckEnabled(enabled) {
        isCheckEnabled = enabled;
        if (enabled) {
            requestAnimationFrame(initializeObserver);
        } else {
            if (mutationObserver) {
                mutationObserver.disconnect();
                mutationObserver = null;
            }
        }
    }

    /**
     * Turns autoplay blocking on or off for the current page.
     */
    function setAutoplayDisabled(enabled) {
        isAutoplayDisabled = enabled;
        if (enabled) {
            // Run it now, and also on DOM loaded
            stopAllAutoplay();
            document.addEventListener('DOMContentLoaded', stopAllAutoplay);
        } else {
            document.removeEventListener('DOMContentLoaded', stopAllAutoplay);
        }
    }

    // --- 1. Initial Load ---
    // Get settings from storage.
    chrome.storage.sync.get(["epilepsyCheck", "sensitivity", "disableAutoplay"], (settings) => {
        // Set sensitivity, default to 5
        FLASH_THRESHOLD_COUNT = settings.sensitivity || 5;

        // Set flash check, default to true
        setCheckEnabled(settings.epilepsyCheck !== false);

        // Set autoplay blocking, default to true
        setAutoplayDisabled(settings.disableAutoplay !== false);
    });

    // --- 2. Listen for Toggles from Popup ---
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "setEpilepsyCheck") {
            setCheckEnabled(message.enabled);
            sendResponse({ status: "Epilepsy check toggled" });
        }
        else if (message.action === "setDisableAutoplay") {
            setAutoplayDisabled(message.enabled);
            sendResponse({ status: "Autoplay toggled" });
        }
        // Return true to indicate async response
        return true;
    });

})();