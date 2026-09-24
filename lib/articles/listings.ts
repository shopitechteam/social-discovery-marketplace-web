import type { ListingSpec } from "./types.ts";

/**
 * Pure helpers for the live listings an article shows: which fetched listings
 * belong on the page, and what their asking prices add up to. Fetching lives
 * in features/blog/queries/articleListings.ts; nothing here does I/O.
 */

export type ArticleListing = {
  id: string;
  slug?: string | null;
  title?: string | null;
  createdAt?: string | null;
  price?: { amount: number; currency: string; negotiable?: boolean } | null;
  location?: { placeName?: string | null; county?: string | null } | null;
  media?:
    | {
        sortOrder?: number | null;
        imageUrl?: string | null;
        thumbnailUrl?: string | null;
        muxMeta?: { thumbnailUrl?: string | null } | null;
        r2Variants?: { url?: string | null; variant?: string | null }[] | null;
      }[]
    | null;
};

/**
 * Fewest priced listings a price range is shown for. Below this the page
 * shows the listings themselves and says there are too few for a range: two
 * asking prices are two data points, not "the price in Kenya".
 */
export const MIN_PRICE_SAMPLE = 3;

/** From this many, the range drops the cheapest and dearest tenth. */
const TRIM_FROM = 10;

const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, " ");

/**
 * Keep the listings that are actually about the article's subject.
 *
 * Search matches captions, specs and hashtags as well as titles, so a query
 * for "vitz" also finds a headlight "fits Vitz and Passo". Title rules keep
 * the page to the thing itself; the spec's price floor (applied by the API)
 * catches whatever the title rules miss.
 */
export function filterListings(
  items: ArticleListing[],
  spec: ListingSpec,
): ArticleListing[] {
  const includes = (spec.titleIncludes ?? []).map(normalize);
  const excludes = (spec.titleExcludes ?? []).map(normalize);
  const seen = new Set<string>();

  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    const title = normalize(item.title ?? "");
    if (includes.length && !includes.some((word) => title.includes(word))) {
      return false;
    }
    if (excludes.some((word) => title.includes(word))) return false;
    return true;
  });
}

export type PriceSummary = {
  /** Priced listings the summary is based on. */
  count: number;
  low: number;
  high: number;
  median: number;
  /** True when `low`/`high` exclude the cheapest and dearest tenth. */
  trimmed: boolean;
  currency: string;
};

/** Asking-price summary, or null when there are too few priced listings. */
export function summarizePrices(
  listings: ArticleListing[],
): PriceSummary | null {
  const priced = listings.filter(
    (listing) => listing.price && listing.price.amount > 0,
  );
  if (priced.length < MIN_PRICE_SAMPLE) return null;

  const amounts = priced
    .map((listing) => listing.price!.amount)
    .sort((a, b) => a - b);
  // Nearest-rank percentile: always an asking price someone actually set.
  const at = (p: number) =>
    amounts[Math.min(amounts.length - 1, Math.max(0, Math.ceil(p * amounts.length) - 1))];
  const trimmed = amounts.length >= TRIM_FROM;
  const middle = Math.floor(amounts.length / 2);

  return {
    count: amounts.length,
    low: trimmed ? at(0.1) : amounts[0],
    high: trimmed ? at(0.9) : amounts[amounts.length - 1],
    median:
      amounts.length % 2
        ? amounts[middle]
        : Math.round((amounts[middle - 1] + amounts[middle]) / 2),
    trimmed,
    currency: priced[0].price!.currency || "KES",
  };
}

/** "KES 820,000" — listing prices are shown as the data states them. */
export function formatPrice(amount: number, currency = "KES"): string {
  return `${currency} ${Math.round(amount).toLocaleString("en-KE")}`;
}
