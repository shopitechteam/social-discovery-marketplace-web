export const siteConfig = {
  name: "Shopi",
  tagline: "Discover. Shop. Share.",
  description:
    "Shopi is the social commerce app where you discover products through people you trust — short videos, live drops, and curated feeds from creators and sellers.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://shopi.app",
  ogImage: "/og-default.png",
  twitterHandle: "@shopiapp",
  locale: "en-KE",
  themeColor: "#FF3B5C",

  routes: {
    feed:          { path: "/feed",          title: "Home",         description: "Your personalised discovery feed — videos, drops, and posts from people you follow." },
    explore:       { path: "/explore",       title: "Explore",      description: "Discover trending products, viral videos, and top creators on Shopi." },
    notifications: { path: "/notifications", title: "Inbox",        description: "Your notifications, messages, and activity on Shopi." },
    profile:       { path: "/profile",       title: "My Profile",   description: "Your Shopi profile, orders, and settings." },
    upload:        { path: "/upload",        title: "Create a Post", description: "Share a product, video, or drop with your Shopi followers." },
  },
} as const;
