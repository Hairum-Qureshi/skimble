## Instructions to run extension
1. Clone the repo
2. `cd` into `skimble` directory
3. Run `npm run dev` and open up `http://localhost:5173`. You should see the page open up successfully
4. Run `npm run build` 
5. Inside of your newly created `dist` folder, add the following `manifest.json` file to it:
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