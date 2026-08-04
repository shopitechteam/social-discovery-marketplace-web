import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { blogPosts } from "@/lib/blog";
import { locales } from "@/i18n/config";
import { contentPath } from "@/lib/content-url";
import { COUNTIES } from "@/lib/counties";

/**
 * The app is served under /[lang]. Every public page exists per-locale, so each
 * sitemap entry lists its locale alternates (hreflang) to avoid duplicate-content
 * issues and help engines serve the right language.
 *
 * Listing pages (/content/[id]) are the highest-value SEO surface of the
 * marketplace, so the newest listings are pulled from the API at generation
 * time. The fetch is best-effort: if the API is unreachable the sitemap still
 * ships with the static + blog entries.
 */

// The API caps discoveryFeed's `limit` at 50, so page through with cursors.
const LISTING_SITEMAP_PAGE = 50;

// A single sitemap may hold 50,000 URLs, so the old 300 ceiling — not the
// format — was what capped indexable inventory. Listings are the marketplace's
// highest-value SEO surface and, being discovered mainly through JS-driven
// browse surfaces, the sitemap is how engines find most of them.
const LISTING_SITEMAP_MAX = 5000;

// …but each page is a sequential round trip, so bound the walk by wall clock
// too. Whatever has been collected when the budget runs out still ships; the
// next hourly revalidate picks up from a fresh NEWEST ordering.
const LISTING_FETCH_BUDGET_MS = 20_000;

type SitemapListing = {
  id: string;
  slug?: string | null;
  title?: string | null;
  createdAt?: string | null;
};

async function fetchRecentListings(): Promise<SitemapListing[]> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return [];

  const listings: SitemapListing[] = [];
  const seen = new Set<string>();
  const deadline = Date.now() + LISTING_FETCH_BUDGET_MS;
  let after: string | null = null;

  try {
    while (listings.length < LISTING_SITEMAP_MAX && Date.now() < deadline) {
      const res: Response = await fetch(`${api}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query SitemapListings($limit: Int, $after: String) {
              discoveryFeed(sort: NEWEST, limit: $limit, after: $after) {
                items { id slug title createdAt }
                pageInfo { hasNextPage endCursor }
              }
            }
          `,
          variables: { limit: LISTING_SITEMAP_PAGE, after },
        }),
        // Refresh the listing set hourly; the sitemap itself is cheap to rebuild.
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;

      const json = (await res.json()) as {
        data?: {
          discoveryFeed?: {
            items?: SitemapListing[];
            pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
          };
        };
      };
      const page = json.data?.discoveryFeed;
      if (!page?.items?.length) break;

      // A feed reordered mid-walk can repeat an item across cursor pages; a
      // sitemap listing the same URL twice is a validation warning.
      for (const item of page.items) {
        if (!item?.id || seen.has(item.id)) continue;
        seen.add(item.id);
        listings.push(item);
      }

      if (!page.pageInfo?.hasNextPage || !page.pageInfo.endCursor) break;
      after = page.pageInfo.endCursor;
    }
  } catch {
    // Best-effort: ship whatever pages made it.
  }

  return listings.slice(0, LISTING_SITEMAP_MAX);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { url } = siteConfig;

  const langs = (l: string, path: string) => `${url}/${l}${path}`;
  const alternates = (path: string) => ({
    languages: Object.fromEntries(locales.map((l) => [l, langs(l, path)])),
  });

  // path -> [changeFrequency, priority, lastModified?]
  const staticPages: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.85 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.8 },
    { path: "/shopi-agent", changeFrequency: "monthly", priority: 0.9 },
    {
      path: "/marketplace-alternatives-kenya",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/careers", changeFrequency: "monthly", priority: 0.5 },
    { path: "/feed", changeFrequency: "always", priority: 0.9 },
    { path: "/explore", changeFrequency: "hourly", priority: 0.8 },
    { path: "/search", changeFrequency: "hourly", priority: 0.8 },
    { path: "/sell-in-kenya", changeFrequency: "weekly", priority: 0.9 },
    { path: "/sell-car-kenya", changeFrequency: "weekly", priority: 0.9 },
    {
      path: "/property-for-sale-kenya",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      path: "/beauty-cosmetics-kenya",
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      path: "/phones-electronics-kenya",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
    { path: "/community-guidelines", changeFrequency: "yearly", priority: 0.3 },
    { path: "/prohibited-items", changeFrequency: "yearly", priority: 0.3 },
    { path: "/safety-centre", changeFrequency: "yearly", priority: 0.4 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: langs("en", p.path),
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
    alternates: alternates(p.path),
  }));

  const countyEntries: MetadataRoute.Sitemap = COUNTIES.map((county) => ({
    url: langs("en", `/marketplace/${county.slug}`),
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.85,
    alternates: alternates(`/marketplace/${county.slug}`),
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: langs("en", `/blog/${post.slug}`),
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.75,
    alternates: alternates(`/blog/${post.slug}`),
  }));

  const listings = await fetchRecentListings();
  const listingEntries: MetadataRoute.Sitemap = listings.map((item) => {
    const path = contentPath("en", item).replace(/^\/en/, "");
    return {
      url: langs("en", path),
      lastModified: item.createdAt ? new Date(item.createdAt) : now,
      changeFrequency: "daily",
      priority: 0.65,
      alternates: alternates(path),
    };
  });

  return [
    ...staticEntries,
    ...countyEntries,
    ...blogEntries,
    ...listingEntries,
  ];
}
