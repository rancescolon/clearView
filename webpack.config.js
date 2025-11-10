const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    // 1. Mode: Essential for setting environment optimizations.
    mode: 'production', // Use 'development' for un-minified code with debugging features.

    // 2. Entry Points: Define a bundle for every script loaded independently by the browser/manifest.
    // The output path for these will be relative to the 'dist' folder defined in 'output'.
    entry: {
        // Scripts referenced in manifest.json content_scripts
        'scripts/epilepsy-check': './scripts/epilepsy-check.js', // Runs at document_start
        'scripts/text-formatter': './scripts/text-formatter.js', // Runs at document_idle
        'scripts/voice-control': './scripts/voice-control.js',   // Runs at document_idle
        'scripts/visual-control': './scripts/visual-control.js', // Runs at document_idle
        // Background script (Placed in the root, but needs its own entry)
        'background': './background.js',
        // Popup script (Must be separate to run in the action pop-up)
        'popup/popup': './popup/popup.js',
    },

    // 3. Output Configuration
    output: {
        // [name] will be replaced by the key names in the 'entry' object (e.g., 'scripts/epilepsy-check.js').
        filename: '[name].js',
        // All bundled files go into the 'dist' folder.
        path: path.resolve(__dirname, 'dist'),
        // Clean the output directory before a fresh build.
        clean: true,
    },

    // 4. Plugins: Critical for handling static assets and manifest.
    plugins: [
        new CopyPlugin({
            patterns: [
                // Copy the manifest file.
                { from: 'manifest.json', to: 'manifest.json' },

                // Copy the popup files to dist/popup/
                { from: 'popup/popup.html', to: 'popup/popup.html' },
                { from: 'popup/popup.css', to: 'popup/popup.css' },

                // Copy the icons directory.
                { from: 'icons', to: 'icons' },

                // Copy the custom font file referenced in text-formatter.js
                { from: 'fonts/OpenDyslexic-Regular.woff', to: 'fonts/OpenDyslexic-Regular.woff' },


            ],
        }),
    ],

    // 5. Devtool: Recommended for debugging Chrome Extensions.
    // It generates source maps so you can debug the original source code.
    devtool: 'cheap-module-source-map',
};