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
            <h2 style="color: #f00; margin-top: 0; font-size: 1.5em;">⚠️ Epilepsy Warning</h2>
            <p style="font-size: 1.1em; line-height: 1.5; color: #eee;">
                This page appears to contain rapidly flashing content.
            </p>
            <p style="font-size: 0.9em; color: #ccc;">
                Detected ${flashTimestamps.length} rapid changes in the last second.
            </p>
            <div style="margin-top: 25px;">
                <button id="cv-epilepsy-proceed" style="background-color: #4CAF50; color: white; padding: 12px 18px; border: none; border-radius: 4px; cursor: pointer; font-size: 1em; margin: 5px;">Proceed Anyway</button>
                <button id="cv-epilepsy-back" style="background-color: #f44336; color: white; padding: 12px 18px; border: none; border-radius: 4px; cursor: pointer; font-size: 1em; margin: 5px;">Go Back</button>
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
     * Records a "flash event".
     */
    function recordFlash() {
        if (isWarningActive || !isCheckEnabled) return;

        const now = Date.now();
        flashTimestamps.push(now);

        // Prune old timestamps
        flashTimestamps = flashTimestamps.filter(timestamp => now - timestamp < FLASH_THRESHOLD_TIME);

        // Check threshold
        if (flashTimestamps.length >= FLASH_THRESHOLD_COUNT) {
            console.warn(`ClearView: Rapid flashing detected! (${flashTimestamps.length} events). Triggering warning.`);
            showWarning();
        }
    }

    /**
     * The MutationObserver callback.
     * *** THIS IS THE FIX ***
     * We no longer count every single mutation. Instead, if *any*
     * mutations happen in this batch, we count it as ONE "event".
     * A normal page load (many changes at once) is 1 event.
     * A real flash (many changes, then more changes) is 2+ events.
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