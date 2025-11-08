// the backend logic of the extension(works when even closed) and Handles browser events
// the "server" of the extension

chrome.runtime.onInstalled.addListener(() => {
    console.log("ClearView installed!");
});

// Placeholder for handling AI API calls
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === "SUMMARIZE_PAGE") {
        // TODO: call AI summarization API using your API key
        sendResponse({ summary: "Placeholder summary of the page" });
    } else if (message.type === "DESCRIBE_IMAGE") {
        // TODO: call AI image description API
        sendResponse({ description: "Placeholder image description" });
    }
    return true; // keep the channel open for async response
});