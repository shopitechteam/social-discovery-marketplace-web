/**
 * "{Competitor} alternative" landing pages.
 *
 * People who type "jiji alternative" or "sites like pigiame" are comparing, not
 * browsing — the generic /marketplace-alternatives-kenya hub can't rank for
 * each named query, so each gets its own page from this data.
 *
 * Rules for everything written about a competitor, because a wrong claim is a
 * legal problem and a credibility problem at once:
 * - Only what the competitor says about itself on its own site, with the page
 *   linked in `sources` and the date it was checked. No prices (they change),
 *   no claims about safety, audience size or quality.
 * - Every comparative point is a fact about Shopi, checkable on Shopi.
 * - Say plainly when the competitor is the better fit. It is true, it builds
 *   trust, and answer engines quote balanced sources over sales copy.
 * Names are used descriptively only; no logos. Re-check `checkedOn` sources
 * when refreshing the page (see README "Blog content: SEO checks").
 */

export type CompetitorAlternative = {
  slug: "jiji-alternative-kenya" | "pigiame-alternative-kenya";
  competitor: string;
  competitorUrl: string;
  checkedOn: string;
  title: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string;
  about: { heading: string; body: string };
  sources: { label: string; url: string }[];
  differencesHeading: string;
  differences: { title: string; body: string }[];
  whenCompetitorFits: { heading: string; points: string[]; closing: string };
  steps: { heading: string; items: { title: string; body: string }[] };
  faq: { q: string; a: string }[];
  keywords: string[];
};

