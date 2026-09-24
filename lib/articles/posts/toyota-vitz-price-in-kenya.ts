import type { Article } from "../types.ts";

export const article: Article = {
  slug: "toyota-vitz-price-in-kenya",
  status: "published",
  intent: "price-guide",
  title: "Toyota Vitz Price in Kenya",
  seoTitle: "Toyota Vitz Price in Kenya: Live Listings and Buying Tips",
  seoDescription:
    "Toyota Vitz price in Kenya: asking prices from live Shopi listings, what moves the price, and what to check before you buy a used Vitz.",
  excerpt:
    "The Toyota Vitz price in Kenya depends mostly on the year, the engine size, the mileage and the car's condition. Below are the asking prices on current Shopi listings, then what moves the price and what to check before you pay.",
  primaryKeyword: "Toyota Vitz price in Kenya",
  keywords: [
    "Toyota Vitz price",
    "used Toyota Vitz Kenya",
    "Toyota Vitz for sale",
    "Vitz 1000cc",
    "Vitz 1300cc",
  ],
  category: "cars",
  tags: ["toyota", "vitz", "used-cars", "car-prices", "small-cars"],
  author: "shopi-team",
  publishedAt: "2026-09-24",
  featuredImage: {
    src: "/assets/blog/toyota-vitz.jpg",
    alt: "A red Toyota Vitz at a car yard",
    width: 1200,
    height: 675,
    credit: { name: "Divaris Shirichena / Unsplash", url: "https://unsplash.com/photos/9RL-EO3WRo0" },
  },
  listings: {
    label: "Toyota Vitz",
    sources: [{ query: "toyota vitz" }, { query: "vitz" }],
    minPrice: 150_000,
    titleIncludes: ["vitz"],
    titleExcludes: [
      "headlight",
      "bumper",
      "mirror",
      "rim",
      "tyre",
      "grille",
      "seat cover",
      "parts",
      "for hire",
    ],
  },
  sections: [
    {
      id: "price",
      heading: "Toyota Vitz price in Kenya",
      blocks: [
        { type: "livePrices" },
        {
          type: "p",
          text: "These are sellers' asking prices, so expect room to negotiate. Two Vitzes from the same year can be far apart in price: engine size, mileage and condition matter more than the year alone.",
        },
      ],
    },
    {
      id: "listings",
      heading: "Toyota Vitz listings",
      blocks: [{ type: "listings" }],
    },
    {
      id: "what-affects-the-price",
      heading: "What affects the price?",
      blocks: [
        {
          type: "list",
          items: [
            "**Year and shape.** Buyers price the generations apart, and a newer shape usually costs more even with higher mileage.",
            "**Engine size.** The 1.0 litre (listed as 1000cc) is usually cheaper than the 1.3 litre (1300cc). The sporty 1.5 RS and the Hybrid are less common.",
            "**Mileage.** Low mileage only counts if service records back it up.",
            "**Foreign used or locally used.** A car recently imported from Japan usually costs more than one that has been driven in Kenya for years.",
            "**Condition and accident history.** Rust, respray work and worn suspension all bring the price down.",
            "**The logbook.** A logbook in the seller's name, ready to transfer, is worth paying a little more for.",
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Why most Vitzes for sale are locally used",
          text: "Kenya only allows used cars up to eight years old, counted from the year of first registration, to be imported. Toyota replaced the Vitz with the Yaris in Japan in 2020, so fewer Vitzes qualify for import every year.",
        },
      ],
    },
    {
      id: "models",
      heading: "Toyota Vitz models",
      blocks: [
        {
          type: "table",
          caption: "Toyota Vitz generations you'll see for sale in Kenya",
          head: ["Model", "Years", "Engines", "What to know"],
          rows: [
            [
              "2nd generation (XP90)",
              "2005–2010",
              "1.0, 1.3, 1.5",
              "The oldest Vitzes for sale. Check carefully for rust and worn suspension.",
            ],
            [
              "3rd generation (XP130)",
              "2010–2020",
              "1.0, 1.3, 1.5 RS",
              "Updated in 2014 and 2017. The 1.0 is a three-cylinder engine, the 1.3 a four-cylinder.",
            ],
            [
              "Vitz Hybrid",
              "2017–2020",
              "1.5 hybrid",
              "The best on fuel. Ask for a check of the hybrid battery before you buy.",
            ],
          ],
        },
        {
          type: "p",
          text: "Listings also mention grades such as F (the basic one), Jewela and RS (the sporty 1.5). If a listing doesn't say the engine size, ask — it's the first thing that changes the price.",
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
            "The logbook is in the seller's name, and the name matches their ID.",
            "An official vehicle search with NTSA shows the same owner and no bank or lender still on the logbook.",
            "The chassis number on the car matches the logbook.",
            "A mechanic you trust has inspected it before you pay anything.",
            "On the test drive, it pulls away smoothly. Most Vitzes are automatics, and jerks, slipping or a loud whine from the gearbox are warning signs.",
            "The paint matches on every panel and the gaps between panels are even. Differences point to accident repairs.",
            "All the dashboard warning lights go off after the engine starts.",
            "There is no rust or oil leaking underneath, especially on older cars.",
          ],
        },
        {
          type: "callout",
          tone: "warning",
          text: "Never send a deposit to hold a car you haven't seen. Pay once the car, the logbook and the NTSA transfer all check out.",
        },
        {
          type: "p",
          text: "The full step-by-step list is in our guide on [how to check a used car before buying](/blog/how-to-check-a-used-car-before-buying-in-kenya).",
        },
      ],
    },
    {
      id: "where-to-find",
      heading: "Where to find a Toyota Vitz in Kenya",
      blocks: [
        {
          type: "p",
          text: "You'll find Vitzes at car yards, from dealers who import from Japan, and from private owners. A private owner is often cheaper than a yard, but you do all the checks yourself.",
        },
        {
          type: "p",
          text: "On Shopi you message the owner directly and agree the viewing between you. If the Vitz isn't quite right, the [Nissan Note](/for-sale/nissan-note) is the small car buyers most often compare it with.",
        },
        {
          type: "links",
          title: "Find a Vitz on Shopi",
          links: [
            { kind: "forSale", slug: "toyota-vitz" },
            { kind: "forSale", slug: "cars" },
            { kind: "county", slug: "nairobi" },
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "How much is a Toyota Vitz in Kenya?",
      a: "It depends on the year, the engine size, the mileage and the condition. This page shows the asking prices on current Shopi Vitz listings, taken from the listings themselves rather than estimated.",
    },
    {
      q: "Which is better, the Vitz 1000cc or 1300cc?",
      a: "The 1000cc is cheaper to buy and suits mostly town driving. The 1300cc has more power for highways, hills and a full car. Both are easy to service in Kenya.",
    },
    {
      q: "Can I still import a Toyota Vitz to Kenya?",
      a: "Only if it is within Kenya's eight-year import limit, counted from the year of first registration. Toyota replaced the Vitz with the Yaris in Japan in 2020, so fewer Vitzes qualify each year.",
    },
    {
      q: "What should I check when buying a used Vitz?",
      a: "Confirm the logbook is in the seller's name, do an official NTSA vehicle search, match the chassis number, have a mechanic inspect the car, and test-drive it to check the gearbox.",
    },
  ],
  marketplaceLinks: [
    { kind: "forSale", slug: "toyota-vitz" },
    { kind: "forSale", slug: "cars" },
    { kind: "county", slug: "nairobi" },
    { kind: "sellCar", slug: "toyota-vitz" },
  ],
  related: [
    "how-to-check-a-used-car-before-buying-in-kenya",
    "how-much-is-my-car-worth-in-kenya",
  ],
  cta: {
    label: "See Toyota Vitz listings",
    to: { kind: "forSale", slug: "toyota-vitz" },
    text: "Compare photos, prices and locations, then message the seller directly.",
  },
};
