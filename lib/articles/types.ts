/**
 * The blog's content model.
 *
 * Articles are typed data in lib/articles/posts/, one file per article, and
 * render through a single template (app/[lang]/blog/[slug]). Adding an article
 * is adding a file and one line to posts/index.ts — no new route or component.
 *
 * Everything in lib/articles/ is loaded directly by Node in the SEO audit
 * (scripts/seo-content-audit.mjs), so these modules import each other with
 * relative `.ts` paths, use `import type` for types, and never import React,
 * Next or the "@/" alias.
 */

export type ArticleStatus = "draft" | "published";

/**
 * What the searcher wants. It sets the template's defaults (a price guide
 * leads with live prices, a buying guide with the checklist) and which audit
 * rules apply.
 */
export type ArticleIntent =
  | "price-guide" // "Toyota Vitz price in Kenya"
  | "buying-guide" // "how to check a used car before buying"
  | "location-guide" // "bedsitters for rent in Nairobi"
  | "budget-guide" // "phones under KSh 20,000"
  | "category-guide" // "used cars in Kenya"
  | "comparison" // "Vitz vs Demio"
  | "selling-guide" // how to sell something
  | "insight"; // Shopi news, trends and product education

export type Author = {
  id: string;
  name: string;
  role: string;
  /** Organization for team bylines. Person only for a real, named writer. */
  kind: "Organization" | "Person";
  initials: string;
  url?: string;
};

export type ArticleCategory = {
  slug: string;
  /** Short name for chips and breadcrumbs: "Cars". */
  name: string;
  /** The category hub's H1 and <title>. */
  title: string;
  /** Meta description for the hub, 155 characters or fewer. */
  description: string;
  /** One or two sentences under the hub's H1. */
  intro: string;
  /** Where a reader of this category goes next on the marketplace. */
  marketplace: LinkTarget[];
  /** Position on the blog landing page. */
  order: number;
};

/**
 * An internal link, described by what it points at rather than by URL.
 *
 * links.ts resolves each kind against the data that owns the route (the
 * /for-sale pages, counties, the category hubs, the article registry), so the
 * label always matches the destination and a renamed or deleted page fails
 * the audit instead of leaving a dead link in every article that used it.
 */
export type LinkTarget =
  | { kind: "forSale"; slug: string } // /for-sale/<slug>
  | { kind: "sellCar"; slug: string } // /sell/<slug>
  | { kind: "sellCarCity"; slug: string } // /sell-car-kenya/<slug>
  | { kind: "county"; slug: string } // /marketplace/<slug>
  | { kind: "hub"; path: string } // a category landing page, e.g. /phones-electronics-kenya
  | { kind: "article"; slug: string } // /blog/<slug>
  | { kind: "blogCategory"; slug: string } // /blog/category/<slug>
  | {
      // A live search. Query-scoped search pages are noindex, so this is for
      // readers ("phones under KSh 20,000 right now"), not for ranking.
      kind: "search";
      label: string;
      query?: string;
      minPrice?: number;
      maxPrice?: number;
      description?: string;
    }
  | { kind: "page"; path: string; label: string; description?: string }
  | { kind: "external"; url: string; label: string; description?: string };

/**
 * One discoveryFeed call. Text search requires every word to match, so an
 * article usually needs a few sources ("bedsitter", "bedsit", "studio").
 * `subcategory` matches the listing's level-2 category name exactly
 * (case-insensitive), e.g. "Cars" or "Phones".
 */
export type ListingSource = { query?: string; subcategory?: string };

/**
 * Which live listings an article shows, and which of them count towards its
 * price summary. Results from every source are merged and de-duplicated, then
 * filtered by title so a "Toyota Vitz" page never shows seat covers.
 */
