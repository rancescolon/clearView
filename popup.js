document.getElementById("applyFont").addEventListener("click", async () => {
    const selectedFont = document.getElementById("fontSelect").value;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Inject CSS into the page to define the font face and apply it
    chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        css: `
      @font-face {
        font-family: 'OpenDyslexic';
        src: url('${chrome.runtime.getURL("fonts/OpenDyslexic-Regular.woff")}') format('woff');
      }
      * {
        font-family: ${selectedFont}, Arial, sans-serif !important;
      }
    `
    });
});
