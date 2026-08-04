import { Suspense } from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { locales, isValidLocale } from "@/i18n/config";
import { DiscoverPage } from "@/features/discover/components/DiscoverPage";
import { publicPageMetadata } from "@/lib/metadata";
import { BrowseHub } from "@/components/seo/BrowseHub";

type Props = { params: Promise<{ lang: string }> };

// Self-referencing canonical per locale + hreflang alternates (the bare
// /explore path is a redirect, not a page — see feed/page.tsx).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isValidLocale(lang) ? lang : "en";
  const path = siteConfig.routes.explore.path;
  const base = publicPageMetadata({
    lang: safeLang,
    path,
    title: siteConfig.routes.explore.title,
    description: siteConfig.routes.explore.description,
  });

  return {
    ...base,
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
  // Suspense boundary: DiscoverPage reads useSearchParams() (?category= deep
  // links), which requires one during prerender. The fallback is what the
  // server actually emits, so it carries the crawlable hub rather than null.
  return (
    <Suspense
      fallback={
        <BrowseHub
          lang={lang}
          heading="Explore what people are selling near you"
          intro="Browse local listings across Kenya — phones and electronics, cars, land and property, beauty, furniture and farm produce. Find something you like and message the seller directly. No checkout, no commission."
        />
      }
    >
      <DiscoverPage lang={lang} />
    </Suspense>
  );
}
