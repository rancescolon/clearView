// voiceNavigation.js
export function initVoiceNavigation() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = event => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        handleVoiceCommand(command);
    };

    recognition.start();

    function handleVoiceCommand(command) {
        if (command.includes("scroll down")) window.scrollBy(0, 300);
        else if (command.includes("scroll up")) window.scrollBy(0, -300);
        else if (command.includes("scroll to top")) window.scrollTo(0, 0);
        else if (command.includes("scroll to bottom")) window.scrollTo(0, document.body.scrollHeight);
        else if (command.includes("zoom in")) document.body.style.zoom = "120%";
        else if (command.includes("zoom out")) document.body.style.zoom = "80%";
        else if (command.includes("reload")) location.reload();
        else if (command.includes("stop listening")) recognition.stop();
        else if (command.includes("read page")) readPage();
        else if (command.includes("pause reading")) pauseReading();
        else if (command.includes("resume reading")) resumeReading();
        // Placeholder: summarize page using background.js API
        // else if (command.includes("summarize page")) { summarizePageAPI(); }
    }
}
