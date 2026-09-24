import type { Article } from "../types.ts";

export const article: Article = {
  slug: "iphone-13-price-in-kenya",
  status: "published",
  intent: "price-guide",
  title: "iPhone 13 Price in Kenya",
  seoTitle: "iPhone 13 Price in Kenya: Live Listings and What to Check",
  seoDescription:
    "iPhone 13 price in Kenya from live Shopi listings: storage options, brand new vs ex-UK, and what to check before you buy a used iPhone 13.",
  excerpt:
    "The iPhone 13 price in Kenya depends on the storage (128GB, 256GB or 512GB), whether it's brand new, ex-UK or used in Kenya, and the battery health. Current asking prices on Shopi are below, then how to tell the models apart and what to check before you pay.",
  primaryKeyword: "iPhone 13 price in Kenya",
  keywords: [
    "iPhone 13 price",
    "iPhone 13 ex-UK price Kenya",
    "used iPhone 13 Kenya",
    "iPhone 13 128GB",
    "iPhone 13 for sale",
  ],
  category: "phones",
  tags: ["iphone", "apple", "phone-prices", "used-phones"],
  author: "shopi-team",
  publishedAt: "2026-09-24",
  featuredImage: {
    src: "/assets/blog/iphone-13.jpg",
    alt: "Five iPhone 13 phones in different colours lined up on a table",
    width: 1200,
    height: 675,
    credit: { name: "Daniel Romero / Unsplash", url: "https://unsplash.com/photos/JSQva3za368" },
  },
  listings: {
    label: "iPhone 13",
    sources: [{ query: "iphone 13" }, { query: "iphone13" }],
    minPrice: 15_000,
    titleIncludes: ["iphone 13", "iphone13"],
    titleExcludes: [
      "pro",
      "mini",
      "case",
      "cover",
      "protector",
      "screen guard",
      "glass",
      "charger",
      "cable",
      "skin",
    ],
  },
  sections: [
    {
      id: "price",
      heading: "iPhone 13 price in Kenya",
      blocks: [
        { type: "livePrices" },
        {
          type: "p",
          text: "These prices are for the standard iPhone 13. The iPhone 13 mini, 13 Pro and 13 Pro Max are different phones with different prices, so don't compare them directly.",
        },
      ],
    },
    {
      id: "listings",
      heading: "iPhone 13 listings",
      blocks: [{ type: "listings" }],
    },
    {
      id: "models-and-storage",
      heading: "iPhone 13 models and storage",
      blocks: [
        {
          type: "table",
          caption: "The four iPhone 13 models",
          head: ["Model", "Screen", "Rear cameras", "Storage"],
          rows: [
            ["iPhone 13 mini", "5.4-inch", "2", "128GB, 256GB, 512GB"],
            ["iPhone 13", "6.1-inch", "2", "128GB, 256GB, 512GB"],
            ["iPhone 13 Pro", "6.1-inch", "3", "128GB, 256GB, 512GB, 1TB"],
            ["iPhone 13 Pro Max", "6.7-inch", "3", "128GB, 256GB, 512GB, 1TB"],
          ],
        },
        {
          type: "p",
          text: "Quick check: the iPhone 13 and 13 mini have two rear cameras, set diagonally. The Pro models have three. If a listing says \"iPhone 13\" but the photo shows three cameras, ask which model it really is.",
        },
        {
          type: "p",
          text: "Choose storage carefully — iPhones have no memory card slot. If you keep a lot of photos, videos and WhatsApp media, 128GB fills up faster than you'd expect.",
        },
      ],
    },
    {
      id: "what-affects-the-price",
      heading: "What affects the price?",
      blocks: [
        {
          type: "list",
          items: [
            "**Storage.** 256GB and 512GB cost more than 128GB.",
            "**Brand new, ex-UK or used in Kenya.** Brand new and sealed costs the most. Ex-UK means second hand and imported, usually from the UK. A phone already used in Kenya is usually the cheapest.",
            "**Battery health.** Check it in Settings > Battery > Battery Health & Charging. Below 80%, the battery is due for replacement.",
            "**Condition.** Scratches, a cracked back or a replaced screen all lower the price.",
            "**The box and warranty.** The original box, a receipt and any warranty left all add value.",
          ],
        },
      ],
    },
    {
      id: "what-to-check",
      heading: "What to check before buying",
      blocks: [
        {
          type: "checklist",
          items: [
            "The seller signs out of their Apple ID in front of you and turns off Find My. An iPhone still locked to someone else's Apple ID can't be used.",
            "The IMEI matches: dial *#06# and compare it with Settings > General > About and the box.",
            "Settings > General > About shows Parts and Service History when the screen, battery or camera has been replaced, and whether the part is genuine.",
            "Face ID works, and both rear cameras focus.",
            "Your own SIM works in it: make a call and use mobile data.",
            "It charges with a cable, and the speakers and microphone work. Record a short voice note to check.",
          ],
        },
      ],
    },
    {
      id: "where-to-buy",
      heading: "Where to buy an iPhone 13 in Kenya",
      blocks: [
        {
          type: "p",
          text: "Phone shops in town and in malls sell brand new and ex-UK iPhones, often with a shop warranty. Private sellers are usually cheaper, but you do the checks yourself and there's rarely a warranty.",
        },
        {
          type: "p",
          text: "On a tighter budget? See [phones under KSh 20,000](/blog/phones-under-20000-in-kenya).",
        },
        {
          type: "links",
          title: "Find an iPhone on Shopi",
          links: [
            { kind: "forSale", slug: "iphone" },
            { kind: "forSale", slug: "phones" },
            { kind: "hub", path: "/phones-electronics-kenya" },
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Is the iPhone 13 dual SIM?",
      a: "Yes. It takes one nano-SIM and one eSIM, so you can use two lines if your network offers eSIM.",
    },
    {
      q: "Does the iPhone 13 support 5G?",
      a: "Yes, every iPhone 13 model supports 5G.",
    },
    {
      q: "What does ex-UK mean?",
      a: "Ex-UK is what Kenyan sellers call a second-hand phone imported from the UK. It isn't new, so check it as carefully as any used phone.",
    },
    {
      q: "How do I check an iPhone's battery health?",
      a: "Go to Settings > Battery > Battery Health & Charging. Maximum Capacity shows how much charge the battery holds compared with when it was new.",
    },
  ],
  marketplaceLinks: [
    { kind: "forSale", slug: "iphone" },
    { kind: "forSale", slug: "phones" },
    { kind: "forSale", slug: "samsung" },
    { kind: "hub", path: "/phones-electronics-kenya" },
  ],
  related: ["phones-under-20000-in-kenya"],
  cta: {
    label: "See iPhone 13 listings",
    to: { kind: "search", label: "iPhone 13 listings", query: "iphone 13" },
    text: "Compare storage, condition and price, then message the seller directly.",
  },
};
