export const siteConfig = {
  name: "Shopi",

  // Short brand positioning, rendered as display copy (e.g. inside the OG card
  // image). Kept prose-shaped — the keyword-led form belongs in metaTitle.
  tagline: "Kenya's social marketplace for buying and selling locally",

  // The <title> / og:title / twitter:title for the site root. Leads with the
  // primary commercial query ("sell online in Kenya") rather than the brand
  // positioning, since the brand term already ranks on its own.
  metaTitle: "Shopi — Sell Online in Kenya | Buy & Sell Locally",

  // Primary brand description used for SEO, Open Graph and structured data.
  description:
    "Sell online in Kenya for free with Shopi. Use Shopi Agent to create listings with AI, discover local buyers, and connect directly with buyers and sellers. Zero commission.",

  // Default canonical domain. Override per-environment with NEXT_PUBLIC_APP_URL.
  //
  // The production site is served from the www host and the apex redirects to
  // it (see next.config.ts). Canonicals, sitemap URLs, JSON-LD @ids and OG
  // urls all derive from this value, so it must match the host that actually
  // serves pages — pointing it at the apex makes every canonical a redirect.
  url: process.env.NEXT_PUBLIC_APP_URL || "https://www.shopi.co.ke",

  // The site-wide OG card is rendered by app/[lang]/opengraph-image.tsx.
  ogImage: "/en/opengraph-image",

  twitterHandle: "@shopiapp",
  locale: "en-KE",
  themeColor: "#E0005C",

  // Primary search/discovery terms.
  keywords: [
    // Brand
    "Shopi",
    "Shopi Kenya",
    "Shopi Agent",

    // Marketplace
    "social marketplace Kenya",
    "local marketplace Kenya",
    "online marketplace Kenya",
    "marketplace Kenya",
    "buy and sell Kenya",
    "buy and sell locally",
    "sell online Kenya",
    "local buying and selling",
    "discover products near me",
    "nearby marketplace Kenya",

    // AI
    "AI marketplace Kenya",
    "AI shopping assistant",
    "AI selling assistant",
    "AI product listings",
    "AI classifieds",
    "sell with AI",
    "buy with AI",

    // Categories
    "cars for sale Kenya",
    "used cars for sale Kenya",
    "phones for sale Kenya",
    "Samsung phones for sale Kenya",
    "iPhone for sale Kenya",
    "laptops for sale Kenya",
    "electronics for sale Kenya",
    "TVs for sale Kenya",
    "smart TVs for sale Kenya",
    "phone accessories Kenya",
    "fashion marketplace Kenya",
    "furniture for sale Kenya",
    "home items Kenya",
    "beauty products Kenya",
    "cosmetics Kenya",
    "skincare products Kenya",
    "hair products Kenya",
    "farm produce Kenya",
    "livestock for sale Kenya",
    "cows for sale Kenya",

    // Property
    "land for sale Kenya",
    "plots for sale Kenya",
    "houses for sale Kenya",
    "houses for rent Kenya",
    "property for sale Kenya",
    "property for sale Nairobi",
    "plots for sale in Nyahururu",
    "plots for sale in Nyandarua",

    // Local intent
    "Nairobi marketplace",
    "Mombasa marketplace",
    "Kisumu marketplace",
    "Nakuru marketplace",
    "Meru marketplace",

    // Competitor searches
    "Jiji alternative Kenya",
    "Facebook Marketplace Kenya",
    "TikTok marketplace Kenya",
  ],

  routes: {
    feed: {
      path: "/feed",
      title: "Feed",
      description:
        "Discover nearby products in a personalized social feed tailored to your interests.",
    },

    explore: {
      path: "/explore",
      title: "Explore",
      description:
        "Explore nearby products or ask Shopi Agent to help you find exactly what you're looking for.",
    },

    search: {
      path: "/search",
      title: "Search",
      description:
        "Search cars, phones, fashion, furniture, farm produce and thousands of local listings across Kenya.",
    },

    notifications: {
      path: "/notifications",
      title: "Inbox",
      description:
        "Stay connected with buyers and sellers through your Shopi conversations and activity.",
    },

    profile: {
      path: "/profile",
      title: "Profile",
      description:
        "Manage your Shopi profile, listings, saved items and account settings.",
    },

    upload: {
      path: "/upload",
      title: "Create a Listing",
      description:
        "Create a listing yourself or let Shopi Agent turn your photos into a complete listing in seconds.",
    },
  },
} as const;
