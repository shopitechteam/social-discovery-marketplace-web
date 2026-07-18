import { siteConfig } from "@/config/site";
import { breadcrumbSchema, jsonLd } from "@/lib/structured-data";

/**
 * BreadcrumbList JSON-LD for locale-prefixed pages. Renders Home plus the
 * given trail (paths are relative to the locale root, e.g. "/blog"). Google
 * uses this to show breadcrumb paths in results and to understand site
 * hierarchy — one input into sitelinks for brand queries.
 */
export function BreadcrumbJsonLd({
  lang,
  trail,
}: {
  lang: string;
  trail: { name: string; path: string }[];
}) {
  const items = [
    { name: "Home", url: `${siteConfig.url}/${lang}` },
    ...trail.map((t) => ({
      name: t.name,
      url: `${siteConfig.url}/${lang}${t.path}`,
    })),
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema(items)) }}
    />
  );
}
