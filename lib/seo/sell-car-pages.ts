/**
 * Seller-intent landing pages for cars.
 *
 * Every car page on Shopi so far targets *buyer* intent — "Toyota Premio for
 * sale in Kenya" (see search-intent-pages.ts). That misses the other half of a
 * marketplace: the person who owns a Premio and types "sell my Premio" or "how
 * much is my Premio worth". Those queries have lower volume but far higher
 * commercial value to us, because a seller creates supply, and supply is what
 * makes the buyer pages worth ranking in the first place.
 *
 * Content here is deliberately model-specific — who buys this car in Kenya,
 * what they ask, what moves the price. Generic pages spun per keyword are
 * doorway pages and get filtered; these have to earn the ranking.
 *
 * Deliberately no price figures: a stale or wrong number destroys trust with
 * the exact person we want to convert, and we have live listings that answer
 * the question better than a hardcoded range could.
 */

export type SellCarPage = {
  slug: string;
  /** Model as a seller would type it, e.g. "Toyota Premio" */
  model: string;
  /** Matching buyer page slug in search-intent-pages.ts, for cross-linking. */
  buyerSlug: string;
  /** One-line summary used in meta description and hero copy. */
  intro: string;
  /** Who actually buys this car in Kenya — the seller's audience. */
  buyerProfile: string;
  /** What drives this specific model's resale price. */
  priceFactors: string[];
  /** Questions buyers of this model ask first; answer them in the listing. */
  buyerQuestions: string[];
  /** Model-specific listing advice. */
  listingTips: string[];
  keywords: string[];
  related: string[];
};

