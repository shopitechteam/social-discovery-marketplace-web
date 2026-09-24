import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ImageIcon, MapPin } from "lucide-react";
import type { Dictionary } from "@/i18n/getDictionary";
import { siteConfig } from "@/config/site";
import { contentPath } from "@/lib/content-url";
import { shouldUnoptimize } from "@/lib/imageUtils";
import { jsonLd } from "@/lib/structured-data";
import {
  fetchSocialProofSellers,
  isUsableImageUrl,
  listingCover,
  withCoversFirst,
  type SocialProofSeller,
} from "@/features/social-proof/queries/socialProofSellers";
import {
  ListingPhotoCard,
  listingPlaceLabel,
} from "@/components/listings/ListingPhotoCard";
import { Pill } from "./Pill";
import { SellerAvatarImage } from "./SellerAvatarImage";
import { SocialProofTracker } from "./SocialProofTracker";

type Copy = Dictionary["socialProof"];

/**
 * Real sellers as social proof, chosen in the admin (Users → Social proof).
 *
 * The API returns an array, and the layout follows its length: nothing renders
 * for zero, one seller gets a full spotlight, two or more get a card grid.
 * Every number is live from the API — listing count and views are never typed
 * in — so the proof stays true as the seller's stock changes.
 *
 * SEO/AEO: it's server-rendered, so seller names, listing titles and prices
 * are crawlable text; each seller links to their /@handle profile and each
 * card to its listing; the one-line summary is written to be quotable; and the
 * JSON-LD ItemList points at the same `#profile` @id the profile page declares,
 * so engines join the homepage mention to the seller entity.
 */

/**
 * Visibility per listing position in the spotlight grid, keeping it to a
 * single full row: 2 items at 2 columns, 3 at 3, 4 at 4. Anything past the
 * row is hidden in grid mode; the phone strip still scrolls through all of
 * them (the API is asked for 8).
 */
const ONE_ROW: Record<number, string> = {
  0: "",
  1: "",
  2: "@sm:hidden @xl:block",
  3: "@sm:hidden @3xl:block",
};

/** Below these, a figure reads as weak proof rather than strong, so it's left out. */
const MIN_FOLLOWERS_SHOWN = 10;
const MIN_VIEWS_SHOWN = 100;

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");

function profileHref(lang: string, seller: SocialProofSeller) {
  return `/${lang}/@${seller.username}`;
}

/** "See all 12 listings" reads wrong for one listing, so that case says "Visit shop". */
function seeAllLabel(t: Copy, seller: SocialProofSeller, count: string) {
  return seller.listingCount === 1 ? t.visitShop : fill(t.seeAll, { count });
}

export async function SocialProofSection({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang: string;
}) {
  const sellers = await fetchSocialProofSellers(6, 8);
  if (sellers.length === 0) return null;

  const t = dict.socialProof;
  const locale = lang === "sw" ? "sw-KE" : "en-KE";
  const siteBase = `${siteConfig.url}/${lang}`;

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${siteBase}#featured-sellers`,
    name: "Featured sellers on Shopi",
    numberOfItems: sellers.length,
    itemListElement: sellers.map((seller, i) => {
      const url = `${siteBase}/@${seller.username}`;
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "ProfilePage",
          "@id": `${url}#profile`,
          url,
          name: `${seller.displayName} (@${seller.username}) on Shopi`,
        },
      };
    }),
  };

  return (
    <section
      id="social-proof"
      aria-labelledby="social-proof-heading"
      className="px-(--landing-page-x) py-14 md:py-20"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(itemList) }}
      />
      <div className="mx-auto max-w-(--landing-page-max)">
        {/* Headline only: the listings below are the proof. */}
        <div className="mb-8 max-w-3xl md:mb-10">
          <h2
            id="social-proof-heading"
            className="text-balance font-display text-[clamp(1.65rem,2.8vw,2.5rem)] font-bold leading-tight tracking-normal text-foreground"
          >
            {t.headline}
          </h2>
        </div>

        {/* Impressions and clicks per seller → admin Social proof page. */}
        <SocialProofTracker>
          {sellers.length === 1 ? (
            <SellerSpotlight seller={sellers[0]} lang={lang} locale={locale} t={t} />
          ) : (
            <ul className="grid list-none gap-5 p-0 md:grid-cols-2 xl:grid-cols-3">
              {sellers.map((seller) => (
                <li key={seller.id} className="flex">
                  <SellerCard seller={seller} lang={lang} locale={locale} t={t} />
                </li>
              ))}
            </ul>
          )}
        </SocialProofTracker>
      </div>
    </section>
  );
}

