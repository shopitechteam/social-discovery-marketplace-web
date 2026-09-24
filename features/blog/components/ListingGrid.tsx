import Link from "next/link";
import { ListingPhotoCard } from "@/components/listings/ListingPhotoCard";
import { resolveLink, type Article } from "@/lib/articles";
import { withCoversFirst } from "@/features/social-proof/queries/socialProofSellers";
import type { ArticleListingsResult } from "../queries/articleListings";
import { localeHref } from "./InlineText";

const DEFAULT_SHOW = 6;

/**
 * Live listing cards for an article. Photos first, then the rest, capped at
 * the spec's `show`. An empty result becomes an invitation to post, because a
 * reader who found nothing is exactly the person who might have one to sell.
 */
export function ListingGrid({
  article,
  result,
  lang,
}: {
  article: Article;
  result: ArticleListingsResult;
  lang: string;
}) {
  const spec = article.listings;
  if (!spec) return null;
  const cta = resolveLink(article.cta.to);
  const listings = result.ok
    ? withCoversFirst(result.listings).slice(0, spec.show ?? DEFAULT_SHOW)
    : [];

  if (listings.length === 0) {
    return (
      <div className="my-6 rounded-2xl border border-dashed border-border p-5">
        <p className="text-[0.95rem] leading-relaxed text-muted">
          {result.ok
            ? `No ${spec.label} listings on Shopi right now.`
            : "Listings couldn't be loaded just now."}{" "}
          Have one to sell? Posting is free and buyers message you directly.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/${lang}/upload`}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white no-underline"
          >
            Sell for Free
          </Link>
          {cta && !cta.external && (
            <Link
              href={localeHref(lang, cta.href)}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-bold text-foreground no-underline"
            >
              {article.cta.label}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="my-6">
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
        {listings.map((listing) => (
          <li key={listing.id}>
            <ListingPhotoCard
              listing={listing}
              lang={lang}
              locale="en-KE"
              sizes="(max-width: 640px) 46vw, 220px"
              showCta
            />
          </li>
        ))}
      </ul>
      {cta && !cta.external && (
        <Link
          href={localeHref(lang, cta.href)}
          className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary no-underline hover:underline"
        >
          {article.cta.label} →
        </Link>
      )}
    </div>
  );
}