const JIJI: CompetitorAlternative = {
  slug: "jiji-alternative-kenya",
  competitor: "Jiji",
  competitorUrl: "https://jiji.co.ke",
  checkedOn: "2026-09-15",
  title: "Jiji Alternative in Kenya: Sell Free, No Commission",
  metaDescription:
    "Looking for a Jiji alternative in Kenya? Post free on Shopi from one photo, reach buyers near you and chat directly. No commission, no listing fees.",
  eyebrow: "Jiji alternative",
  h1: "A Jiji alternative for selling in Kenya",
  intro:
    "If you want somewhere to sell besides Jiji, Shopi is a free Kenyan marketplace built around a local discovery feed. You post from one photo, buyers near you come across the listing while they scroll, and they message you directly. Shopi takes no commission and charges no listing fees — and you can keep your Jiji ads running at the same time.",
  about: {
    heading: "What Jiji is, in brief",
    body: "Jiji is one of Kenya's best-known online classifieds sites, with categories from vehicles and property to phones, fashion and jobs. Buyers mostly find ads by searching or browsing those categories. Alongside regular ads, Jiji sells optional Premium Services to promote them: TOP packages that place an ad at the top of search results for 7 or 30 days, Boost packages that show ads more often for one to twelve months, and a pay-per-click Pro Sales tool that comes with Boost.",
  },
  sources: [
    { label: "Jiji — types of Premium Services", url: "https://jiji.co.ke/faq/48" },
    { label: "Jiji — categories (homepage)", url: "https://jiji.co.ke/" },
  ],
  differencesHeading: "What's different about selling on Shopi",
  differences: [
    {
      title: "Found in a feed, not only in search",
      body: "Shopi shows listings in a feed ranked by what's near each buyer and what they're interested in, so a new post can reach people who weren't searching for that exact item. Buyers who know what they want can still search.",
    },
    {
      title: "A full listing from one photo",
      body: "Upload a photo and Shopi Agent drafts the title, description, category and specifications. You check and edit everything before it goes live, so posting a lot of stock doesn't mean filling in the same form again and again.",
    },
    {
      title: "No commission and no listing fees",
      body: "Posting is free and Shopi has no paid tier today. Shopi never takes payment or holds money, so there is nothing to deduct: the price you agree with the buyer is what you receive.",
    },
    {
      title: "Video-first, with TikTok built in",
      body: "Post a short video of the item, or import the TikTok videos you've already made instead of filming again. A clip that shows the item working answers the questions photos leave open.",
    },
    {
      title: "Local first, across all 47 counties",
      body: "Nearby listings surface first, from the buyer's neighbourhood outward, so the people who see your post are the ones who can realistically come and collect.",
    },
  ],
  whenCompetitorFits: {
    heading: "When Jiji may suit you better",
    points: [
      "You're hiring or looking for work — Jiji lists jobs and CVs; Shopi doesn't.",
      "You want to pay for placement at the top of search results — Jiji sells that through its Premium Services.",
      "You're selling in a category where buyers habitually start on Jiji and search for an exact model.",
    ],
    closing:
      "You don't have to choose. Many sellers keep their Jiji ads and post the same items on Shopi to reach buyers who browse rather than search.",
  },
  steps: {
    heading: "How to put your Jiji items on Shopi",
    items: [
      {
        title: "Reuse the photos you already have",
        body: "Upload the photos from your Jiji ad, or a short video. Shopi Agent drafts the listing from them.",
      },
      {
        title: "Check the price and details",
        body: "Confirm the price in KES, mark it negotiable if it is, and set your location so nearby buyers see it first.",
      },
      {
        title: "Keep both live, and update both",
        body: "Publish, then remove the item from both sites when it sells so no buyer messages about something that's gone.",
      },
    ],
  },
  faq: [
    {
      q: "What is the best alternative to Jiji in Kenya?",
      a: "It depends on what you sell. For everyday items — phones, electronics, furniture, fashion, beauty, property and cars — Shopi is a free alternative: listing is free, there is no commission, buyers near you find your post in a local feed, and they message you directly. For jobs and CVs, Shopi isn't an option.",
    },
    {
      q: "Is there a free app like Jiji in Kenya?",
      a: "Shopi is free to browse and free to post on, with no commission and no listing fees. It works in any phone or computer browser at shopi.co.ke; there is no app-store download yet.",
    },
    {
      q: "Can I sell on Jiji and Shopi at the same time?",
      a: "Yes. Nothing stops you listing the same item on both. When it sells, remove it from both so buyers aren't disappointed.",
    },
    {
      q: "Does Shopi charge to promote listings, like Jiji's Premium Services?",
      a: "No. Shopi has no paid tier today: posting is free, there are no listing fees and no commission on the sale.",
    },
    {
      q: "Can I sell my car on Shopi instead of Jiji?",
      a: "Yes. List your car free with photos or a walkaround video, the year, mileage, price and location, and buyers message you directly — no broker and no commission. Shopi's Sell a car in Kenya guide covers pricing and the NTSA ownership transfer.",
    },
    {
      q: "Is Shopi part of Jiji?",
      a: "No. Shopi is an independent Kenyan marketplace, founded in Nairobi in 2025, and is not affiliated with Jiji.",
    },
  ],
  keywords: [
    "Jiji alternative",
    "Jiji alternative Kenya",
    "sites like Jiji",
    "apps like Jiji Kenya",
    "free marketplace Kenya",
    "sell online Kenya",
  ],
};

