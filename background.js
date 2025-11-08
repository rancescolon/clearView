// the backend logic of the extension(works when even closed) and Handles browser events
// the "server" of the extension

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "CHANGE_FONT") {
        chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            func: changeFontOnPage,
            args: [message.fontFamily]
        });
    }
});

// Function that runs inside the webpage
function changeFontOnPage(fontFamily) {
    document.querySelectorAll("*").forEach((el) => {
        el.style.fontFamily = fontFamily + ", Arial, sans-serif";
    });
}
