/**
 * The category landing pages, as data.
 *
 * Each of these pages earns its own search traffic, so they cross-link (see
 * CategoryCrossLinks and BrowseHub) and blog articles link into them. Kept
 * import-free so the article link resolver — which the SEO audit loads
 * directly in Node — can validate links against it.
 */
export const categoryPages = [
  {
    path: "/buy-and-sell-in-kenya",
    title: "Buy and sell in Kenya",
    body: "A free local marketplace for finding items nearby, posting your own listings, and chatting directly.",
  },
  {
    path: "/phones-electronics-kenya",
    title: "Phones and electronics",
    body: "Samsung, iPhone, used phones, smart TVs, laptops and speakers from sellers across Kenya.",
  },
  {
    path: "/property-for-sale-kenya",
    title: "Land, plots and property",
    body: "Land, plots, houses for sale and houses for rent, from Nairobi to Nyahururu and Nyandarua.",
  },
  {
    path: "/sell-car-kenya",
    title: "Cars for sale",
    body: "Used cars with photos or video, make, model, year, mileage, price and direct buyer chat.",
  },
  {
    path: "/beauty-cosmetics-kenya",
    title: "Beauty and cosmetics",
    body: "Skincare, makeup, perfumes, wigs and hair products from local beauty sellers.",
  },
  {
    path: "/sell-in-kenya",
    title: "Selling on Shopi",
    body: "How to post an item for free, what to include, and how buyers reach you.",
  },
] as const;

export type CategoryHubPath = (typeof categoryPages)[number]["path"];
