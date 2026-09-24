import type { Article } from "../types.ts";

export const article: Article = {
  slug: "ps5-price-in-kenya",
  status: "published",
  intent: "price-guide",
  title: "PS5 Price in Kenya",
  seoTitle: "PS5 Price in Kenya: Live Listings, Models and Tips",
  seoDescription:
    "PS5 price in Kenya from live Shopi listings: disc vs Digital Edition, the Slim and the Pro, and what to check before you buy a used PS5.",
  excerpt:
    "The PS5 price in Kenya depends on which version you're buying — the original PS5 or the newer Slim, with a disc drive or the Digital Edition, or the PS5 Pro — and on whether it's new or used and what comes with it. Current asking prices on Shopi are below.",
  primaryKeyword: "PS5 price in Kenya",
  keywords: [
    "PlayStation 5 price Kenya",
    "PS5 Slim price Kenya",
    "PS5 Pro Kenya",
    "used PS5 Kenya",
    "PS5 for sale",
  ],
  category: "electronics",
  tags: ["ps5", "playstation", "gaming", "electronics-prices"],
  author: "shopi-team",
  publishedAt: "2026-09-24",
  featuredImage: {
    src: "/assets/blog/ps5.jpg",
    alt: "A PlayStation 5 lying flat with a DualSense controller on top",
    width: 1200,
    height: 675,
    credit: { name: "Kerde Severin / Unsplash", url: "https://unsplash.com/photos/NVD_32BBZFE" },
  },
  listings: {
    label: "PS5",
    sources: [{ query: "ps5" }, { query: "playstation 5" }],
    minPrice: 20_000,
    titleIncludes: ["ps5", "playstation 5", "playstation5"],
    titleExcludes: ["controller only", "skin", "cooling fan", "charging dock"],
  },
  sections: [
    {
      id: "price",
      heading: "PS5 price in Kenya",
      blocks: [
        { type: "livePrices" },
        {
          type: "p",
          text: "These are asking prices for consoles. The original PS5, the Slim and the Pro are mixed together here, so check which model a listing is before you compare prices.",
        },
      ],
    },
    {
      id: "listings",
      heading: "PS5 listings",
      blocks: [{ type: "listings" }],
    },
    {
      id: "models",
      heading: "PS5 models",
      blocks: [
        {
          type: "table",
          caption: "The PS5 versions you'll see for sale",
          head: ["Model", "Released", "Disc drive", "Storage"],
          rows: [
            [
              "PS5 (original)",
              "2020",
              "Standard version has one; the Digital Edition doesn't",
              "825GB",
            ],
            [
              "PS5 Slim",
              "2023",
              "Disc version has one; the Digital version can take a detachable drive",
              "1TB",
            ],
            [
              "PS5 Pro",
              "2024",
              "Not included; the detachable drive is sold separately",
              "2TB",
            ],
          ],
        },
        {
          type: "p",
          text: "The Slim is smaller and lighter than the original, and games play the same on both. The Pro is the most powerful, and the difference is most noticeable on a 4K TV.",
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
            "**The model.** Original, Slim or Pro.",
            "**Disc or digital.** The Digital Edition launched cheaper, but you can only buy games as downloads — no second-hand or swapped disc games.",
            "**New or used.** A used console costs less, but usually comes without a warranty.",
            "**What's included.** An extra controller or games add to the price, and can still work out cheaper than buying them separately.",
            "**Receipt and warranty.** Proof of purchase and any warranty left add value.",
          ],
        },
      ],
    },
    {
      id: "what-to-check",
      heading: "What to check before buying a used PS5",
      blocks: [
        {
          type: "checklist",
          items: [
            "Play for at least 15 minutes. It should stay reasonably quiet and not shut down.",
            "The HDMI port isn't loose or damaged — a common PS5 repair.",
            "The controller has no stick drift: let go of both sticks in a game and check nothing keeps moving.",
            "On a disc model, a game disc loads.",
            "It signs in to PlayStation Network, which shows the console isn't banned.",
            "The seller removes their PlayStation account from the console.",
            "The serial number on the console matches the box.",
          ],
        },
      ],
    },
    {
      id: "where-to-buy",
      heading: "Where to buy a PS5 in Kenya",
      blocks: [
        {
          type: "p",
          text: "Electronics shops in town and in malls sell new consoles, usually with a warranty. Gamers sell used consoles directly, often with controllers and games included, and usually for less.",
        },
        {
          type: "links",
          title: "Find a PS5 on Shopi",
          links: [
            { kind: "search", label: "PS5 listings", query: "ps5" },
            { kind: "forSale", slug: "tvs" },
            { kind: "hub", path: "/phones-electronics-kenya" },
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Is the PS5 Digital Edition cheaper?",
      a: "It launched at a lower price than the disc version. It can't play discs, though, so you can't buy cheaper second-hand disc games for it.",
    },
    {
      q: "Can a PS5 play PS4 games?",
      a: "Yes. Almost all PS4 games work on a PS5.",
    },
    {
      q: "What's the difference between the PS5 and the PS5 Slim?",
      a: "The Slim is smaller, has more storage (1TB), and the Digital version can take a disc drive later. Games play the same on both.",
    },
  ],
  marketplaceLinks: [
    { kind: "hub", path: "/phones-electronics-kenya" },
    { kind: "forSale", slug: "tvs" },
    { kind: "forSale", slug: "laptops" },
  ],
  cta: {
    label: "See PS5 listings",
    to: { kind: "search", label: "PS5 listings", query: "ps5" },
    text: "Compare consoles and bundles, then message the seller directly.",
  },
};
