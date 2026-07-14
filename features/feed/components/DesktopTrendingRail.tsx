"use client";

/**
 * DesktopTrendingRail — vertical trending list for the desktop right rail.
 * Reuses the same `useTrending` data as the mobile TrendingStrip, but lays the
 * items out as a tappable vertical list better suited to a sidebar.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { gql, type TypedDocumentNode } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { ArrowUpRight, Flame, Store } from "lucide-react";
import { useTrending } from "../hooks/useFeed";
import { useFollow } from "../hooks/useFollow";
import { fmtCompact as fmt } from "@/lib/format";
import { idInitials } from "@/lib/avatar";
import { useAuthStore } from "@/stores/auth";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

type SellerToFollow = {
  id: string;
  username?: string | null;
  isFollowedByMe?: boolean | null;
  followerCount?: number | null;
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
  } | null;
  location?: {
    county?: string | null;
    subregion?: string | null;
    placeName?: string | null;
  } | null;
};

type SellersToFollowData = {
  sellersToFollow: SellerToFollow[];
};

type SellersToFollowVars = {
  limit: number;
};

const SELLERS_TO_FOLLOW: TypedDocumentNode<
  SellersToFollowData,
  SellersToFollowVars
> = gql`
  query SellersToFollow($limit: Int!) {
    sellersToFollow(limit: $limit) {
      id
      username
      isFollowedByMe
      followerCount
      profile {
        firstName
        lastName
        avatar
      }
      location {
        county
        subregion
        placeName
      }
    }
  }
`;

function TrendingRow({
  post,
  lang,
  rank,
}: {
  post: ContentCardFieldsFragment;
  lang: string;
  rank: number;
}) {
  const router = useRouter();

  const media = post.media?.[0];
  const playbackId = media?.muxMeta?.playbackId ?? null;

  const thumb =
    media?.thumbnailUrl ??
    (playbackId
      ? `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0&width=200&fit_mode=smartcrop`
      : (media?.r2Variants?.find((v) => v.variant === "thumb")?.url ??
        media?.r2Variants?.[0]?.url ??
        media?.imageUrl ??
        null));

  const isHot = (post.ranking?.trendingScore ?? 0) > 5;

  return (
    <button
      onClick={() => router.push(`/${lang}/content/${post.id}`, { scroll: false })}
      className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-surface"
    >
      {/* Rank */}
      <span className="w-5 shrink-0 text-center text-sm font-black text-muted-foreground">
        {rank}
      </span>

      {/* Thumbnail */}
      <div
        className="relative shrink-0 overflow-hidden rounded-xl bg-surface"
        style={{ width: 36, height: 36 }}
      >
        {thumb ? (
          <Image
            src={thumb}
            alt={post.title}
            fill
            sizes="36px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized={thumb.endsWith(".gif")}
          />
        ) : null}
        {isHot && (
          <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-snug text-default">
          {post.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {(post.stats?.views ?? 0) > 0
            ? `${fmt(post.stats!.views!)} views`
            : "Trending now"}
        </p>
      </div>
    </button>
  );
}

function SellerToFollowRow({
  seller,
  lang,
}: {
  seller: SellerToFollow;
  lang: string;
}) {
  const { following, toggle, loading } = useFollow({
    userId: seller.id,
    initialFollowing: seller.isFollowedByMe ?? false,
    initialFollowerCount: seller.followerCount ?? 0,
    lang,
  });

  const name = seller.profile?.firstName
    ? `${seller.profile.firstName}${seller.profile.lastName ? " " + seller.profile.lastName : ""}`
    : (seller.username ?? `Seller ${seller.id.slice(-4)}`);
  const location =
    seller.location?.county ?? seller.location?.placeName ?? "Nearby";

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/${lang}/profile/${seller.id}`}
        scroll={false}
        className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface text-xs font-black text-default"
      >
        {seller.profile?.avatar ? (
          <Image
            src={seller.profile.avatar}
            alt={name}
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        ) : (
          idInitials(seller.id)
        )}
      </Link>
      <Link
        href={`/${lang}/profile/${seller.id}`}
        scroll={false}
        className="min-w-0 flex-1"
      >
        <p className="truncate text-sm font-bold leading-tight text-default">
          {name}
        </p>
        <p className="truncate text-xs leading-tight text-muted">{location}</p>
      </Link>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className={[
          "rounded-full px-3 py-1.5 text-xs font-black transition-colors disabled:opacity-70",
          following
            ? "bg-surface text-muted"
            : "bg-primary text-white hover:bg-primary/90",
        ].join(" ")}
      >
        {following ? "Following" : "Follow"}
      </button>
    </div>
  );
}

export function DesktopTrendingRail({
  lang,
  county,
}: {
  lang: string;
  county?: string;
}) {
  const { items, loading } = useTrending(county);
  const [authHydrated, setAuthHydrated] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const { data: sellersData, loading: sellersLoading } = useQuery(
    SELLERS_TO_FOLLOW,
    {
      variables: { limit: 3 },
      skip: !authHydrated || !isAuthenticated,
      fetchPolicy: "cache-and-network",
    },
  );

  useEffect(() => {
    if (authHydrated) return;
    if (!useAuthStore.persist) return;
    if (useAuthStore.persist.hasHydrated()) {
      queueMicrotask(() => setAuthHydrated(true));
      return;
    }
    const unsubscribe = useAuthStore.persist.onFinishHydration(() =>
      setAuthHydrated(true),
    );
    return unsubscribe;
  }, [authHydrated]);

  // Show the skeleton until we actually have items, not only while `loading` is
  // true: with cache-and-network the loading flag can flip to false a beat
  // before the list populates, leaving the rail blank. Gating on emptiness keeps
  // the placeholder visible across that gap so the rail never renders empty.
  const showSkeleton = loading && items.length === 0;
  const sellers =
    sellersData?.sellersToFollow.filter(
      (seller): seller is SellerToFollow => typeof seller.id === "string",
    ) ?? [];

  return (
    <div className="flex min-h-full flex-col gap-4">
      <Link
        href={`/${lang}/upload`}
        scroll={false}
        className="block rounded-2xl bg-primary p-4 text-white shadow-[0_18px_46px_rgb(var(--brand-primary)/0.28)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-black leading-tight">
              Got something to sell?
            </p>
            <p className="mt-1 text-xs font-medium leading-snug text-white/85">
              List it in seconds and reach buyers near you.
            </p>
          </div>
          <Store className="h-5 w-5 shrink-0" />
        </div>
        <span className="mt-4 flex items-center justify-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-black text-primary">
          Start selling
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </Link>

      <section className="rounded-2xl border border-default bg-elevated p-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="flex items-center gap-1.5 text-base font-black text-default">
            <Flame className="h-4 w-4 text-primary" fill="currentColor" />
            Trending now
          </h2>
          <span className="rounded-full bg-surface px-2 py-1 text-[11px] font-semibold text-muted">
            {county ?? "Today"}
          </span>
        </div>

        {showSkeleton ? (
          <div className="flex flex-col gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-3 p-2"
              >
                <div className="h-4 w-5 shrink-0 rounded bg-black/10 dark:bg-white/10" />
                <div
                  className="shrink-0 rounded-xl bg-black/10 dark:bg-white/10"
                  style={{ width: 36, height: 36 }}
                />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded-full bg-black/10 dark:bg-white/10" />
                  <div className="h-2.5 w-1/2 rounded-full bg-black/10 dark:bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="px-1 py-4 text-sm text-muted-foreground">
            Nothing trending yet.
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {items.slice(0, 6).map((post, i) => (
              <TrendingRow
                key={post.id}
                post={post}
                lang={lang}
                rank={i + 1}
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-default bg-elevated p-4">
        <h2 className="mb-3 px-1 text-base font-black text-default">
          Sellers to follow
        </h2>

        {!authHydrated || sellersLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-black/10 dark:bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 rounded-full bg-black/10 dark:bg-white/10" />
                  <div className="h-2.5 w-1/2 rounded-full bg-black/10 dark:bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : !isAuthenticated ? (
          <p className="px-1 py-3 text-sm text-muted">
            Sign in to discover sellers.
          </p>
        ) : sellers.length === 0 ? (
          <p className="px-1 py-3 text-sm text-muted">
            You follow every suggested seller.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sellers.map((seller) => (
              <SellerToFollowRow
                key={seller.id}
                seller={seller}
                lang={lang}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
