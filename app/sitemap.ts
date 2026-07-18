import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { blogPosts } from "@/lib/blog";
import { locales } from "@/i18n/config";

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
const LISTING_SITEMAP_MAX = 300;

type SitemapListing = { id: string; createdAt?: string | null };

async function fetchRecentListings(): Promise<SitemapListing[]> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return [];

  const listings: SitemapListing[] = [];
  let after: string | null = null;

  try {
    while (listings.length < LISTING_SITEMAP_MAX) {
      const res: Response = await fetch(`${api}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query SitemapListings($limit: Int, $after: String) {
              discoveryFeed(sort: NEWEST, limit: $limit, after: $after) {
                items { id createdAt }
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

      listings.push(...page.items.filter((i) => i?.id));
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
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/careers", changeFrequency: "monthly", priority: 0.5 },
    { path: "/feed", changeFrequency: "always", priority: 0.9 },
    { path: "/explore", changeFrequency: "hourly", priority: 0.8 },
    { path: "/search", changeFrequency: "hourly", priority: 0.8 },
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

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: langs("en", `/blog/${post.slug}`),
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.75,
    alternates: alternates(`/blog/${post.slug}`),
  }));

  const listings = await fetchRecentListings();
  const listingEntries: MetadataRoute.Sitemap = listings.map((item) => ({
    url: langs("en", `/content/${item.id}`),
    lastModified: item.createdAt ? new Date(item.createdAt) : now,
    changeFrequency: "daily",
    priority: 0.65,
    alternates: alternates(`/content/${item.id}`),
  }));

  return [...staticEntries, ...blogEntries, ...listingEntries];
}
