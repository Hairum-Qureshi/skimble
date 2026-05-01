// I am aware the manifest.json file has a "exclude_matches" field that can be used to exclude certain URLs from the extension's content scripts. However, after trying a variety of ways to exclude certain URLs despite allowing all URLs, it seems that the "exclude_matches" field does not work as expected. Therefore, I have implemented a custom URL blacklist within the content script itself to ensure that the extension does not run on specified URLs.

const urlBlacklist = [
  "*://*.youtube.com/*",
  "*://*.facebook.com/*",
  "*://*.instagram.com/*",
  "*://*.x.com/*",
  "*://*.tiktok.com/*",
  "*://*.linkedin.com/*",
  "*://*.reddit.com/*",
  "*://*.netflix.com/*",
  "*://*.amazon.com/*",
  "*://*.twitch.tv/*",
  "*://*.spotify.com/*",
  "*://www.google.com/search*",
  "*://drive.google.com/*",
  "*://calendar.google.com/*",
  "*://docs.google.com/*",
  "*://sheets.google.com/*",
  "*://slides.google.com/*",
  "*://forms.google.com/*",
  "*://keep.google.com/*",
  "*://photos.google.com/*",
  "*://translate.google.com/*",
  "*://finance.google.com/*",
  "*://gemini.google.com/*",
  "*://chatgpt.com/*",
];

export default function isUrlBlacklisted(url: string): boolean {
  return urlBlacklist.some((pattern) => {
    const regexPattern = (pattern as string).replace(/\*/g, ".*");
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(url);
  });
}
