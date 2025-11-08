// textFormatter.js
export function applyTextFormatting(options = {}) {
    const fontFamily = options.fontFamily || "Open Dyslexic, Arial, sans-serif";
    const fontSize = options.fontSize || "18px";
    const lineHeight = options.lineHeight || "1.6";
    const letterSpacing = options.letterSpacing || "0.5px";
    const wordSpacing = options.wordSpacing || "2px";

    document.body.style.fontFamily = fontFamily;
    document.body.style.fontSize = fontSize;
    document.body.style.lineHeight = lineHeight;
    document.body.style.letterSpacing = letterSpacing;
    document.body.style.wordSpacing = wordSpacing;

    // Remove ALL CAPS
    document.querySelectorAll("*").forEach(el => {
        if (el.innerText === el.innerText.toUpperCase() && el.innerText.trim() !== "") {
            el.style.textTransform = "none";
            el.style.fontWeight = "bold";
        }
    });

    // TODO: NLP simplification placeholder
    // simplifyLongSentences(), boldImportantContent()
}
