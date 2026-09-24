import type { Article } from "../types.ts";

export const article: Article = {
  slug: "bedsitters-for-rent-in-nairobi",
  status: "published",
  intent: "location-guide",
  title: "Bedsitters for Rent in Nairobi",
  seoTitle: "Bedsitters for Rent in Nairobi: Areas, Rent and Tips",
  seoDescription:
    "Bedsitters for rent in Nairobi: live listings on Shopi, the areas to look in, what drives the rent, and what to check before you pay a deposit.",
  excerpt:
    "You can find bedsitters for rent in Nairobi in most estates, especially along Thika Road, across Eastlands and in the towns just outside the city. The rent depends on the area, the water supply, security and how new the building is. Below are current listings, where to look, and what to check before you pay anything.",
  primaryKeyword: "bedsitters for rent in Nairobi",
  keywords: [
    "bedsitter for rent Nairobi",
    "bedsitters Nairobi",
    "cheap bedsitters Nairobi",
    "studio apartment Nairobi",
    "houses for rent Nairobi",
  ],
  category: "property",
  tags: ["rentals", "bedsitters", "nairobi", "houses-for-rent"],
  author: "shopi-team",
  publishedAt: "2026-09-24",
  featuredImage: {
    src: "/assets/blog/nairobi-apartments.jpg",
    alt: "Apartment blocks in Nairobi with the city skyline behind them",
    width: 1200,
    height: 675,
    credit: { name: "Seth Salimo / Unsplash", url: "https://unsplash.com/photos/FdPez-Xwhmw" },
  },
  listings: {
    label: "bedsitter",
    sources: [{ query: "bedsit" }, { query: "studio apartment" }],
    county: "Nairobi",
    minPrice: 2_000,
    titleIncludes: ["bedsit", "studio"],
    titleExcludes: ["for sale", "photo", "music", "recording"],
    priceUnit: "month",
  },
  sections: [
    {
      id: "rent",
      heading: "Bedsitter rent in Nairobi",
      blocks: [
        { type: "livePrices" },
        {
          type: "p",
          text: "These are the monthly rents landlords and agents are asking on Shopi for bedsitters in Nairobi County. The same size of room costs more in a newer building, near a main road, or with a reliable water supply.",
        },
      ],
    },
    {
      id: "listings",
      heading: "Bedsitters for rent in Nairobi right now",
      blocks: [{ type: "listings" }],
    },
    {
      id: "areas",
      heading: "Where to look",
      blocks: [
        {
          type: "p",
          text: "Most people choose an area by their commute first. A few places to start:",
        },
        {
          type: "table",
          caption: "Areas to look for a bedsitter in and around Nairobi",
          head: ["Area", "Why people look here", "Ask about"],
          rows: [
            [
              "Roysambu, Zimmerman, Kasarani",
              "Along Thika Road, with plenty of matatus into town",
              "How many days a week the water comes",
            ],
            [
              "Kahawa West, Githurai",
              "Near Kenyatta University; usually among the more affordable areas",
              "The walk from the stage, especially at night",
            ],
            [
              "Umoja, Donholm, Pipeline, Embakasi",
              "Eastlands, close to Industrial Area and Outer Ring Road",
              "Peak-hour traffic on Outer Ring Road and Jogoo Road",
            ],
            [
              "Rongai, Kitengela",
              "Just outside Nairobi, with many newer buildings",
              "The daily commute on Magadi Road or Namanga Road",
            ],
            [
              "Ruaka, Kinoo",
              "Just outside Nairobi, close to Westlands and Waiyaki Way",
              "Traffic on Limuru Road or Waiyaki Way",
            ],
          ],
        },
        {
          type: "p",
          text: "Rongai, Kitengela, Ruaka and Kinoo are outside Nairobi County, so they aren't in the Nairobi listings above.",
        },
      ],
    },
    {
      id: "what-affects-the-rent",
      heading: "What affects the rent?",
      blocks: [
        {
          type: "list",
          items: [
            "**Location and commute.** Being close to a main road and a busy stage costs more.",
            "**Water.** County water, a borehole, a storage tank, or all three. Reliable water is worth paying for.",
            "**Security.** A gate, a guard and CCTV push the rent up.",
            "**The building.** Newer blocks with tiled floors, a proper kitchen area and a hot shower cost more.",
            "**Electricity.** Your own prepaid token meter is better than a shared meter split between tenants.",
            "**Extras.** Parking, a lift, or Wi-Fi already connected to the building.",
          ],
        },
      ],
    },
    {
      id: "before-you-pay",
      heading: "Before you pay a deposit",
      blocks: [
        {
          type: "checklist",
          items: [
            "View the house in person. Never pay a viewing fee or a deposit for a house you haven't seen.",
            "Know who you're dealing with — the landlord, the caretaker or an agent — and ask whether there's an agent fee before you view.",
            "Ask exactly what you pay before moving in. Usually it's a deposit (often one month's rent) plus the first month's rent, and some landlords also ask for a water or electricity deposit.",
            "Open the taps, look at the water tank and ask how often water comes.",
            "Check the electricity meter: your own token meter, or a shared one?",
            "Check your phone signal inside the room.",
            "Get a written tenancy agreement, and a receipt or M-Pesa record for every payment.",
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "Watch out for fake agents",
          text: "Some people advertise houses they don't manage and ask for a viewing fee or a deposit to \"book\" the house. If someone won't show you the house before you pay, walk away.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "What is a bedsitter?",
      a: "A bedsitter is one room that works as both bedroom and sitting room, with its own small kitchen area and bathroom. A single room is usually just a room, often with a shared bathroom.",
    },
    {
      q: "How much deposit do Nairobi landlords ask for?",
      a: "Most ask for a deposit, often one month's rent, plus the first month's rent before you move in. Some also ask for a water or electricity deposit. Always get a receipt.",
    },
    {
      q: "Is a bedsitter the same as a studio apartment?",
      a: "Mostly, yes. Studio is the word newer buildings tend to use, and a studio often has a slightly bigger, separate kitchen area.",
    },
  ],
  marketplaceLinks: [
    { kind: "forSale", slug: "houses-for-rent" },
    { kind: "county", slug: "nairobi" },
    { kind: "hub", path: "/property-for-sale-kenya" },
  ],
  cta: {
    label: "See bedsitters in Nairobi",
    to: { kind: "search", label: "Bedsitters in Nairobi", query: "bedsit nairobi" },
    text: "Message the landlord or agent directly and arrange a viewing.",
  },
};
