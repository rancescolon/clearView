// screenReader.js
export let isReading = false;
let speech = window.speechSynthesis;

export function buildReadQueue() {
    const elements = Array.from(document.querySelectorAll("h1, h2, h3, p, li"));
    return elements.map(el => el.innerText);
}

export function readPage() {
    if (isReading) return;
    const queue = buildReadQueue();
    if (queue.length === 0) return;

    isReading = true;
    queue.forEach(text => {
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1;
        speech.speak(utter);
    });

    isReading = false;
}

export function pauseReading() {
    speech.pause();
}

export function resumeReading() {
    speech.resume();
}

export function stopReading() {
    speech.cancel();
}
