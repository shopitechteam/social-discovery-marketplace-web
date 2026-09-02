import { fetchMarketplaceCatalog } from "@/lib/seo/marketplace-catalog";

function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export async function GET(): Promise<Response> {
  const catalog = await fetchMarketplaceCatalog();
  const lines = [
    "# Shopi Current Marketplace Catalog",
    "",
    `> Generated: ${catalog.generatedAt}`,
    "> This snapshot contains recently created or edited public listings. Confirm availability and final price with the seller.",
    "> Shopi does not process payments, hold money, provide escrow, or arrange delivery.",
    "",
    `[Machine-readable JSON](${catalog.canonicalUrl})`,
    "",
  ];

  if (catalog.items.length === 0) {
    lines.push(
      "No listings are present in this snapshot. Browse https://www.shopi.co.ke/en/explore for the live marketplace.",
      "",
    );
  }

  for (const item of catalog.items) {
    lines.push(`## [${oneLine(item.title)}](${item.url})`, "");
    if (item.price) {
      lines.push(
        `- Price: ${item.price.amount === 0 ? "Free" : `${item.price.currency} ${item.price.amount.toLocaleString("en-KE")}`}${item.price.negotiable ? " (negotiable)" : ""}`,
      );
    }
    if (item.location) lines.push(`- Location: ${oneLine(item.location)}`);
    if (item.category) lines.push(`- Category: ${oneLine(item.category)}`);
    if (item.seller) {
      lines.push(
        `- Seller: ${oneLine(item.seller.name)}${item.seller.verified ? " (verified on Shopi)" : ""}${item.seller.profileUrl ? ` — ${item.seller.profileUrl}` : ""}`,
      );
    }
    if (item.updatedAt) lines.push(`- Updated: ${item.updatedAt}`);
    const specs = Object.entries(item.specifications);
    if (specs.length > 0) {
      lines.push(
        `- Specifications: ${specs.map(([key, value]) => `${oneLine(key)}: ${oneLine(value)}`).join("; ")}`,
      );
    }
    if (item.description) lines.push("", oneLine(item.description));
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control":
        "public, max-age=300, s-maxage=900, stale-while-revalidate=86400",
      "X-Robots-Tag": "index, follow, max-snippet:-1",
    },
  });
}
