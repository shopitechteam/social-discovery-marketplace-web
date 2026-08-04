import Link from "next/link";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

type SummaryPost = ContentCardFieldsFragment & {
  slug?: string | null;
  category?: { name?: string | null; slug?: string | null } | null;
};

/**
 * The server-rendered form of a listing.
 *
 * ContentDetail's two real layouts are both gated on `useIsDesktop()`, which
 * returns `null` until the browser can measure the viewport. That means the
 * server — and the client's own hydration render — produce neither branch, so
 * the listing body existed only after JavaScript ran. Crawlers that don't
 * execute JS (every AI/answer engine, and Bing to a large extent) saw an empty
 * page, and Google saw Product JSON-LD with no matching on-page content.
 *
 * This renders in exactly that `isDesktop === null` window. Server and first
 * client render agree, so hydration is unaffected, and the interactive layout
 * replaces it the moment the viewport is measured. It also gives the page a
 * real LCP element instead of a blank frame.
 */
export function ListingSeoSummary({
  post,
  lang,
}: {
  post: SummaryPost;
  lang: string;
}) {
  const price =
    post.price && post.price.amount > 0
      ? `${post.price.currency} ${post.price.amount.toLocaleString()}`
      : post.price
        ? "Free"
        : null;

  const location =
    [post.location?.placeName, post.location?.county]
      .filter(Boolean)
      .join(", ")
      .trim() || null;

  const media = [...(post.media ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  )[0];
  const image =
    media?.r2Variants?.find((v) => v.variant === "large")?.url ??
    media?.r2Variants?.[0]?.url ??
    media?.imageUrl ??
    media?.muxMeta?.thumbnailUrl ??
    media?.thumbnailUrl ??
    null;

  const seller =
    [post.creator?.profile?.firstName, post.creator?.profile?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    post.creator?.username ||
    null;

  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element -- transient
        // pre-hydration node; next/image would queue an optimizer request for
        // markup that is replaced on the first client measurement.
        <img
          src={image}
          alt={post.title}
          width={1200}
          height={1200}
          className="w-full rounded-2xl object-cover"
        />
      )}

      <h1 className="font-display text-xl font-bold leading-snug text-default">
        {post.title}
      </h1>

      {(price || location) && (
        <p className="text-base font-semibold text-default">
          {[price, location].filter(Boolean).join(" · ")}
        </p>
      )}

      {post.caption && (
        <p className="text-base leading-normal text-muted">{post.caption}</p>
      )}

      {seller && (
        <p className="text-sm text-muted">
          Sold by{" "}
          {post.creator?.username ? (
            <Link
              href={`/${lang}/profile/${post.creator.username}`}
              className="font-semibold text-primary"
            >
              {seller}
            </Link>
          ) : (
            <span className="font-semibold">{seller}</span>
          )}
        </p>
      )}

      {/* Crawlable routes out of the listing — without these the detail page is
          a dead end for a non-JS crawler. */}
      <nav className="flex flex-wrap gap-3 text-sm text-primary">
        <Link href={`/${lang}/explore`}>Explore listings</Link>
        <Link href={`/${lang}/feed`}>Browse the feed</Link>
        <Link href={`/${lang}/search`}>Search Shopi</Link>
      </nav>
    </article>
  );
}
