function formatPageText(options) {
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
      font-family: ${options.font}, Arial, sans-serif !important;
      ${options.removeItalics ? "font-style: normal !important;" : ""}
      line-height: ${options.lineSpacing} !important;
      letter-spacing: ${options.letterSpacing}em !important;
    }

    em, i {
      ${options.removeItalics ? "font-style: normal !important;" : ""}
    }

    a {
      font-size: ${options.linkSize}em !important;
      font-weight: 600 !important;
      color: ${options.linkColor} !important;
      text-decoration: underline !important;
      padding: 2px 4px !important;
      border-radius: 4px !important;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    a:hover, a:focus {
      background-color: #dbe9ff !important;
      color: ${options.linkHoverColor} !important;
      outline: 2px solid #99c2ff !important;
    }
  `;

    // Remove old formatter if exists
    const existing = document.getElementById("clearview-text-formatter");
    if (existing) existing.remove();

    document.head.appendChild(style);
}