const PIGIAME: CompetitorAlternative = {
  slug: "pigiame-alternative-kenya",
  competitor: "PigiaMe",
  competitorUrl: "https://www.pigiame.co.ke",
  checkedOn: "2026-09-15",
  title: "PigiaMe Alternative in Kenya: Sell Free on Shopi",
  metaDescription:
    "Looking for a PigiaMe alternative? Shopi is a free Kenyan marketplace: post from a photo or video, get found nearby, chat directly. No commission.",
  eyebrow: "PigiaMe alternative",
  h1: "A PigiaMe alternative for buying and selling in Kenya",
  intro:
    "Shopi is a free Kenyan marketplace you can use instead of, or as well as, PigiaMe. Post an item from one photo or a short video, get found by buyers near you in a local feed, and chat with them directly. There's no commission and no listing fee.",
  about: {
    heading: "What PigiaMe is, in brief",
    body: "PigiaMe is a long-running Kenyan classifieds site where you can post a free ad in categories including vehicles, electronics, property rentals and sales, jobs, and fashion and beauty. It offers paid Premium Ads, including a GOLD upgrade for extra visibility, and highlights verified sellers who have passed its checks.",
  },
  sources: [{ label: "PigiaMe — homepage", url: "https://www.pigiame.co.ke/" }],
  differencesHeading: "What's different about Shopi",
  differences: [
    {
      title: "A feed built for discovery",
      body: "Instead of starting from a category tree, buyers on Shopi scroll a feed ranked by what's nearby and what they're interested in — and come across listings they weren't searching for. Search is there for exact items.",
    },
    {
      title: "Photos and video, not just a form",
      body: "Posts lead with photos or a short video that shows the item working. Already sell on TikTok? Import those videos into Shopi listings instead of filming again.",
    },
    {
      title: "Shopi Agent writes the listing",
      body: "Upload a photo and Shopi Agent drafts the title, description, category and specifications for you to review before publishing.",
    },
    {
      title: "No commission, no listing fees, no paid tier",
      body: "Posting is free and Shopi takes nothing from the sale. It never processes payments or holds money, so buyer and seller agree the price, payment and pickup directly.",
    },
  ],
  whenCompetitorFits: {
    heading: "When PigiaMe may suit you better",
    points: [
      "You're posting or looking for jobs — PigiaMe has a jobs category; Shopi doesn't.",
      "You want a paid upgrade for extra visibility — PigiaMe offers GOLD Premium Ads.",
      "You prefer a classic classifieds layout where buyers browse by category first.",
    ],
    closing:
      "Plenty of sellers use both: a PigiaMe ad for buyers who search categories, and a Shopi post for buyers who discover things while scrolling.",
  },
  steps: {
    heading: "How to list your PigiaMe items on Shopi",
    items: [
      {
        title: "Start from your existing photos",
        body: "Upload the photos you used on PigiaMe, or record a quick video, and let Shopi Agent draft the words.",
      },
      {
        title: "Set price, category and location",
        body: "Enter the price in KES, say whether it's negotiable, and set your town so buyers nearby see it first.",
      },
      {
        title: "Publish and reply in chat",
        body: "Buyers message you inside Shopi. When the item sells, take it down everywhere you listed it.",
      },
    ],
  },
  faq: [
    {
      q: "What is a good alternative to PigiaMe in Kenya?",
      a: "Shopi is a free alternative for selling everyday items, cars and property in Kenya. Listing is free with no commission, buyers near you find posts in a local discovery feed, Shopi Agent writes listings from a photo, and buyers message sellers directly. For job listings, Shopi isn't an option.",
    },
    {
      q: "Is it free to sell on Shopi?",
      a: "Yes. Posting is free, there are no listing fees and no commission, and there is no paid tier today. The full price you agree with the buyer is yours.",
    },
    {
      q: "Can I post on PigiaMe and Shopi at the same time?",
      a: "Yes. You can list the same item on both to reach more buyers. Remove it from both once it sells.",
    },
    {
      q: "Does Shopi have verified sellers?",
      a: "Some sellers carry a verified badge on Shopi, but Shopi does not verify every seller or listing. Inspect the item and confirm the details in chat before you pay.",
    },
    {
      q: "Can I sell land or property on Shopi?",
      a: "Yes. Post land, plots, houses for sale or rentals with photos, price and location, and interested buyers message you directly.",
    },
    {
      q: "Is Shopi connected to PigiaMe?",
      a: "No. Shopi is an independent Kenyan marketplace, founded in Nairobi in 2025, and is not affiliated with PigiaMe.",
    },
  ],
  keywords: [
    "PigiaMe alternative",
    "PigiaMe alternative Kenya",
    "sites like PigiaMe",
    "free classifieds Kenya",
    "free marketplace Kenya",
    "sell online Kenya",
  ],
};

export const competitorAlternatives: CompetitorAlternative[] = [JIJI, PIGIAME];

export function getCompetitorAlternative(slug: CompetitorAlternative["slug"]) {
  return competitorAlternatives.find((page) => page.slug === slug)!;
}
