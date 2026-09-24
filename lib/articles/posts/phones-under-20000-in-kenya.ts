import type { Article } from "../types.ts";

export const article: Article = {
  slug: "phones-under-20000-in-kenya",
  status: "published",
  intent: "budget-guide",
  title: "Phones Under KSh 20,000 in Kenya",
  seoTitle: "Phones Under KSh 20,000 in Kenya: What to Look For",
  seoDescription:
    "Phones under KSh 20,000 in Kenya: what to look for at this budget, new vs second hand, and phones listed on Shopi right now.",
  excerpt:
    "Most phones under KSh 20,000 in Kenya are new budget Androids from brands like Tecno, Infinix, itel, Samsung's Galaxy A series and Xiaomi's Redmi, or an older phone bought second hand. Below are phones listed on Shopi at this price right now, then what to look for so you get a good one.",
  primaryKeyword: "phones under KSh 20,000",
  keywords: [
    "phones under 20000 Kenya",
    "best phones under 20k Kenya",
    "cheap smartphones Kenya",
    "budget phones Kenya",
    "Tecno phones under 20000",
  ],
  category: "phones",
  tags: ["budget-phones", "android", "tecno", "infinix", "samsung", "used-phones"],
  author: "shopi-team",
  publishedAt: "2026-09-24",
  featuredImage: {
    src: "/assets/blog/budget-phone.jpg",
    alt: "A hand holding a black Android smartphone",
    width: 1200,
    height: 675,
    credit: { name: "Daniel Romero / Unsplash", url: "https://unsplash.com/photos/aiUAxBNe3Xk" },
  },
  listings: {
    label: "phone",
    sources: [
      { subcategory: "Phones" },
      { subcategory: "Mobile Phones" },
      { subcategory: "Smartphones" },
      { query: "smartphone" },
    ],
    minPrice: 3_000,
    maxPrice: 20_000,
    titleExcludes: [
      "case",
      "cover",
      "protector",
      "glass",
      "charger",
      "cable",
      "stand",
      "holder",
      "earphone",
      "earbud",
      "headphone",
      "power bank",
      "tripod",
      "ring light",
      "watch",
    ],
    show: 8,
  },
  sections: [
    {
      id: "listings",
      heading: "Phones under KSh 20,000 on Shopi right now",
      blocks: [
        { type: "listings" },
        {
          type: "p",
          text: "These listings are filtered to KSh 20,000 or less, and the prices are what sellers are asking.",
        },
      ],
    },
    {
      id: "what-to-look-for",
      heading: "What to look for at this budget",
      blocks: [
        {
          type: "list",
          items: [
            "**Storage: 64GB at the very least, 128GB if you can.** Apps, photos and WhatsApp media fill a phone fast, and a full phone slows down.",
            "**RAM: 4GB or more** stops WhatsApp, TikTok and your browser reloading every time you switch between them.",
            "**Battery: 5,000mAh is common at this price** and usually lasts a full day.",
            "**Charging port: USB-C.** Most new phones use it, and it's easier to find a charger.",
            "**Network: 4G is fine for most people.** 5G only matters if you live in a 5G area and use a lot of data.",
            "**Software updates.** Samsung's Galaxy A phones usually get more years of updates than most budget brands, which helps with security and resale.",
          ],
        },
      ],
    },
    {
      id: "new-or-second-hand",
      heading: "New or second hand?",
      blocks: [
        {
          type: "p",
          text: "A new budget phone comes with a warranty and a fresh battery. Tecno, Infinix and itel phones are serviced at Carlcare service centres around Kenya.",
        },
        {
          type: "p",
          text: "A second-hand phone can get you a better camera or screen for the same money, but the battery has aged and there's usually no warranty. If you buy used, check it carefully first.",
        },
      ],
    },
    {
      id: "how-to-check",
      heading: "How to check a phone before you pay",
      blocks: [
        {
          type: "checklist",
          items: [
            "The seller removes their Google account (or Apple ID on an iPhone) in front of you. Otherwise the phone can lock itself after a reset.",
            "The IMEI matches: dial *#06# and compare it with the box and the phone's settings.",
            "Your own SIM works: make a call and use mobile data.",
            "The screen has no dead spots. Open a plain white page to see them.",
            "The cameras, speakers, microphone and charging port all work. Record a short voice note to test the mic.",
            "For a new phone, the box is sealed and the seller tells you what the warranty covers.",
          ],
        },
      ],
    },
    {
      id: "other-budgets",
      heading: "Other budgets",
      blocks: [
        {
          type: "p",
          text: "Want an iPhone instead? The [iPhone 13 price guide](/blog/iphone-13-price-in-kenya) covers what to check on a used one.",
        },
        {
          type: "links",
          title: "Browse by budget on Shopi",
          links: [
            {
              kind: "search",
              label: "Phones under KSh 30,000",
              query: "phone",
              minPrice: 3_000,
              maxPrice: 30_000,
            },
            {
              kind: "search",
              label: "Phones under KSh 50,000",
              query: "phone",
              minPrice: 3_000,
              maxPrice: 50_000,
            },
            { kind: "forSale", slug: "tecno" },
            { kind: "forSale", slug: "samsung" },
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Which phone brands are cheapest in Kenya?",
      a: "Tecno, Infinix and itel have the widest range of low-priced phones, alongside Samsung's Galaxy A series and Xiaomi's Redmi phones.",
    },
    {
      q: "Is a new budget phone better than a used flagship?",
      a: "A new budget phone gives you a fresh battery and a warranty. A used flagship gives you a better camera and screen, but check the battery and make sure it isn't locked to the previous owner's account.",
    },
    {
      q: "How do I know a second-hand phone isn't stolen?",
      a: "Ask for the box and receipt, check the IMEI matches by dialling *#06#, and walk away from a seller who can't unlock the phone or remove their account.",
    },
  ],
  marketplaceLinks: [
    { kind: "forSale", slug: "phones" },
    { kind: "forSale", slug: "tecno" },
    { kind: "forSale", slug: "samsung" },
    { kind: "hub", path: "/phones-electronics-kenya" },
  ],
  related: ["iphone-13-price-in-kenya"],
  cta: {
    label: "See phones under KSh 20,000",
    to: {
      kind: "search",
      label: "Phones under KSh 20,000",
      query: "phone",
      minPrice: 3_000,
      maxPrice: 20_000,
    },
    text: "Filter by brand and location, then message the seller directly.",
  },
};
