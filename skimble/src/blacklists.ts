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
  "*://*.github.com/*",
  "*://github.com/*", 
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

export function isUrlBlacklisted(url: string): boolean {
  return urlBlacklist.some((pattern) => {
    const regexPattern = (pattern as string).replace(/\*/g, ".*");
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(url);
  });
}

const headersBlacklist = [
  "Related",
  "Recommended",
  "Sign up",
  "Newsletter",
  "Comments",
  "Ads",
  "Sponsored",
  "Promo",
  "Cookie",
  "Privacy",
  "Terms",
  "About",
  "Contact",
  "Help",
  "Support",
  "Feedback",
  "Report",
  "Donate",
  "Contribute",
  "Community",
  "Forum",
  "Blog",
  "News",
  "Events",
  "Careers",
  "Press",
  "Investors",
  "Partners",
  "API",
  "Docs",
  "Resources",
  "Guides",
  "Tutorials",
  "FAQs",
  "Testimonials",
  "Reviews",
  "Case Studies",
  "Whitepapers",
  "See also",
  "Ebooks",
  "Webinars",
  "Podcasts",
  "Videos",
  "Gallery",
  "Media",
  "Press releases",
  "Announcements",
  "Updates",
  "Newsletter sign up",
  "Subscript",
  "Follow us",
  "Connect with us",
  "Written by",
];

export function isHeaderBlacklisted(headerText: string): boolean {
  const normalizedHeader = headerText.toLowerCase().trim();
  return headersBlacklist.some((blacklisted) => {
    return normalizedHeader.includes(blacklisted);
  });
}