export const sellCarPages = [
  {
    slug: "toyota-premio",
    model: "Toyota Premio",
    buyerSlug: "toyota-premio",
    intro:
      "The Premio is one of Kenya's most-searched saloons, so a well-presented listing rarely sits long. Price it against comparable years and grades, and be ready to answer questions about grade and import history.",
    buyerProfile:
      "Premio buyers are usually family or first-executive-car buyers who want comfort and low running costs without moving to an SUV. Many are upgrading from a Fielder or an Axio, so they compare your car directly against those, and they care more about condition and paperwork than about mileage alone.",
    priceFactors: [
      "Grade and trim — F, X and G-package cars sit at different prices even in the same year.",
      "Year and import date, since a later import of the same year often holds value better.",
      "Genuine mileage, backed by service records rather than the odometer alone.",
      "Accident and repair history, especially anything structural.",
      "Logbook status — a clean, in-your-name logbook removes the buyer's biggest worry.",
    ],
    buyerQuestions: [
      "Is the logbook ready and in your name?",
      "What grade is it, and is it a local unit or a recent import?",
      "Has it been in any accident, and is there a service history?",
      "Is the price negotiable, and can I bring my own mechanic?",
    ],
    listingTips: [
      "Put the year and grade in the title — \"Toyota Premio 2015 G-Package\" outranks a bare \"Toyota Premio\".",
      "Photograph the dashboard with the engine on so mileage and warning lights are both visible.",
      "Show the interior honestly, including seat wear — hiding it just wastes viewings.",
    ],
    keywords: [
      "sell my Toyota Premio",
      "sell Toyota Premio Kenya",
      "sell my Premio in Nairobi",
      "Toyota Premio resale value Kenya",
      "where to sell Toyota Premio",
    ],
    related: ["toyota-harrier", "mazda-atenza", "probox"],
  },
  {
    slug: "toyota-harrier",
    model: "Toyota Harrier",
    buyerSlug: "toyota-harrier",
    intro:
      "Harrier buyers in Kenya shop on condition and specification more than on price alone, so a detailed listing with strong photos does most of the negotiating for you.",
    buyerProfile:
      "Harrier buyers are typically stepping up into a premium SUV and are cross-shopping against the RAV4, the Vanguard and the Lexus RX. They tend to be less price-sensitive and more specification-sensitive — sunroof, leather, powered tailgate and 4WD all materially change what someone will pay.",
    priceFactors: [
      "Specification — sunroof, leather, JBL sound, powered tailgate and 360 camera each move the price.",
      "2WD versus 4WD, which matters to buyers outside the main towns.",
      "Engine option and fuel economy, since Harrier running costs are a common objection.",
      "Body and paint condition, because respray work is easy for a buyer to spot on this shape.",
      "Import year versus registration year, which buyers of this model check closely.",
    ],
    buyerQuestions: [
      "What is the exact specification — sunroof, leather, 4WD?",
      "What is the fuel consumption in town?",
      "Any respray, and has the body ever been welded?",
      "Is the logbook clean and ready for transfer?",
    ],
    listingTips: [
      "List the specification explicitly — buyers filter on it and will skip a vague listing.",
      "Shoot the exterior in daylight from all four corners; Harrier buyers judge on body condition.",
      "Include a short walkaround video — it converts far better than photos alone on this model.",
    ],
    keywords: [
      "sell my Toyota Harrier",
      "sell Toyota Harrier Kenya",
      "Toyota Harrier resale value Kenya",
      "where to sell Harrier Nairobi",
    ],
    related: ["toyota-premio", "mazda-atenza", "probox"],
  },
  {
    slug: "mazda-atenza",
    model: "Mazda Atenza",
    buyerSlug: "mazda-atenza",
    intro:
      "The Atenza attracts a smaller, more informed group of buyers than the Toyota saloons, so reaching the right audience matters more than pricing aggressively.",
    buyerProfile:
      "Atenza buyers are usually enthusiasts who have specifically chosen it over a Premio or an Allion for the styling, the diesel option and the drive. They know the model well, they will ask technical questions, and they are wary of the running costs — so honesty about service history sells this car faster than a low price does.",
    priceFactors: [
      "Petrol versus diesel — the diesel commands more but buyers will probe its service history hard.",
      "Service records, particularly for the diesel's injectors and DPF.",
      "Trim level and whether it is the saloon or the wagon.",
      "Tyre and suspension condition, which enthusiasts check first.",
      "Parts availability history — evidence you maintained it properly reassures the buyer.",
    ],
    buyerQuestions: [
      "Is it the petrol or the diesel, and what has been serviced recently?",
      "Any injector, DPF or turbo work done?",
      "Has it been well maintained, and do you have receipts?",
      "Why are you selling it?",
    ],
    listingTips: [
      "Say petrol or diesel in the title — it is the first thing an Atenza buyer filters on.",
      "Photograph your service receipts; on this model, documentation is the selling point.",
      "Write a longer description than you would for a Toyota — this buyer reads it all.",
    ],
    keywords: [
      "sell my Mazda Atenza",
      "sell Mazda Atenza Kenya",
      "Mazda Atenza resale value Kenya",
      "where to sell Mazda Atenza",
    ],
    related: ["toyota-premio", "toyota-harrier", "probox"],
  },
  {
    slug: "probox",
    model: "Toyota Probox",
    buyerSlug: "probox",
    intro:
      "The Probox sells as a working asset, not a lifestyle car. Buyers care about uptime and load capacity, so lead with what it can carry and how reliably it runs.",
    buyerProfile:
      "Probox buyers are overwhelmingly business buyers — traders, delivery operators, farm suppliers and matatu-adjacent operators — buying a tool that has to earn from day one. They will not pay for cosmetics, but they will pay for a car that starts every morning, and they buy fast when the condition is right.",
    priceFactors: [
      "Engine condition and how recently the timing chain and suspension were done.",
      "Whether it is the 1.3 or 1.5, and 2WD versus 4WD.",
      "Body condition where it matters — floor, boot and suspension mounts, not the paint.",
      "Working history, since a car used lightly commands more than an ex-delivery unit.",
      "Logbook and any outstanding financing, which business buyers check before viewing.",
    ],
    buyerQuestions: [
      "What has it been used for, and how hard?",
      "When were the suspension and timing chain last done?",
      "Is it the 1.5, and is it 2WD or 4WD?",
      "Can it be inspected by my mechanic before I pay?",
    ],
    listingTips: [
      "Lead with mechanical condition, not looks — this buyer is not paying for shine.",
      "Photograph the load area and the suspension; that is what gets inspected.",
      "State clearly what the car was used for. Business buyers respect a straight answer.",
    ],
    keywords: [
      "sell my Probox",
      "sell Toyota Probox Kenya",
      "Probox resale value Kenya",
      "where to sell Probox Nairobi",
    ],
    related: ["toyota-premio", "toyota-harrier", "mazda-atenza"],
  },
] as const satisfies SellCarPage[];

export function getSellCarPage(slug: string) {
  return sellCarPages.find((page) => page.slug === slug) ?? null;
}

export function sellCarPath(slug: string) {
  return `/sell/${slug}` as const;
}
