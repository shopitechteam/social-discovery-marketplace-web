export const siteConfig = {
  name: "Shopi",
  tagline: "Everything for sale near you, in one feed",
  description:
    "Shopi is Kenya's social discovery marketplace. Scroll a feed of real products from sellers near you — cars, phones, fashion, furniture, farm produce and livestock — then message the seller directly. Free to use, no commission, no middleman.",
  // Default canonical domain. Override per-environment with NEXT_PUBLIC_APP_URL.
  url: process.env.NEXT_PUBLIC_APP_URL || "https://shopi.co.ke",
  ogImage: "/opengraph-image",
  twitterHandle: "@shopiapp",
  locale: "en-KE",
  themeColor: "#7c3aed",

  // Primary search/discovery terms we want Shopi to surface for.
  keywords: [
    "Shopi",
    "social marketplace Kenya",
    "social discovery marketplace",
    "buy and sell Kenya",
    "classifieds Kenya",
    "marketplace Kenya",
    "online marketplace Kenya",
    "cows for sale Kenya",
    "livestock for sale Kenya",
    "farm produce Kenya",
    "cars for sale Kenya",
    "phones for sale Kenya",
    "sell online Kenya",
    "Jiji alternative Kenya",
    "Nairobi marketplace",
  ],

  routes: {
    feed:          { path: "/feed",          title: "Feed",          description: "Scroll a feed of real products from sellers near you, then message them directly." },
    explore:       { path: "/explore",       title: "Explore",       description: "Discover what's for sale near you, or ask the Shopi assistant to find it for you." },
    notifications: { path: "/notifications", title: "Inbox",         description: "Your messages and activity on Shopi." },
    profile:       { path: "/profile",       title: "Profile",       description: "Your Shopi profile, posts, and settings." },
    upload:        { path: "/upload",        title: "Create a Post", description: "Post what you're selling — add a video, a price, and your location." },
  },
} as const;
