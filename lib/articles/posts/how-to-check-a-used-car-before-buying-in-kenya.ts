import type { Article } from "../types.ts";

export const article: Article = {
  slug: "how-to-check-a-used-car-before-buying-in-kenya",
  status: "published",
  intent: "buying-guide",
  title: "How to Check a Used Car Before Buying in Kenya",
  seoDescription:
    "How to check a used car before buying in Kenya: the logbook and NTSA search, a mechanic's inspection, the test drive and paying safely.",
  excerpt:
    "To check a used car before buying in Kenya, go in this order: the paperwork, then the car, then the deal. Confirm the logbook with an NTSA search, have a mechanic inspect the car, take a proper test drive, and only pay when the transfer is ready.",
  primaryKeyword: "check a used car before buying",
  keywords: [
    "used car checklist Kenya",
    "buying a used car in Kenya",
    "NTSA vehicle search",
    "logbook check Kenya",
    "car inspection before buying",
  ],
  category: "cars",
  tags: ["used-cars", "buying-tips", "ntsa", "logbook"],
  author: "shopi-team",
  publishedAt: "2026-09-24",
  featuredImage: {
    src: "/assets/blog/used-car-check.jpg",
    alt: "A mechanic checking a car's engine with the bonnet open",
    width: 1200,
    height: 675,
    credit: { name: "Kate Ibragimova / Unsplash", url: "https://unsplash.com/photos/bEGTsOCnHro" },
  },
  listings: {
    label: "used car",
    sources: [{ subcategory: "Cars" }, { query: "car for sale" }],
    minPrice: 150_000,
    titleExcludes: ["for hire", "parts", "tyre", "rim"],
    show: 6,
  },
  sections: [
    {
      id: "paperwork",
      heading: "1. Check the paperwork first",
      blocks: [
        {
          type: "p",
          text: "When you check a used car before buying, start with the paperwork: it decides whether the car can legally become yours. A perfect car with a problem logbook is not a bargain.",
        },
        {
          type: "checklist",
          items: [
            "The logbook is in the seller's name, and the name matches their national ID.",
            "An official vehicle search with NTSA shows the same owner and no bank or car-finance company on the logbook.",
            "The chassis number on the car matches the logbook. Ask the seller to show you where it's stamped.",
            "The number plates match the registration number on the logbook.",
            "If the car is still on a loan, the seller clears it and the lender is removed from the logbook before you pay.",
          ],
        },
        {
          type: "callout",
          tone: "warning",
          text: "If the seller can't show the logbook, or the name doesn't match, stop there. No discount is worth a car that can't be transferred to you.",
        },
      ],
    },
    {
      id: "inspection",
      heading: "2. Inspect the car",
      blocks: [
        {
          type: "p",
          text: "Look at the car in daylight and on dry ground. Ask the seller not to start the engine before you arrive, so you hear it start cold.",
        },
        {
          type: "list",
          items: [
            "**Body.** Paint that doesn't match between panels, uneven gaps and paint on the rubber seals all point to accident repairs.",
            "**Underneath.** Look for rust, oil leaks and a damaged exhaust.",
            "**Engine.** Listen for knocking. Blue smoke usually means the engine is burning oil; thick white smoke that doesn't clear can mean a coolant leak.",
            "**Dashboard.** Warning lights should come on when you turn the key, then go off once the engine runs. Compare the mileage with the service records.",
            "**Tyres.** Uneven wear can point to alignment or suspension problems.",
            "**Inside.** Test the AC, windows, lights, wipers and radio. A damp smell can mean water damage.",
          ],
        },
        {
          type: "p",
          text: "Bring a mechanic you trust, or pay for an independent inspection. It costs far less than the repairs it can save you from.",
        },
      ],
    },
    {
      id: "test-drive",
      heading: "3. Take a proper test drive",
      blocks: [
        {
          type: "checklist",
          items: [
            "Drive for at least 15 minutes, including a rough stretch of road and some bumps.",
            "The car brakes in a straight line without pulling or vibrating.",
            "The steering stays straight when you let it run on a flat road.",
            "The gearbox changes smoothly: no jerks, slipping or whining on an automatic, and a normal clutch on a manual.",
            "There is no knocking over bumps, which would point to worn suspension.",
            "The temperature gauge stays in the middle.",
          ],
        },
      ],
    },
    {
      id: "paying",
      heading: "4. Agree the price and pay safely",
      blocks: [
        {
          type: "list",
          items: [
            "Compare the asking price with similar listings: the same model, year and engine size. [Used cars on Shopi](/for-sale/cars) is a quick place to compare.",
            "Use what the inspection found to negotiate.",
            "Sign a sale agreement with both your ID details, the car's registration and chassis numbers, and the price.",
            "For a sum this size, pay by bank transfer, ideally at the bank so the payment can be confirmed on the spot.",
            "Complete the NTSA transfer: the seller starts it online and you accept it. Until it completes, the car is still legally the seller's.",
          ],
        },
        {
          type: "callout",
          tone: "warning",
          text: "Never send a deposit to hold a car you haven't seen. Fake listings often ask for exactly that.",
        },
      ],
    },
    {
      id: "red-flags",
      heading: "Red flags",
      blocks: [
        {
          type: "list",
          items: [
            "The price is far below similar cars.",
            "The seller is in a hurry, or wants a deposit before you've seen the car.",
            "The logbook is \"being processed\", or is in someone else's name.",
            "The seller won't let a mechanic inspect it.",
            "You can only see the car at night or in the rain, which hides paint problems.",
            "You're dealing with a middleman because \"the owner is upcountry\", and nobody can show you the logbook.",
          ],
        },
      ],
    },
    {
      id: "used-cars-on-shopi",
      heading: "Used cars on Shopi now",
      blocks: [
        { type: "listings" },
        {
          type: "p",
          text: "Checking a particular model? See the [Toyota Vitz price guide](/blog/toyota-vitz-price-in-kenya) for what moves Vitz prices.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Can I check who owns a car in Kenya?",
      a: "Yes. NTSA offers an official motor vehicle search for a small fee. It shows the registered owner and whether a bank or lender is on the logbook.",
    },
    {
      q: "How long should a test drive be?",
      a: "At least 15 minutes, with a rough stretch of road, some bumps and a bit of speed, so you can hear the suspension and feel the gearbox and brakes.",
    },
    {
      q: "Should I buy from a car yard or a private seller?",
      a: "A private owner can usually tell you the car's full history and is often cheaper, while a yard may offer some after-sale support. Either way, do the same paperwork checks and inspection.",
    },
    {
      q: "When should I pay for a used car?",
      a: "Only after the paperwork checks out, the car has been inspected and the NTSA transfer is ready. Never pay a deposit for a car you haven't seen.",
    },
  ],
  marketplaceLinks: [
    { kind: "forSale", slug: "cars" },
    { kind: "county", slug: "nairobi" },
    { kind: "forSale", slug: "toyota-vitz" },
    { kind: "forSale", slug: "probox" },
  ],
  related: [
    "toyota-vitz-price-in-kenya",
    "how-to-sell-your-car-in-kenya-without-a-broker",
  ],
  cta: {
    label: "Browse used cars",
    to: { kind: "forSale", slug: "cars" },
    text: "Found the right car? Message the seller directly and arrange a viewing.",
  },
};
