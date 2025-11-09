// === ClearView Voice Navigation Script ===

(async function() {
    // Check for browser support
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!window.SpeechRecognition) {
        console.warn("Speech Recognition API is not supported in this browser. Voice control will not work.");
    }

    // === Singleton Voice Control ===
    window.ClearViewVoice = {
        recognition: null,
        listening: false,
        screenReader: null,
        isInitialized: false, // Track initialization

        // Reading state
        isReading: false,
        isPaused: false,
        readingTimeout: null,
        words: [],
        currentWordIndex: 0,

        // === Initialization ===
        init: function () {
            if (!window.SpeechRecognition || this.isInitialized) return;

            // Set initial reading state from storage
            chrome.storage.local.get("isReading", (data) => {
                this.isReading = !!data.isReading;
            });

            this.recognition = new window.SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = "en-US";

            this.recognition.onresult = (event) => {
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        const transcript = event.results[i][0].transcript.trim().toLowerCase();
                        console.log("Voice command detected:", transcript);
                        this.handleCommand(transcript);
                    }
                }
            };

            this.recognition.onend = () => {
                if (this.listening) this.recognition.start();
            };

            this.screenReader = window.speechSynthesis;
            this.isInitialized = true; // Mark as initialized
            console.log("ClearView Voice Initialized");
        },

        start: function () {
            if (!this.isInitialized) {
                console.warn("Voice recognition not initialized.");
                return;
            }
            if (this.listening) return;

            this.listening = true;
            this.recognition.start();
            this.announce("Voice control is now on.");
        },

        stop: function () {
            if (!this.isInitialized) return;

            this.listening = false;
            if (this.recognition) this.recognition.stop();

            // Also stop reading if it's in progress
            if (this.isReading) {
                this.execute("pauseReading");
            }

            if (this.screenReader && this.screenReader.speaking)
                this.screenReader.cancel();

            if (this.readingTimeout)
                clearTimeout(this.readingTimeout);

            this.announce("Voice control is now off.");
        },

        announce: function (message) {
            if (!this.screenReader) return;
            const utter = new SpeechSynthesisUtterance(message);
            this.screenReader.speak(utter);
        },

        // === Handle Commands ===
        handleCommand: function (transcript) {
            transcript = transcript.trim().toLowerCase();

            // Pause or Stop reading
            if (transcript === "pause" || transcript === "stop") {
                if (this.isReading) this.execute("pauseReading");
                this.isPaused = true;
                return;
            }

            const commands = this.commands();

            for (const cmd in commands) {
                if (commands[cmd].some((phrase) => transcript.includes(phrase))) {

                    // Handle continueReading specially
                    if (cmd === "continueReading") {
                        if (this.isPaused && this.words.length > 0) {
                            this.isPaused = false;
                            this.isReading = true; // Resuming reading
                            this.announce("Resuming reading.");
                            this.readWordByWord();
                        }
                    } else {
                        this.execute(cmd);
                    }

                    return;
                }
            }
        },

        // === Command Execution ===
        execute: function (command) {
            switch (command) {
                case "scrollDown":
                    window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
                    break;

                case "scrollUp":
                    window.scrollBy({ top: -window.innerHeight * 0.9, behavior: "smooth" });
                    break;

                case "scrollTop":
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    break;

                case "scrollBottom":
                    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                    break;

                case "zoomIn":
                    document.body.style.zoom = (parseFloat(document.body.style.zoom || 1) + 0.1).toString();
                    break;

                case "zoomOut":
                    document.body.style.zoom = (parseFloat(document.body.style.zoom || 1) - 0.1).toString();
                    break;

                case "reload":
                    location.reload();
                    break;

                case "stopListening":
                    this.stop();
                    break;

                case "readPage":
                    this.readPage();
                    break;

                case "pauseReading":
                    if (this.screenReader.speaking) this.screenReader.cancel();
                    if (this.readingTimeout) clearTimeout(this.readingTimeout);
                    this.isPaused = true;
                    this.isReading = false;
                    chrome.storage.local.set({ isReading: false }); // Update storage
                    break;

                case "summarizePage":
                    this.announce("Summarizing page (placeholder)");
                    break;

                case "playVideo":
                    this.toggleVideo("play");
                    break;

                case "pauseVideo":
                    this.toggleVideo("pause");
                    break;

                default:
                    console.log("Unknown command:", command);
            }
        },

        // === Wrap words in spans ===
        wrapWords: function (element) {
            let words = element.innerText.trim().split(/\s+/);
            let html = words.map((w) => `<span class="clearview-word">${w}</span>`).join(" ");
            element.innerHTML = html;
        },

        clearWordHighlights: function () {
            document.querySelectorAll(".clearview-word").forEach((w) => {
                w.style.backgroundColor = "";
                w.style.fontWeight = "";
                w.style.transform = "scale(1)"; // Reset scale
                w.style.transition = "transform 0.1s ease-out"; // Smooth transition
            });
        },

        highlightWord: function (index) {
            let wordSpans = document.querySelectorAll(".clearview-word");
            if (index < 0 || index >= wordSpans.length) return;

            this.clearWordHighlights();
            wordSpans[index].style.backgroundColor = "yellow";
            wordSpans[index].style.fontWeight = "bold";
            wordSpans[index].style.transform = "scale(1.15)"; // Make text bigger
            wordSpans[index].style.transition = "transform 0.1s ease-in"; // Smooth transition

            // Auto-scroll into view
            wordSpans[index].scrollIntoView({ behavior: "smooth", block: "center" });
        },

        // === Read Page ===
        readPage: function () {
            if (!this.screenReader) return;
            const elements = Array.from(
                document.querySelectorAll("h1, h2, h3, h4, h5, h6, p")
            ).filter((el) => el.offsetParent !== null && el.innerText.trim().length > 0);

            if (elements.length === 0) {
                this.announce("No readable content found on this page");
                return;
            }

            // Set reading state
            this.isReading = true;
            this.isPaused = false;
            chrome.storage.local.set({ isReading: true });

            // Reset reading state
            this.words = [];
            this.currentWordIndex = 0;

            // Wrap words and build list
            elements.forEach((el) => {
                this.wrapWords(el);
                el.querySelectorAll(".clearview-word").forEach((w) => {
                    this.words.push(w.innerText);
                });
            });

            if (this.words.length === 0) {
                this.announce("Nothing to read.");
                this.isReading = false; // Reset state
                chrome.storage.local.set({ isReading: false });
                return;
            }

            this.readWordByWord();
        },

        // === Word-by-word Reading ===
        readWordByWord: function () {
            // Stop if paused, or reading was cancelled, or no more words
            if (this.isPaused || !this.isReading || this.currentWordIndex >= this.words.length) {
                this.isReading = false;
                chrome.storage.local.set({ isReading: false });
                this.clearWordHighlights();
                return;
            }

            const chunkSize = 75; // ~30 seconds of reading
            const chunkWords = this.words.slice(
                this.currentWordIndex,
                this.currentWordIndex + chunkSize
            );
            const chunkText = chunkWords.join(" ");

            // Precompute word positions
            let positions = [];
            let offset = 0;

            for (let w of chunkWords) {
                let start = chunkText.indexOf(w, offset);
                let end = start + w.length;
                positions.push({ start, end });
                offset = end;
            }

            const utter = new SpeechSynthesisUtterance(chunkText);
            utter.rate = 1.0;

            // Correct word highlight
            utter.onboundary = (event) => {
                if (!this.isReading) return; // Don't highlight if stopped
                let charIndex = event.charIndex;
                for (let i = 0; i < positions.length; i++) {
                    let pos = positions[i];
                    if (charIndex >= pos.start && charIndex < pos.end) {
                        this.highlightWord(this.currentWordIndex + i);
                        break;
                    }
                }
            };

            utter.onend = () => {
                if (this.isPaused || !this.isReading) {
                    this.isReading = false;
                    chrome.storage.local.set({ isReading: false });
                    this.clearWordHighlights();
                    return;
                }

                this.currentWordIndex += chunkSize;

                // Check if there are more words
                if (this.currentWordIndex < this.words.length) {
                    // Wait 1 second before reading the next chunk
                    this.readingTimeout = setTimeout(() => {
                        this.readWordByWord();
                    }, 1000);
                } else {
                    // End of reading
                    this.isReading = false;
                    chrome.storage.local.set({ isReading: false });
                    this.clearWordHighlights();
                    this.announce("Finished reading the page.");
                }
            };

            this.screenReader.speak(utter);
        },

        // === Video Controls ===
        toggleVideo: function (action) {
            document.querySelectorAll("video").forEach((v) =>
                action === "play" ? v.play() : v.pause()
            );
        },

        // === Command List ===
        commands: function () {
            return {
                scrollDown: ["scroll down", "go down", "move down"],
                scrollUp: ["scroll up", "go up", "move up"],
                scrollTop: ["scroll to top", "go to top"],
                scrollBottom: ["scroll to bottom", "go to bottom"],
                zoomIn: ["zoom in", "increase size"],
                zoomOut: ["zoom out", "decrease size"],
                reload: ["reload page", "refresh page"],
                stopListening: ["stop listening", "turn off voice"],

                readPage: ["read page", "start reading"],
                pauseReading: ["pause reading", "stop reading"],
                continueReading: ["continue reading", "resume reading"],

                summarizePage: ["summarize page", "give summary"],
                playVideo: ["play video", "start video"],
                pauseVideo: ["pause video", "stop video"]
            };
        }
    }; // End of ClearViewVoice object


    // --- This is the execution logic ---

    // === Initial Load ===
    // Check if the extension is enabled before initializing voice
    const settings = await chrome.storage.sync.get("extensionEnabled");
    let isExtensionEnabled = settings.extensionEnabled !== false; // Default ON

    if (isExtensionEnabled) {
        window.ClearViewVoice.init();
    }

    // === Message Listener ===
    // Listen for commands from the popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        // Master On/Off Toggle
        if (message.action === "setExtensionEnabled") {
            isExtensionEnabled = message.enabled;
            if (isExtensionEnabled) {
                // Init if it hasn't been already
                window.ClearViewVoice.init();
            } else {
                // If turning off, stop all voice activity
                window.ClearViewVoice.stop();
            }
            sendResponse({ status: "Voice module toggled" });
            return true;
        }

        // --- Voice Commands ---
        // If extension is off, ignore all voice commands
        if (!isExtensionEnabled) {
            sendResponse({ status: "Extension is disabled" });
            return true;
        }

        if (message.action === "VOICE_START") {
            window.ClearViewVoice.start();
            sendResponse({ status: "Voice started" });
        } else if (message.action === "VOICE_STOP") {
            window.ClearViewVoice.stop();
            sendResponse({ status: "Voice stopped" });
        } else if (message.action === "VOICE_TOGGLE_READING") {
            if (window.ClearViewVoice.isReading) {
                window.ClearViewVoice.execute("pauseReading");
                sendResponse({ status: "Reading stopped" });
            } else {
                window.ClearViewVoice.readPage();
                sendResponse({ status: "Reading page" });
            }
        }

        // Need to return true for async sendResponse
        return true;
    });

})();