import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { locales, isValidLocale } from "@/i18n/config";
import { DiscoverPage } from "@/features/discover/components/DiscoverPage";

type Props = { params: Promise<{ lang: string }> };

// Self-referencing canonical per locale + hreflang alternates (the bare
// /explore path is a redirect, not a page — see feed/page.tsx).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isValidLocale(lang) ? lang : "en";
  const path = siteConfig.routes.explore.path;

  return {
    title: siteConfig.routes.explore.title,
    description: siteConfig.routes.explore.description,
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

export default async function ExplorePage({ params }: Props) {
  const { lang } = await params;
  return <DiscoverPage lang={lang} />;
}