// ── One seller: spotlight ────────────────────────────────────────────────────

function SellerSpotlight({
  seller,
  lang,
  locale,
  t,
}: {
  seller: SocialProofSeller;
  lang: string;
  locale: string;
  t: Copy;
}) {
  const href = profileHref(lang, seller);
  const count = seller.listingCount.toLocaleString(locale);

  return (
    <article
      data-sp-seller={seller.id}
      className="overflow-hidden rounded-[1.4rem] border border-default bg-elevated shadow-sm"
    >
      {/* Side by side from md (tablets, narrow or zoomed desktop windows);
          stacked only on phones. */}
      <div className="grid md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]">
        {/* Seller */}
        <div className="flex flex-col border-b border-default p-6 md:border-r md:border-b-0 xl:p-8">
          <span className="mb-5 inline-flex w-fit items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-strong">
            {t.featured}
          </span>

          <div className="flex items-center gap-4">
            <SellerAvatar seller={seller} size={64} />
            <div className="min-w-0">
              <h3 className="font-display text-xl font-bold leading-tight text-default">
                <Link href={href} className="text-default no-underline hover:underline">
                  {seller.displayName}
                </Link>
              </h3>
              <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted">
                @{seller.username}
                {seller.isVerified && (
                  <BadgeCheck
                    size={16}
                    className="shrink-0 text-primary"
                    aria-label={t.verified}
                  />
                )}
              </p>
            </div>
          </div>

          {seller.headline && (
            <p className="mt-5 text-base font-semibold leading-snug text-default">
              {seller.headline}
            </p>
          )}

          <SellerPlace seller={seller} className="mt-3" />

          <SellerStats seller={seller} locale={locale} t={t} className="mt-6" />

          {/* Quotable one-liner for answer engines; visible, not hidden. */}
          <p className="mt-5 text-sm leading-normal text-muted">
            {fill(seller.listingCount === 1 ? t.summaryOne : t.summary, {
              name: seller.displayName,
              count,
            })}{" "}
            <SinceLabel seller={seller} locale={locale} t={t} />
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Pill href={href} className="bg-primary px-6 text-white hover:opacity-90">
              {t.visitShop}
            </Pill>
          </div>
        </div>

        {/* Listings */}
        {/* Centred beside the taller seller panel, so a single row of
            listings doesn't leave an empty band underneath it. */}
        <div className="@container min-w-0 p-4 md:flex md:flex-col md:justify-center md:p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 px-1">
            <p className="text-sm font-bold text-default">
              {fill(t.latestFrom, { name: seller.displayName })}
            </p>
            <Link
              href={href}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary no-underline hover:underline"
            >
              {seeAllLabel(t, seller, count)}
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
          {/* Columns follow the space this panel actually has (container
              queries), not the screen: beside the seller panel a 1280px
              screen has far less room than a stacked tablet. Swipeable strip
              when narrow; otherwise a single row of 2, 3 or 4 listings, with
              "See all" leading to the rest. */}
          <ul className="flex list-none snap-x snap-mandatory gap-3 overflow-x-auto p-0 pb-2 scrollbar-none @sm:grid @sm:grid-cols-2 @sm:overflow-visible @sm:pb-0 @xl:grid-cols-3 @3xl:grid-cols-4">
            {withCoversFirst(seller.listings).map((listing, index) => (
              <li
                key={listing.id}
                data-sp-content={listing.id}
                className={`w-[46%] shrink-0 snap-start @sm:w-auto ${ONE_ROW[index] ?? "@sm:hidden"}`}
              >
                <ListingPhotoCard listing={listing} lang={lang} locale={locale} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

// ── Two or more sellers: cards ───────────────────────────────────────────────

function SellerCard({
  seller,
  lang,
  locale,
  t,
}: {
  seller: SocialProofSeller;
  lang: string;
  locale: string;
  t: Copy;
}) {
  const href = profileHref(lang, seller);
  const count = seller.listingCount.toLocaleString(locale);
  const thumbs = withCoversFirst(seller.listings).slice(0, 3);

  return (
    <article
      data-sp-seller={seller.id}
      className="flex w-full flex-col rounded-[1.2rem] border border-default bg-elevated p-5 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <SellerAvatar seller={seller} size={48} />
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-bold leading-tight text-default">
            <Link href={href} className="text-default no-underline hover:underline">
              {seller.displayName}
            </Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted">
            @{seller.username}
            {seller.isVerified && (
              <BadgeCheck size={15} className="shrink-0 text-primary" aria-label={t.verified} />
            )}
          </p>
        </div>
      </div>

      {seller.headline && (
        <p className="mt-4 text-sm font-semibold leading-snug text-default">
          {seller.headline}
        </p>
      )}
      <SellerPlace seller={seller} className="mt-2" />
      <SellerStats seller={seller} locale={locale} t={t} className="mt-4" compact />

      {thumbs.length > 0 && (
        <ul className="mt-4 grid list-none grid-cols-3 gap-2 p-0">
          {thumbs.map((listing) => {
            const cover = listingCover(listing);
            return (
              <li key={listing.id} data-sp-content={listing.id}>
                <Link
                  href={contentPath(lang, listing)}
                  className="relative block aspect-square overflow-hidden rounded-xl border border-default bg-subtle"
                  aria-label={listing.title ?? undefined}
                >
                  {cover ? (
                    <Image
                      src={cover}
                      alt={listing.title ?? ""}
                      fill
                      sizes="(max-width: 768px) 30vw, 140px"
                      unoptimized={shouldUnoptimize(cover)}
                      className="object-cover"
                    />
                  ) : (
                    <ImageIcon size={18} className="absolute inset-0 m-auto text-muted" aria-hidden />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
        <span className="text-xs text-muted">
          <SinceLabel seller={seller} locale={locale} t={t} />
        </span>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-bold text-primary no-underline hover:underline"
        >
          {seeAllLabel(t, seller, count)}
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </article>
  );
}

// ── Shared pieces ────────────────────────────────────────────────────────────

function SellerAvatar({ seller, size }: { seller: SocialProofSeller; size: number }) {
  const initials = seller.displayName
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const avatar = isUsableImageUrl(seller.avatar) ? seller.avatar : null;

  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-elevated bg-primary font-display font-bold text-white shadow-sm"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {avatar ? (
        <SellerAvatarImage
          src={avatar}
          alt={seller.displayName}
          size={size}
          initials={initials}
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </span>
  );
}

function SellerPlace({
  seller,
  className = "",
}: {
  seller: SocialProofSeller;
  className?: string;
}) {
  const place = listingPlaceLabel(seller.placeName, seller.county);
  if (!place) return null;
  return (
    <p className={`flex items-center gap-1.5 text-sm text-muted ${className}`}>
      <MapPin size={14} className="shrink-0" aria-hidden />
      {place}
    </p>
  );
}

function SellerStats({
  seller,
  locale,
  t,
  className = "",
  compact = false,
}: {
  seller: SocialProofSeller;
  locale: string;
  t: Copy;
  className?: string;
  compact?: boolean;
}) {
  const stats = [
    {
      value: seller.listingCount,
      label: seller.listingCount === 1 ? t.listingOne : t.listings,
      show: true,
    },
    { value: seller.totalViews, label: t.views, show: seller.totalViews >= MIN_VIEWS_SHOWN },
    {
      value: seller.followerCount,
      label: t.followers,
      show: seller.followerCount >= MIN_FOLLOWERS_SHOWN,
    },
  ].filter((stat) => stat.show);

  return (
    <dl className={`flex flex-wrap gap-x-6 gap-y-3 ${className}`}>
      {stats.map(({ value, label }) => (
        <div key={label} className="flex flex-col-reverse">
          <dt className="text-xs font-semibold uppercase tracking-normal text-muted">
            {label}
          </dt>
          <dd
            className={`m-0 font-display font-bold leading-none text-default tabular-nums ${
              compact ? "text-xl" : "text-[1.75rem]"
            }`}
          >
            {value.toLocaleString(locale)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SinceLabel({
  seller,
  locale,
  t,
}: {
  seller: SocialProofSeller;
  locale: string;
  t: Copy;
}) {
  const since = new Date(seller.memberSince);
  if (Number.isNaN(since.getTime())) return null;
  const date = since.toLocaleDateString(locale, { month: "long", year: "numeric" });
  return (
    <time dateTime={since.toISOString()}>{fill(t.since, { date })}</time>
  );
}