export type ListingSpec = {
  /** Noun for counts and headings: "Toyota Vitz" → "7 Toyota Vitz listings". */
  label: string;
  sources: ListingSource[];
  /** County as the API stores it (lib/counties.ts `name`), e.g. "Nairobi". */
  county?: string;
  /**
   * Relevance floor, passed to the API. It keeps parts and accessories out of
   * a price summary and is never shown to readers as a price.
   */
  minPrice?: number;
  /** For budget pages the ceiling is the topic ("under KSh 20,000"). */
  maxPrice?: number;
  /** Keep a listing only if its title contains at least one of these. */
  titleIncludes?: string[];
  /** Drop a listing whose title contains any of these. */
  titleExcludes?: string[];
  /** Rentals are asked per month. */
  priceUnit?: "month";
  /** Listing cards to show. Defaults to 6. */
  show?: number;
};

/**
 * Prices a person checked, from a named source.
 *
 * This is the only way a hardcoded price can enter an article: the type makes
 * the source and the check date required, the page prints both, and the audit
 * warns once the check is more than 90 days old. Never fill it with estimates.
 */
export type VerifiedPriceTable = {
  caption: string;
  /** ISO date the prices were checked. */
  checkedAt: string;
  /** Who or where, e.g. "Asking prices at five Nairobi dealers". */
  source: string;
  rows: { item: string; price: string; note?: string }[];
};

/**
 * Article body blocks. Text fields accept two inline marks:
 * `[label](/path)` for an internal link (the locale is added when rendered;
 * the audit checks the path exists) and `**bold**`.
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "checklist"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][]; caption?: string }
  | { type: "callout"; tone: "tip" | "warning"; title?: string; text: string }
  /** Live asking prices from the article's ListingSpec. */
  | { type: "livePrices" }
  /** Live listing cards from the article's ListingSpec. */
  | { type: "listings" }
  | { type: "verifiedPrices"; table: VerifiedPriceTable }
  | { type: "links"; title: string; links: LinkTarget[] };

export type ArticleSection = {
  /** Anchor id: "price" → #price. Unique within the article. */
  id: string;
  /** The section's H2. */
  heading: string;
  blocks: Block[];
};

export type FeaturedImage = {
  /** Path under /public, e.g. "/assets/blog/toyota-vitz.jpg". */
  src: string;
  /** What the photo shows — not the keyword. */
  alt: string;
  width: number;
  height: number;
  credit?: { name: string; url: string };
};

export type Article = {
  slug: string;
  status: ArticleStatus;
  intent: ArticleIntent;
  /** The H1. */
  title: string;
  /** <title> when it should differ from the H1. The layout appends "| Shopi". */
  seoTitle?: string;
  /** Meta description, 155 characters or fewer. */
  seoDescription: string;
  /**
   * The lead paragraph and the card teaser. It answers the query in the first
   * sentence — a reader searching a price should not have to scroll for it.
   */
  excerpt: string;
  /** The query this article is written for. The audit checks it appears in the title, lead, body and description. */
  primaryKeyword: string;
  keywords?: string[];
  /** ArticleCategory slug. */
  category: string;
  /** Lowercase, hyphenated. Used to pick related articles; there are no tag pages. */
  tags: string[];
  /** Author id. */
  author: string;
  /** ISO date. */
  publishedAt: string;
  /** ISO date of the last substantive edit — never bump it for a typo. */
  updatedAt?: string;
  /** Absolute URL, only when the canonical copy lives elsewhere. */
  canonicalUrl?: string;
  featuredImage?: FeaturedImage;
  listings?: ListingSpec;
  sections: ArticleSection[];
  faq?: { q: string; a: string }[];
  /** "Browse on Shopi": the marketplace pages for this topic. */
  marketplaceLinks: LinkTarget[];
  /** Hand-picked related articles. Topped up automatically by tags. */
  related?: string[];
  /** The main call to action, e.g. "See Toyota Vitz listings". */
  cta: { label: string; to: LinkTarget; text?: string };
  /** Legacy posts carry a fixed reading time; everything else is computed. */
  readTime?: string;
};
