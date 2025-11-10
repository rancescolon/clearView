# ClearView — Accessibility Text & Visual Controls

**ClearView** is a Google Chrome extension designed to improve web accessibility for all types of disabilities, including color blindness, dyslexia, visual impairments, and motor disabilities. It provides text formatting, visual controls, and voice navigation to make web content easier to read and interact with.

---

## Features

- **Text Formatter** (`scripts/text-formatter.js`): Adjust font family, font size, line height, letter spacing, and link size.
- **Visual Controls** (`scripts/visual-control.js`): Modify colors, backgrounds, and simple visual enhancements for better readability.
- **Color Fixer**: Toggle text, link, and background colors for improved accessibility.
- **Voice Navigation** (`scripts/voice-control.js`): Supports commands such as:
    - "Scroll Down" / "Scroll Up" / "Scroll to Top" / "Scroll to Bottom"
    - "Zoom In" / "Zoom Out"
    - "Start Reading" / "Stop Reading" / "Continue Reading"
    - "Pause Listening" / "Set text color to" / "Set background color to"
    - "Increase font size"
- **Screen Reader**: Reads page text aloud for users with visual impairments.
- **Epilepsy/Flash Safety Checks** (`scripts/epilepsy-check.js`): Prevents flashing content from triggering seizures.
- **Popup UI** (`popup/`): User interface for interacting with the extension (`popup.html`, `popup.js`, `popup.css`).

---

## Installation (Load Unpacked)

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** (top-right corner).
3. Click **Load unpacked** and select the project root directory.

> Ensure a valid `manifest.json` is present at the project root (Manifest V3 recommended). If not included, create one referencing the content scripts and the popup.

---

## Usage

1. Click the extension icon in the toolbar → the popup will open.
2. Use toggles to adjust text, color, or enable screen reading.
3. Text formatting changes are saved to `chrome.storage.local` and applied to the active tab.
4. Scripts under `scripts/` are intended to run as content scripts or be injected into the page; adjust injection as needed in `manifest.json`.

---

## Development

- Source files:
    - `scripts/` — content/injectable logic
    - `popup/` — popup UI and behavior
- After making changes, reload the extension on `chrome://extensions`.
- If using npm tooling:
  ```bash
  npm install
  # Run your build/test commands as configured
