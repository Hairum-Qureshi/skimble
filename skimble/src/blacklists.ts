const blockedHosts = [
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "x.com",
  "tiktok.com",
  "linkedin.com",
  "reddit.com",
  "netflix.com",
  "amazon.com",
  "twitch.tv",
  "spotify.com",
  "github.com",
  "chatgpt.com",
];

// Specific blocked routes
const blockedRoutes = [
  {
    hostname: "google.com",
    pathStartsWith: "/search",
  },
  {
    hostname: "drive.google.com",
  },
  {
    hostname: "calendar.google.com",
  },
  {
    hostname: "docs.google.com",
  },
  {
    hostname: "sheets.google.com",
  },
  {
    hostname: "slides.google.com",
  },
  {
    hostname: "forms.google.com",
  },
  {
    hostname: "keep.google.com",
  },
  {
    hostname: "photos.google.com",
  },
  {
    hostname: "translate.google.com",
  },
  {
    hostname: "finance.google.com",
  },
  {
    hostname: "gemini.google.com",
  },
];

export function isUrlBlacklisted(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    // Remove "www." for cleaner comparison
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    // Match full domains + subdomains
    const isBlockedHost = blockedHosts.some(
      (blockedHost) =>
        hostname === blockedHost || hostname.endsWith(`.${blockedHost}`),
    );

    if (isBlockedHost) {
      return true;
    }

    // Match special routes
    const isBlockedRoute = blockedRoutes.some((route) => {
      const routeHost = route.hostname.replace(/^www\./, "");

      const hostnameMatches =
        hostname === routeHost || hostname.endsWith(`.${routeHost}`);

      if (!hostnameMatches) {
        return false;
      }

      // If no path restriction exists, block entire domain
      if (!route.pathStartsWith) {
        return true;
      }

      return parsedUrl.pathname.startsWith(route.pathStartsWith);
    });

    return isBlockedRoute;
  } catch (error) {
    console.error("Invalid URL passed to blacklist:", url);
    return false;
  }
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

  return headersBlacklist.some((blacklisted) =>
    normalizedHeader.includes(blacklisted.toLowerCase()),
  );
}
