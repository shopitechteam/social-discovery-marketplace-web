import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { siteConfig } from "@/config/site";
import { locales, isValidLocale } from "@/i18n/config";
import { PreloadQuery } from "@/lib/apollo/ApolloClient";
import { ForYouFeedDocument } from "@/types/__generated__/graphql";
import { FeedPage } from "@/features/feed/components/FeedPage";
import { FeedSkeleton } from "@/features/feed/components/FeedSkeleton";
import { AuthenticatedFeedPage } from "@/features/feed/components/AuthenticatedFeedPage";
import { FEED_PAGE_SIZE } from "@/features/feed/constants";

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
  const canonical = `${siteConfig.url}/${safeLang}${path}`;
  const title = `${siteConfig.routes.feed.title} | ${siteConfig.name}`;
  const description = siteConfig.routes.feed.description;

  return {
    title: siteConfig.routes.feed.title,
    description,
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, `${siteConfig.url}/${l}${path}`]),
        ),
        "x-default": `${siteConfig.url}/en${path}`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      locale: safeLang === "sw" ? "sw_KE" : "en_KE",
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      title,
      description,
      images: [siteConfig.ogImage],
    },
  };
}

export default async function FeedPageRoute({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const [{ lang }, cookieStore] = await Promise.all([params, cookies()]);
  const feed = (
    <Suspense fallback={<FeedSkeleton />}>
      <FeedPage lang={lang} />
    </Suspense>
  );

  // The server cannot safely preload a personalized query because auth tokens
  // live in the client store. The existing hint cookie lets authenticated users
  // keep their private cache path, while anonymous users (including search and
  // performance crawlers) receive the first feed response during SSR.
  if (cookieStore.has("shopi-auth-hint")) {
    return <AuthenticatedFeedPage lang={lang} />;
  }

  return (
    <PreloadQuery
      query={ForYouFeedDocument}
      variables={{ limit: FEED_PAGE_SIZE }}
    >
      {feed}
    </PreloadQuery>
  );
}
