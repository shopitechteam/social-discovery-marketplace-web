import type { Article } from "../types.ts";

export const article: Article = {
  slug: "sofa-prices-in-kenya",
  status: "published",
  intent: "price-guide",
  title: "Sofa Prices in Kenya",
  seoTitle: "Sofa Prices in Kenya: Live Listings, Sizes and Tips",
  seoDescription:
    "Sofa prices in Kenya from live Shopi listings: 3-seater, 5-seater and L-shaped sofas, what makes one cost more, and what to check before you buy.",
  excerpt:
    "Sofa prices in Kenya depend on the size — a 3-seater, a 5-seater set or an L-shaped sofa — the wood in the frame, the foam, and the fabric or leather. Current asking prices on Shopi are below, then what makes one sofa cost more than another.",
  primaryKeyword: "sofa prices in Kenya",
  keywords: [
    "sofa price Kenya",
    "5 seater sofa Kenya",
    "L-shaped sofa Kenya",
    "sofa sets for sale Kenya",
    "second hand sofa Kenya",
  ],
  category: "home",
  tags: ["furniture", "sofas", "home", "second-hand"],
  author: "shopi-team",
  publishedAt: "2026-09-24",
  featuredImage: {
    src: "/assets/blog/sofa.jpg",
    alt: "A dark grey L-shaped sofa in a living room",
    width: 1200,
    height: 675,
    credit: { name: "Sven Brandsma / Unsplash", url: "https://unsplash.com/photos/GZ5cKOgeIB0" },
  },
  listings: {
    label: "sofa",
    sources: [
      { query: "sofa" },
      { query: "couch" },
      { subcategory: "Sofas & Couches" },
    ],
    minPrice: 3_000,
    titleIncludes: ["sofa", "couch", "seater", "sectional"],
    titleExcludes: ["cover", "cleaning", "repair", "throw"],
  },
  sections: [
    {
      id: "price",
      heading: "Sofa prices in Kenya",
      blocks: [
        { type: "livePrices" },
        {
          type: "p",
          text: "Asking prices mix sizes and materials, so compare like with like: a 3-seater with a 3-seater, a 7-seater set with a 7-seater set.",
        },
      ],
    },
    {
      id: "listings",
      heading: "Sofa listings",
      blocks: [{ type: "listings" }],
    },
    {
      id: "sizes",
      heading: "Sofa sizes",
      blocks: [
        {
          type: "table",
          caption: "Common sofa sizes in Kenya",
          head: ["Size", "What it means", "Good for"],
          rows: [
            ["3-seater", "One sofa for three people", "A bedsitter or a small sitting room"],
            ["5-seater", "A 3-seater plus a 2-seater", "A typical family sitting room"],
            ["7-seater", "Usually 3 + 2 + 1 + 1", "A large sitting room"],
            ["L-shaped", "A corner sofa, often seating five or more", "Making good use of a corner"],
            ["Sofa bed", "Folds out into a bed", "A room that doubles as a guest room"],
          ],
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
            "**The frame.** Hardwood frames, such as mahogany, last longer than softwood like pine, and cost more.",
            "**The foam.** High-density foam keeps its shape for years. Cheap foam sags much sooner.",
            "**The cover.** Real leather costs the most. Leatherette (faux leather) is cheaper but can peel. Fabric covers range widely in price and are easier to repair.",
            "**Made to order or ready-made.** Local workshops make sofas to your size and fabric, often for less than a showroom.",
            "**New or second hand.** People moving house sell good sofas cheaply, but check the foam and frame closely.",
            "**Delivery.** Ask whether it's included — moving a 7-seater set across town costs money.",
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
            "Sit on every seat. The cushions should spring back, and you shouldn't feel the frame.",
            "Lift one corner. A solid frame feels heavy and doesn't creak or twist.",
            "Check the stitching, and the underside for loose joints or staples.",
            "Ask what the foam is, and whether the covers come off for washing.",
            "Measure your door, stairs and sitting room first.",
            "For a made-to-order sofa, agree the size, fabric, price and delivery date in writing before you pay a deposit.",
          ],
        },
      ],
    },
    {
      id: "where-to-buy",
      heading: "Where to buy a sofa in Kenya",
      blocks: [
        {
          type: "p",
          text: "Furniture showrooms, local workshops that make sofas to order, and second-hand sellers all sell sofas. Workshops let you choose the size and fabric; second hand is usually the cheapest.",
        },
        {
          type: "links",
          title: "Find furniture on Shopi",
          links: [
            { kind: "forSale", slug: "sofas" },
            { kind: "forSale", slug: "furniture" },
            { kind: "forSale", slug: "beds" },
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "What is a 5-seater sofa?",
      a: "In Kenya, a 5-seater usually means a set of two sofas: a 3-seater and a 2-seater.",
    },
    {
      q: "Is a leather or fabric sofa better?",
      a: "Real leather wipes clean and lasts well. Fabric is cheaper, comes in more colours and is easier to repair. Avoid cheap leatherette if you want the sofa to last.",
    },
    {
      q: "How can I tell if a sofa has good foam?",
      a: "Press a cushion down hard and let go. Good high-density foam springs back quickly and feels firm. Foam that stays pressed down will sag.",
    },
  ],
  marketplaceLinks: [
    { kind: "forSale", slug: "sofas" },
    { kind: "forSale", slug: "furniture" },
    { kind: "forSale", slug: "beds" },
  ],
  cta: {
    label: "See sofa listings",
    to: { kind: "forSale", slug: "sofas" },
    text: "Compare sizes, materials and prices, then message the seller directly.",
  },
};
