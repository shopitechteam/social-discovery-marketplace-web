import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { locales, isValidLocale } from "@/i18n/config";

// The app serves every page under /[lang]; a canonical without the locale
// would point at a redirect. Self-referencing canonical + hreflang alternates
// keep engines from treating /en/feed and /sw/feed as duplicates.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isValidLocale(lang) ? lang : "en";
  const path = siteConfig.routes.feed.path;

  return {
    title: siteConfig.routes.feed.title,
    description: siteConfig.routes.feed.description,
    alternates: {
      canonical: `${siteConfig.url}/${safeLang}${path}`,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, `${siteConfig.url}/${l}${path}`]),
        ),
        "x-default": `${siteConfig.url}/en${path}`,
      },
    },
  };
}

// The Home feed itself is mounted once in MainShell so it persists across
// bottom-nav navigation (Home ⇄ Explore …) without remounting/refetching. This
// route only exists for its URL + metadata; MainShell renders the live feed and
// suppresses this page's body on /feed to avoid a double mount.
export default function FeedPageRoute() {
  return null;
}
