import type { Metadata } from "next";
import { ContentDetail } from "@/features/feed/components/ContentDetail";
import { query } from "@/lib/apollo/ApolloClient";
import { GetContentDocument } from "@/types/__generated__/graphql";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";
import { siteConfig } from "@/config/site";
import { permanentRedirect } from "next/navigation";
import {
  productSchema,
  breadcrumbSchema,
  jsonLd,
} from "@/lib/structured-data";
import { contentPath } from "@/lib/content-url";

type Props = { params: Promise<{ lang: string; id: string }> };

// Listings change (price edits, sells out) — revalidate hourly so shared links
// and crawled metadata stay reasonably fresh without re-rendering every hit.
export const revalidate = 3600;

// ── Server-side fetch + SEO field derivation ────────────────────────────────

type Post = ContentCardFieldsFragment & { slug?: string | null };

async function getPost(id: string): Promise<Post | null> {
  try {
    const { data } = await query({
      query: GetContentDocument,
      variables: { id },
    });
    return (data?.content as Post | undefined) ?? null;
  } catch {
    return null;
  }
}

function sellerName(post: Post): string | null {
  const p = post.creator?.profile;
  const full = [p?.firstName, p?.lastName].filter(Boolean).join(" ").trim();
  return full || post.creator?.username || null;
}

function locationName(post: Post): string | null {
  const loc = post.location;
  return (
    [loc?.placeName, loc?.county].filter(Boolean).join(", ").trim() || null
  );
}

/** Best available image URL for sharing (large variant → imageUrl → mux thumb). */
function primaryImage(post: Post): string | null {
  const m = [...(post.media ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  )[0];
  if (!m) return null;
  return (
    m.r2Variants?.find((v) => v.variant === "large")?.url ??
    m.r2Variants?.[0]?.url ??
    m.imageUrl ??
    m.muxMeta?.thumbnailUrl ??
    m.thumbnailUrl ??
    null
  );
}

function priceLabel(post: Post): string | null {
  const price = post.price;
  if (!price) return null;
  if (price.amount === 0) return "Free";
  return `${price.currency} ${price.amount.toLocaleString()}`;
}

/** A concise, human + engine-friendly description for the listing. */
function buildDescription(post: Post): string {
  const bits: string[] = [];
  const price = priceLabel(post);
  if (price) bits.push(price);
  const loc = locationName(post);
  if (loc) bits.push(loc);
  const lead = bits.length ? `${bits.join(" · ")}. ` : "";
  const body =
    post.caption?.trim() ||
    `${post.title} — available now on ${siteConfig.name}, Kenya's social marketplace. Message the seller directly.`;
  return `${lead}${body}`.slice(0, 300);
}

// ── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params;
  const post = await getPost(id);
  const canonical = post
    ? `${siteConfig.url}${contentPath(lang, post)}`
    : `${siteConfig.url}/${lang}/content/${id}`;

  if (!post) {
    return {
      title: "Post",
      description: siteConfig.description,
      alternates: { canonical },
      robots: { index: false, follow: true },
    };
  }

  const price = priceLabel(post);
  const loc = locationName(post);
  const titleParts = [post.title, price, loc].filter(Boolean);
  const title = titleParts.join(" · ");
  const shareTitle = `${title} | ${siteConfig.name}`;
  const description = buildDescription(post);
  // Per-listing OG image (rendered by the sibling opengraph-image route).
  const ogImage = `${canonical}/opengraph-image`;

  return {
    title,
    description,
    keywords: [
      post.title,
      ...(post.hashtags ?? []),
      loc,
      "buy",
      "sell",
      siteConfig.name,
      "Kenya marketplace",
    ].filter(Boolean) as string[],
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: siteConfig.name,
      title: shareTitle,
      description,
      locale: "en_KE",
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      title: shareTitle,
      description,
      images: [ogImage],
    },
  };
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function ContentDetailPage({ params }: Props) {
  const { lang, id } = await params;
  const post = await getPost(id);
  const canonical = post
    ? `${siteConfig.url}${contentPath(lang, post)}`
    : `${siteConfig.url}/${lang}/content/${id}`;
  const canonicalPath = post ? contentPath(lang, post) : null;

  if (canonicalPath && canonicalPath !== `/${lang}/content/${id}`) {
    permanentRedirect(canonicalPath);
  }

  return (
    <>
      {post && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(
              productSchema({
                id,
                url: canonical,
                title: post.title,
                description: post.caption,
                images: [primaryImage(post)].filter(Boolean) as string[],
                price: post.price?.amount,
                currency: post.price?.currency,
                negotiable: post.price?.negotiable,
                sellerName: sellerName(post),
                locationName: locationName(post),
                category: post.hashtags?.[0] ?? null,
                createdAt: post.createdAt
                  ? new Date(post.createdAt as string).toISOString()
                  : null,
              }),
              breadcrumbSchema([
                { name: "Home", url: `${siteConfig.url}/${lang}` },
                { name: "Explore", url: `${siteConfig.url}/${lang}/explore` },
                { name: post.title, url: canonical },
              ]),
            ),
          }}
        />
      )}
      <ContentDetail id={id} lang={lang} desktopMode="page" />
    </>
  );
}
