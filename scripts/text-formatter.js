// text-formatter.js
function formatPageText(fontFamily) {
    const openDyslexicURL = chrome.runtime.getURL("fonts/OpenDyslexic-Regular.woff");

    const style = document.createElement("style");
    style.id = "clearview-text-formatter";
    style.textContent = `
    @font-face {
      font-family: 'OpenDyslexic';
      src: url('${openDyslexicURL}') format('woff');
      font-weight: normal;
      font-style: normal;
    }
    * {
      font-family: ${fontFamily}, Arial, sans-serif !important;
      font-style: normal !important;
    }
    em, i {
      font-style: normal !important;
    }
    a {
      font-size: 1.05em !important;
      font-weight: 600 !important;
      color: #0645AD !important;
      text-decoration: underline !important;
      padding: 2px 4px !important;
      border-radius: 4px !important;
      transition: background-color 0.2s ease, color 0.2s ease;
    }
    a:hover, a:focus {
      background-color: #dbe9ff !important;
      color: #003399 !important;
      outline: 2px solid #99c2ff !important;
    }
  `;

    // Remove old formatter if exists
    const existing = document.getElementById("clearview-text-formatter");
    if (existing) existing.remove();

    document.head.appendChild(style);
}
