import { ImageResponse } from "next/og";
import { query } from "@/lib/apollo/ApolloClient";
import { GetContentDocument } from "@/types/__generated__/graphql";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";
import { siteConfig } from "@/config/site";

// Node runtime so we can reuse the Apollo `query` helper to fetch the listing.
export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "Shopi listing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Post = ContentCardFieldsFragment;

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
  const p = post.price;
  if (!p) return null;
  if (p.amount === 0) return "Free";
  return `${p.currency} ${p.amount.toLocaleString()}`;
}

function locationName(post: Post): string | null {
  const loc = post.location;
  return [loc?.placeName, loc?.county].filter(Boolean).join(", ").trim() || null;
}

export default async function ContentOgImage({
  params,
}: {
  params: { lang: string; id: string };
}) {
  let post: Post | null = null;
  try {
    const { data } = await query({
      query: GetContentDocument,
      variables: { id: params.id },
    });
    post = (data?.content as Post | undefined) ?? null;
  } catch {
    post = null;
  }

  const image = post ? primaryImage(post) : null;
  const title = post?.title ?? "Shopi";
  const price = post ? priceLabel(post) : null;
  const loc = post ? locationName(post) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0a0a0e",
          fontFamily: "sans-serif",
        }}
      >
        {/* Left: listing image */}
        <div
          style={{
            width: 560,
            height: "100%",
            display: "flex",
            background: "#15151c",
            position: "relative",
          }}
        >
          {image ? (
            <img
              src={image}
              alt=""
              width={560}
              height={630}
              style={{ width: 560, height: 630, objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 120,
              }}
            >
              🛍️
            </div>
          )}
        </div>

        {/* Right: title + price + meta */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 56px",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: siteConfig.themeColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                fontWeight: 800,
              }}
            >
              S
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
              shopi
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {price && (
              <div
                style={{
                  fontSize: 58,
                  fontWeight: 800,
                  color: "#ec4899",
                  letterSpacing: -1,
                }}
              >
                {price}
              </div>
            )}
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: -1,
                display: "flex",
              }}
            >
              {title.length > 90 ? `${title.slice(0, 90)}…` : title}
            </div>
            {loc && (
              <div style={{ fontSize: 30, color: "#a1a1b3", display: "flex" }}>
                📍 {loc}
              </div>
            )}
          </div>

          <div style={{ fontSize: 26, color: "#8b8b9e", display: "flex" }}>
            Message the seller directly on Shopi
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
