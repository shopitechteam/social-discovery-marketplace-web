export type SearchIntentPage = {
  slug: string;
  query: string;
  label: string;
  pluralLabel: string;
  category: string;
  intro: string;
  buyerTips: string[];
  sellerTips: string[];
  keywords: string[];
  related: string[];
};

export const searchIntentPages = [
  {
    slug: "mazda-atenza",
    query: "Mazda Atenza",
    label: "Mazda Atenza",
    pluralLabel: "Mazda Atenza cars",
    category: "Cars",
    intro:
      "Find Mazda Atenza cars for sale in Kenya from local sellers. Compare price, location, photos, mileage and condition, then message the seller directly on Shopi.",
    buyerTips: [
      "Compare year, mileage, engine size, transmission and condition before messaging.",
      "Ask for logbook status, service history and whether the price is negotiable.",
      "Arrange inspection before payment and verify ownership documents carefully.",
    ],
    sellerTips: [
      "Mention Mazda Atenza, year, mileage, trim, engine size and location in the title or description.",
      "Upload clear interior, exterior, dashboard and engine-bay photos or video.",
      "Add the price in KES and say whether the car is negotiable.",
    ],
    keywords: [
      "mazda atenza for sale",
      "mazda atenza for sale in Kenya",
      "used mazda atenza Kenya",
      "mazda atenza price Kenya",
      "mazda cars for sale Kenya",
    ],
    related: ["toyota-premio", "toyota-harrier", "probox", "land"],
  },
  {
    slug: "toyota-premio",
    query: "Toyota Premio",
    label: "Toyota Premio",
    pluralLabel: "Toyota Premio cars",
    category: "Cars",
    intro:
      "Browse Toyota Premio cars for sale in Kenya and contact sellers directly. Shop by location, price, year, mileage and condition on Shopi.",
    buyerTips: [
      "Check year, mileage, grade, accident history and import documents.",
      "Compare similar Premio listings before negotiating.",
      "Inspect the vehicle and documents before sending money.",
    ],
    sellerTips: [
      "Include Toyota Premio, year, mileage, grade and location in your listing.",
      "Show photos of the exterior, interior, tyres and dashboard.",
      "State your asking price and whether it is negotiable.",
    ],
    keywords: [
      "toyota premio for sale",
      "toyota premio for sale in Kenya",
      "used toyota premio Kenya",
      "premio price Kenya",
    ],
    related: ["mazda-atenza", "toyota-harrier", "probox", "phones"],
  },
  {
    slug: "toyota-harrier",
    query: "Toyota Harrier",
    label: "Toyota Harrier",
    pluralLabel: "Toyota Harrier SUVs",
    category: "Cars",
    intro:
      "Search Toyota Harrier SUVs for sale in Kenya, compare seller listings and message directly to ask about price, mileage, condition and location.",
    buyerTips: [
      "Compare model year, engine, trim, mileage and condition.",
      "Ask for service history and ownership documents.",
      "View and inspect the car before payment.",
    ],
    sellerTips: [
      "Use a clear title with Toyota Harrier, year, trim and location.",
      "Add enough photos or video for buyers to judge condition.",
      "Include mileage, price, fuel type and negotiability.",
    ],
    keywords: [
      "toyota harrier for sale",
      "toyota harrier for sale in Kenya",
      "used toyota harrier Kenya",
      "harrier price Kenya",
    ],
    related: ["mazda-atenza", "toyota-premio", "probox", "land"],
  },
  {
    slug: "probox",
    query: "Probox",
    label: "Toyota Probox",
    pluralLabel: "Toyota Probox cars",
    category: "Cars",
    intro:
      "Find Toyota Probox cars for sale in Kenya from local sellers. Compare price, condition, year, mileage and location before messaging.",
    buyerTips: [
      "Check mileage, engine condition, use history and body condition.",
      "Ask whether it was private, business or taxi use.",
      "Verify documents and inspect before payment.",
    ],
    sellerTips: [
      "Mention Toyota Probox, year, mileage and location clearly.",
      "Show photos of the body, boot, dashboard and engine.",
      "Include price, negotiability and condition notes.",
    ],
    keywords: [
      "probox for sale",
      "toyota probox for sale in Kenya",
      "used probox Kenya",
      "probox price Kenya",
    ],
    related: ["mazda-atenza", "toyota-premio", "toyota-harrier", "farm-produce"],
  },
  {
    slug: "land",
    query: "land",
    label: "Land",
    pluralLabel: "land listings",
    category: "Property",
    intro:
      "Find land for sale in Kenya, including plots, farms and property listings from sellers you can message directly on Shopi.",
    buyerTips: [
      "Check location, size, access road, title status and nearby landmarks.",
      "Ask for viewing details and verify documents with the relevant authorities.",
      "Use proper legal advice before deposit or payment.",
    ],
    sellerTips: [
      "Mention land size, location, title status, price and nearby landmarks.",
      "Upload photos or video showing access road and the actual plot.",
      "Be clear about negotiability, viewing times and ownership documents.",
    ],
    keywords: [
      "land for sale",
      "land for sale in Kenya",
      "plots for sale Kenya",
      "property for sale Kenya",
      "farms for sale Kenya",
    ],
    related: ["plots", "houses-for-rent", "mazda-atenza", "farm-produce"],
  },
  {
    slug: "plots",
    query: "plots",
    label: "Plots",
    pluralLabel: "plots",
    category: "Property",
    intro:
      "Browse plots for sale in Kenya and contact sellers directly. Shopi helps buyers compare location, price, size and property details.",
    buyerTips: [
      "Confirm exact location, size, access road and title status.",
      "Ask for landmarks, map pin and viewing arrangements.",
      "Verify ownership before paying a deposit.",
    ],
    sellerTips: [
      "Include plot size, town, estate, price and title status.",
      "Add clear photos or video of the plot and access route.",
      "Mention nearby schools, roads, markets or services.",
    ],
    keywords: [
      "plots for sale",
      "plots for sale in Kenya",
      "cheap plots for sale Kenya",
      "land plots Kenya",
    ],
    related: ["land", "houses-for-rent", "farm-produce", "livestock"],
  },
  {
    slug: "houses-for-rent",
    query: "houses for rent",
    label: "Houses for rent",
    pluralLabel: "rental houses",
    category: "Property",
    intro:
      "Search houses for rent in Kenya on Shopi, compare location and price, then message landlords or agents directly.",
    buyerTips: [
      "Check rent, deposit, location, amenities and viewing availability.",
      "Ask whether utilities, parking and security are included.",
      "Visit the property before paying rent or deposit.",
    ],
    sellerTips: [
      "Mention rent, deposit, location, bedrooms and amenities.",
      "Upload clear photos or video of rooms, compound and access.",
      "State viewing times and move-in availability.",
    ],
    keywords: [
      "houses for rent",
      "houses for rent in Kenya",
      "rental houses Kenya",
      "apartments for rent Kenya",
    ],
    related: ["land", "plots", "furniture", "beds"],
  },
  {
    slug: "phones",
    query: "phones",
    label: "Phones",
    pluralLabel: "phones",
    category: "Phones and electronics",
    intro:
      "Find new and used phones for sale in Kenya from local sellers. Compare price, model, storage, condition and location on Shopi.",
    buyerTips: [
      "Check storage, battery health, condition, accessories and warranty.",
      "Confirm whether the phone is original, unlocked and not account-locked.",
      "Inspect the phone before payment where possible.",
    ],
    sellerTips: [
      "Mention brand, model, storage, RAM, condition and location.",
      "Upload clear photos of the screen, back, ports and accessories.",
      "State price, warranty status and whether the price is negotiable.",
    ],
    keywords: [
      "phones for sale",
      "phones for sale in Kenya",
      "used phones Kenya",
      "smartphones Kenya",
    ],
    related: ["iphone", "samsung", "tecno", "laptops"],
  },
  {
    slug: "iphone",
    query: "iPhone",
    label: "iPhone",
    pluralLabel: "iPhones",
    category: "Phones and electronics",
    intro:
      "Browse iPhones for sale in Kenya and message sellers directly. Compare model, storage, battery health, condition and location.",
    buyerTips: [
      "Ask for model, storage, battery health, Face ID status and warranty.",
      "Check iCloud status and inspect the phone before payment.",
      "Compare prices across similar iPhone listings.",
    ],
    sellerTips: [
      "Include iPhone model, storage, battery health, condition and location.",
      "Show the phone clearly from front, back and sides.",
      "Mention accessories, warranty and negotiability.",
    ],
    keywords: [
      "iphone for sale",
      "iphone for sale in Kenya",
      "used iphone Kenya",
      "iphone price Kenya",
    ],
    related: ["phones", "samsung", "tecno", "laptops"],
  },
  {
    slug: "samsung",
    query: "Samsung",
    label: "Samsung phones",
    pluralLabel: "Samsung phones",
    category: "Phones and electronics",
    intro:
      "Find Samsung phones for sale in Kenya, compare local seller listings and message directly for price, condition and pickup details.",
    buyerTips: [
      "Check model, storage, RAM, battery, screen and network status.",
      "Ask for receipt, warranty and original accessories if available.",
      "Inspect before payment and compare similar listings.",
    ],
    sellerTips: [
      "Mention Samsung model, storage, RAM, condition and location.",
      "Add clear photos of screen, back and accessories.",
      "Include price, warranty status and negotiability.",
    ],
    keywords: [
      "samsung phones for sale",
      "samsung for sale in Kenya",
      "used samsung phones Kenya",
      "samsung phone price Kenya",
    ],
    related: ["phones", "iphone", "tecno", "tvs"],
  },
  {
    slug: "tecno",
    query: "Tecno",
    label: "Tecno phones",
    pluralLabel: "Tecno phones",
    category: "Phones and electronics",
    intro:
      "Search Tecno phones for sale in Kenya from local sellers. Compare condition, model, storage, price and location on Shopi.",
    buyerTips: [
      "Check model, storage, RAM, battery and screen condition.",
      "Ask about warranty, receipt and accessories.",
      "Meet safely and inspect before paying.",
    ],
    sellerTips: [
      "Mention Tecno model, storage, condition and location.",
      "Show clear photos of the device and accessories.",
      "Add price and negotiability.",
    ],
    keywords: [
      "tecno phones for sale",
      "tecno phones Kenya",
      "used tecno phones Kenya",
      "tecno price Kenya",
    ],
    related: ["phones", "samsung", "iphone", "laptops"],
  },
  {
    slug: "laptops",
    query: "laptops",
    label: "Laptops",
    pluralLabel: "laptops",
    category: "Phones and electronics",
    intro:
      "Find laptops for sale in Kenya from local sellers. Compare brand, processor, RAM, storage, condition, price and location on Shopi.",
    buyerTips: [
      "Check processor, RAM, storage, battery health, charger and keyboard.",
      "Ask about warranty, receipt and repair history.",
      "Test before payment where possible.",
    ],
    sellerTips: [
      "Mention brand, model, CPU, RAM, storage, condition and location.",
      "Add photos of the screen, keyboard, ports and charger.",
      "State price, warranty and negotiability.",
    ],
    keywords: [
      "laptops for sale",
      "laptops for sale in Kenya",
      "used laptops Kenya",
      "laptop price Kenya",
    ],
    related: ["phones", "iphone", "samsung", "tvs"],
  },
  {
    slug: "tvs",
    query: "TV",
    label: "TVs",
    pluralLabel: "TVs",
    category: "Phones and electronics",
    intro:
      "Browse TVs for sale in Kenya, compare local listings and message sellers directly about screen size, brand, condition and price.",
    buyerTips: [
      "Check brand, screen size, smart TV features, ports and condition.",
      "Ask whether remote, wall mount and receipt are included.",
      "Test display and sound before payment.",
    ],
    sellerTips: [
      "Mention brand, inches, smart features, condition and location.",
      "Upload clear photos or video showing the TV working.",
      "Include price and included accessories.",
    ],
    keywords: [
      "tv for sale",
      "tvs for sale in Kenya",
      "smart tv Kenya",
      "used tv Kenya",
    ],
    related: ["laptops", "phones", "samsung", "furniture"],
  },
  {
    slug: "body-lotion",
    query: "body lotion",
    label: "Body lotion",
    pluralLabel: "body lotions",
    category: "Beauty and cosmetics",
    intro:
      "Find body lotion for sale in Kenya from beauty sellers on Shopi. Compare brands, size, price, location and seller details.",
    buyerTips: [
      "Check brand, size, skin type, expiry date and packaging.",
      "Ask whether the product is sealed and original.",
      "Compare prices and pickup or delivery options with the seller.",
    ],
    sellerTips: [
      "Mention brand, size, skin type, condition and location.",
      "Upload clear photos of the front, back label and seal.",
      "Add price, stock quantity and delivery or pickup details.",
    ],
    keywords: [
      "body lotion for sale",
      "body lotion Kenya",
      "body lotion for sale in Kenya",
      "skincare Kenya",
    ],
    related: ["body-oils", "skincare", "wigs", "phones"],
  },
  {
    slug: "body-oils",
    query: "body oils",
    label: "Body oils",
    pluralLabel: "body oils",
    category: "Beauty and cosmetics",
    intro:
      "Search body oils for sale in Kenya from local beauty sellers. Compare price, ingredients, size, brand and seller location.",
    buyerTips: [
      "Check ingredients, size, scent, skin type and expiry date.",
      "Ask whether the oil is sealed, handmade or branded.",
      "Confirm pickup or delivery directly with the seller.",
    ],
    sellerTips: [
      "Mention oil type, size, scent, ingredients and location.",
      "Show clear photos of packaging, label and product texture if possible.",
      "Add price, stock and delivery details.",
    ],
    keywords: [
      "body oils for sale",
      "body oils Kenya",
      "skin care oils Kenya",
      "beauty products Kenya",
    ],
    related: ["body-lotion", "skincare", "wigs", "furniture"],
  },
  {
    slug: "skincare",
    query: "skincare",
    label: "Skincare",
    pluralLabel: "skincare products",
    category: "Beauty and cosmetics",
    intro:
      "Browse skincare products for sale in Kenya, from creams and lotions to oils and cleansers. Message beauty sellers directly on Shopi.",
    buyerTips: [
      "Check brand, skin type, expiry date, size and ingredients.",
      "Ask if the product is sealed and suitable for your skin concerns.",
      "Compare seller location, price and delivery options.",
    ],
    sellerTips: [
      "Mention product type, brand, size, skin type and expiry date.",
      "Upload clear label and packaging photos.",
      "State price, stock and pickup or delivery details.",
    ],
    keywords: [
      "skincare products Kenya",
      "skincare for sale Kenya",
      "beauty products Kenya",
      "cosmetics Kenya",
    ],
    related: ["body-lotion", "body-oils", "wigs", "phones"],
  },
  {
    slug: "wigs",
    query: "wigs",
    label: "Wigs",
    pluralLabel: "wigs",
    category: "Beauty and fashion",
    intro:
      "Find wigs for sale in Kenya from local sellers. Compare style, length, material, condition, price and location on Shopi.",
    buyerTips: [
      "Check length, material, density, lace type and condition.",
      "Ask for real photos or video before buying.",
      "Confirm pickup, delivery and return expectations with the seller.",
    ],
    sellerTips: [
      "Mention length, material, lace type, color, condition and location.",
      "Upload real photos or video in natural lighting.",
      "State price and whether styling is included.",
    ],
    keywords: [
      "wigs for sale",
      "wigs for sale in Kenya",
      "human hair wigs Kenya",
      "beauty products Kenya",
    ],
    related: ["skincare", "body-lotion", "body-oils", "furniture"],
  },
  {
    slug: "furniture",
    query: "furniture",
    label: "Furniture",
    pluralLabel: "furniture",
    category: "Home and living",
    intro:
      "Find furniture for sale in Kenya, including sofas, beds, tables, shelves and home items from sellers you can message directly.",
    buyerTips: [
      "Check dimensions, material, condition, transport needs and location.",
      "Ask for more photos if the item is used.",
      "Agree on pickup or delivery directly with the seller.",
    ],
    sellerTips: [
      "Mention dimensions, material, condition, price and location.",
      "Upload clear photos from multiple angles.",
      "Say whether delivery is available or buyer collects.",
    ],
    keywords: [
      "furniture for sale",
      "furniture for sale in Kenya",
      "used furniture Kenya",
      "home items Kenya",
    ],
    related: ["sofas", "beds", "tvs", "houses-for-rent"],
  },
  {
    slug: "sofas",
    query: "sofa",
    label: "Sofas",
    pluralLabel: "sofas",
    category: "Home and living",
    intro:
      "Browse sofas for sale in Kenya from local sellers. Compare size, fabric, condition, price and pickup or delivery details.",
    buyerTips: [
      "Check size, fabric, cushion condition and dimensions.",
      "Ask for photos in daylight and confirm transport needs.",
      "Agree pickup or delivery before payment.",
    ],
    sellerTips: [
      "Mention sofa size, material, condition, price and location.",
      "Upload photos from front, side and close-up areas.",
      "State whether transport or delivery is available.",
    ],
    keywords: [
      "sofas for sale",
      "sofas for sale in Kenya",
      "used sofas Kenya",
      "furniture Kenya",
    ],
    related: ["furniture", "beds", "tvs", "houses-for-rent"],
  },
  {
    slug: "beds",
    query: "beds",
    label: "Beds",
    pluralLabel: "beds",
    category: "Home and living",
    intro:
      "Search beds for sale in Kenya, compare size, material, condition, price and seller location, then message directly on Shopi.",
    buyerTips: [
      "Check bed size, material, condition and whether mattress is included.",
      "Ask for dimensions and disassembly or transport needs.",
      "Inspect used beds before payment where possible.",
    ],
    sellerTips: [
      "Mention bed size, material, condition, price and location.",
      "Show clear photos of frame, headboard and any included mattress.",
      "State pickup or delivery options.",
    ],
    keywords: [
      "beds for sale",
      "beds for sale in Kenya",
      "used beds Kenya",
      "bed frames Kenya",
    ],
    related: ["furniture", "sofas", "houses-for-rent", "tvs"],
  },
  {
    slug: "farm-produce",
    query: "farm produce",
    label: "Farm produce",
    pluralLabel: "farm produce",
    category: "Agriculture",
    intro:
      "Find farm produce for sale in Kenya from local farmers and sellers. Compare quantity, price, location and pickup or delivery details.",
    buyerTips: [
      "Check quantity, grade, freshness, packaging and location.",
      "Ask about bulk price, availability and transport.",
      "Confirm pickup or delivery before payment.",
    ],
    sellerTips: [
      "Mention produce type, quantity, grade, harvest date and location.",
      "Upload clear photos of the actual produce.",
      "State price per unit and delivery or pickup details.",
    ],
    keywords: [
      "farm produce for sale",
      "farm produce Kenya",
      "agricultural products Kenya",
      "fresh produce Kenya",
    ],
    related: ["livestock", "land", "plots", "probox"],
  },
  {
    slug: "livestock",
    query: "livestock",
    label: "Livestock",
    pluralLabel: "livestock",
    category: "Agriculture",
    intro:
      "Browse livestock for sale in Kenya, including animals from local sellers. Compare price, location, age, breed and condition.",
    buyerTips: [
      "Check breed, age, health, vaccination status and location.",
      "Ask for current photos or video before visiting.",
      "Inspect the animal and agree transport directly with the seller.",
    ],
    sellerTips: [
      "Mention animal type, breed, age, health status, price and location.",
      "Upload clear photos or video of the actual animal.",
      "State viewing times and transport arrangements.",
    ],
    keywords: [
      "livestock for sale",
      "livestock for sale in Kenya",
      "cows for sale Kenya",
      "goats for sale Kenya",
    ],
    related: ["farm-produce", "land", "plots", "probox"],
  },
] as const satisfies SearchIntentPage[];

export const topSearchIntentPages = searchIntentPages.slice(0, 12);

export function getSearchIntentPage(slug: string) {
  return searchIntentPages.find((page) => page.slug === slug) ?? null;
}

export function searchIntentPath(slug: string) {
  return `/for-sale/${slug}` as const;
}
