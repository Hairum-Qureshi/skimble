# Skimble Reader

Skimble is a Chrome extension designed to improve digital reading accessibility. By providing tools to reduce visual noise and customize text presentation, it helps users with dyslexia, visual impairments, or general reading fatigue focus on content more effectively.

## Core Features

### Reader Mode and Focus Tools

- **Reader Mode:** Converts complex web pages into a simplified, distraction-free interface by removing ads and sidebars.
- **Reading Ruler:** A horizontal guide to assist with line tracking. Double-click to lock the ruler in a specific position (indicated by a green highlight) or unlock it to follow the cursor (indicated by a yellow highlight).
- **Background Dimming:** Toggles the surrounding page brightness to reduce eye strain and emphasize the primary text.

### Typographic Customization

The extension provides granular control over text layout through a dedicated settings widget:

- **Word and Letter Spacing:** Adjust the gaps between words and individual characters to improve legibility.
- **Line Spacing:** Modify the vertical distance between lines of text to prevent visual crowding.
- **Font Scaling:** Increase or decrease text size instantly via a slider.
- **Font Selection:** Quickly switch between high-readability fonts such as Inter and the standard System UI font.

### Navigation and Summary

- **Article Summary:** Provides an automatically generated, AI-free overview of the article's main topics and keywords.
- **Table of Contents:** Automatically identifies and links to major sections of the page, such as Overview, History, and References, allowing for rapid navigation.

## Usage

Once the extension is active on a webpage, the Skimble Reader Widget allows for real-time adjustments. All settings are applied instantly to the current view. The Reading Ruler is activated automatically to assist in maintaining focus while scrolling through long-form content.

## Privacy and Methodology

- **AI-Free Summarization:** Article summaries are generated automatically without the use of external AI models, ensuring that data processing remains private and fast.

## Instructions to run extension

1. Clone the repo
2. `cd` into `skimble` directory
3. Run `npm run dev` and open up `http://localhost:5173`. You should see the page open up successfully
4. Run `npm run watch` in a separate terminal - VSCode will now listen for changes.
5. Make a change in `main.ts` or `index.html` and then run `npm run build`
6. Inside of the `public` folder, add the following `manifest.json` file to it:

```json
{
  "manifest_version": 3,
  "name": "Skimble",
  "version": "1.0",
  "description": "A simple Chrome extension.",
  "action": {
    "default_popup": "index.html"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["script.js"]
    }
  ]
}
```

6. Depending on your browser:

- If you're using Edge, go to: `edge://extensions/`
- If you're on Chrome, go to: `chrome://extensions/`

7. Click the 'Load Unpacked' button
8. Select the `dist` folder inside of `/skimble/dist`
9. You should now see the extension `Skimble` listed as part of your extensions

## Showing new changes:

1. Add your content
2. Run `npm run build`
3. Toggle the Skimble extension off and then on again
4. Refresh the page you want to view the extension on and it should reflect those changes.
