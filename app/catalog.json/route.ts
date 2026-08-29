import { fetchMarketplaceCatalog } from "@/lib/seo/marketplace-catalog";

export async function GET(): Promise<Response> {
  const catalog = await fetchMarketplaceCatalog();

  return Response.json(catalog, {
    headers: {
      "Cache-Control":
        "public, max-age=300, s-maxage=900, stale-while-revalidate=86400",
      "X-Robots-Tag": "index, follow, max-snippet:-1",
    },
  });
}
