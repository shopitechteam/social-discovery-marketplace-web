"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { BadgeCheck, Search, Store as StoreIcon, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import {
  FOLLOWED_STORE_IDS_QUERY,
  STORES_QUERY,
  type StoreCard,
  type StoreDirectoryPage,
  type StoreSort,
} from "@/features/stores/queries/stores";
import {
  StoreTile,
  STORE_GRID_CLASS,
} from "@/features/stores/components/StoreTile";

/**
 * The Stores directory.
 *
 * Every seller already has a storefront at /{lang}/@{username}; this page is
 * the index of them, ranked by the stock actually behind each one. It exists
 * because browsing by shop is a different intent from browsing by product — you
 * come here to find someone to buy from repeatedly, not to find one item.
 *
 * The title block scrolls away but the filter bar sticks, because the directory
 * runs to many screens and a filter you have to scroll back up to reach is a
 * filter people stop using.
 *
 * The first page is rendered on the server (see the route), so the grid is
 * painted and crawlable before hydration; everything after that is client-side.
 */

const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 300;

const SORTS: Array<{ value: StoreSort; label: string }> = [
  { value: "LISTINGS", label: "Most stock" },
  { value: "RECENT", label: "Recently active" },
  { value: "POPULAR", label: "Most viewed" },
];

const ALL_COUNTIES = "__all__";

export type StoresPageProps = {
  lang: string;
  counties: string[];
  initialPage: StoreDirectoryPage;
  initialFilters: {
    search?: string;
    county?: string;
    sort: StoreSort;
    verifiedOnly?: boolean;
  };
};

/** A filter that is currently narrowing the grid, with the way to undo it. */
function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft py-1 pl-3 pr-1.5 text-[12px] font-semibold text-primary-strong dark:text-primary">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove filter: ${label}`}
        className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-primary/20"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function StoreTileSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-elevated">
      <Skeleton className="aspect-3/2 w-full rounded-none" />
      <div className="flex gap-2.5 p-3.5">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="border-t border-border px-3.5 py-2.5">
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function StoresPage({
  lang,
  counties,
  initialPage,
  initialFilters,
}: StoresPageProps) {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState(initialFilters.search ?? "");
  const [search, setSearch] = useState(initialFilters.search ?? "");
  const [county, setCounty] = useState(initialFilters.county ?? "");
  const [sort, setSort] = useState<StoreSort>(initialFilters.sort);
  const [verifiedOnly, setVerifiedOnly] = useState(
    initialFilters.verifiedOnly ?? false,
  );

  // Typing shouldn't fire a grouped aggregation on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Keep the URL in step with the filters so a filtered directory can be
  // shared and reopened. Replace, not push: filters aren't history steps.
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (county) params.set("county", county);
    if (sort !== "LISTINGS") params.set("sort", sort);
    if (verifiedOnly) params.set("verified", "1");
    const qs = params.toString();
    router.replace(`/${lang}/stores${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [lang, search, county, sort, verifiedOnly, router]);

  const variables = useMemo(
    () => ({
      input: {
        search: search || undefined,
        county: county || undefined,
        sort,
        verifiedOnly: verifiedOnly || undefined,
        limit: PAGE_SIZE,
        offset: 0,
      },
    }),
    [search, county, sort, verifiedOnly],
  );

  const isInitialFilters =
    search === (initialFilters.search ?? "") &&
    county === (initialFilters.county ?? "") &&
    sort === initialFilters.sort &&
    verifiedOnly === (initialFilters.verifiedOnly ?? false);

  const { data, loading, fetchMore } = useQuery(STORES_QUERY, {
    variables,
    // Serve the server-rendered page from cache and revalidate behind it, so
    // changing a filter never blanks the grid that is already on screen.
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  const fetched = (data as { stores?: StoreDirectoryPage } | undefined)?.stores;
  const page: StoreDirectoryPage =
    fetched ??
    (isInitialFilters ? initialPage : { stores: [], total: 0, hasMore: false });

  const loadingMoreRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !page.hasMore || page.nextOffset == null) return;
    loadingMoreRef.current = true;
    try {
      await fetchMore({
        variables: { input: { ...variables.input, offset: page.nextOffset } },
        // Append rather than replace. Offset pagination can hand back a seller
        // twice if someone publishes while you're reading, so ids already on
        // screen are dropped instead of rendering a duplicate card.
        updateQuery: (previous, { fetchMoreResult }) => {
          const prev = (previous as { stores?: StoreDirectoryPage }).stores;
          const next = (fetchMoreResult as { stores?: StoreDirectoryPage }).stores;
          if (!next) return previous;
          if (!prev) return fetchMoreResult;

          const seen = new Set(prev.stores.map((store: StoreCard) => store.id));
          return {
            stores: {
              ...next,
              stores: [
                ...prev.stores,
                ...next.stores.filter((store: StoreCard) => !seen.has(store.id)),
              ],
            },
          };
        },
      });
    } finally {
      loadingMoreRef.current = false;
    }
  }, [fetchMore, page.hasMore, page.nextOffset, variables.input]);

  // Follow state is per-viewer, so it can't ride along in the directory's
  // shared cached payload — it comes back on its own, for exactly the sellers
  // currently on screen, and is merged in below.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const visibleIds = useMemo(
    () => page.stores.map((store) => store.id),
    [page.stores],
  );
  const { data: followData } = useQuery(FOLLOWED_STORE_IDS_QUERY, {
    variables: { userIds: visibleIds },
    skip: !isAuthenticated || visibleIds.length === 0,
    fetchPolicy: "cache-and-network",
  });
  const followedIds = useMemo(() => {
    const ids = (followData as { followedUserIds?: string[] } | undefined)
      ?.followedUserIds;
    return new Set(ids ?? []);
  }, [followData]);

  const clearAll = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setCounty("");
    setVerifiedOnly(false);
  }, []);

  const hasFilters = Boolean(search || county || verifiedOnly);
  const showSkeletons = loading && page.stores.length === 0;
  const remaining = Math.max(page.total - page.stores.length, 0);

  return (
    <div className="min-h-svh bg-app pb-24 md:pb-12">
      <header className="mx-auto w-full max-w-360 px-4 pt-6 pb-5 xl:px-8">
        <h1 className="flex items-baseline gap-2 text-2xl font-bold text-main xl:text-3xl">
          Stores
          {/* The live total sits with the title rather than on its own line
              above the grid — the active-filter chips already say what is
              narrowing it, so the number only needed saying once. */}
          <span className="text-lg font-semibold text-muted xl:text-xl" aria-live="polite">
            · {page.total.toLocaleString("en-KE")}
          </span>
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          Browse sellers across Kenya. Stock, reach and activity on every card
          are counted live from public listings.
        </p>
      </header>

      {/* Sticky below the desktop top nav, at the viewport edge on mobile —
          the same offset the feed and profile headers use. */}
      <div className="sticky top-0 z-20 border-y border-border bg-app/94 backdrop-blur-md md:top-(--desktop-top-nav-height,68px)">
        <div className="mx-auto flex w-full max-w-360 flex-col gap-2.5 px-4 py-3 lg:flex-row lg:items-center xl:px-8">
          <div className="relative min-w-0 flex-1 lg:max-w-88">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search stores by name or @handle"
              aria-label="Search stores"
              className="h-10 w-full rounded-full border border-border bg-surface pl-9 pr-9 text-sm text-main outline-none placeholder:text-muted focus:border-primary"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-subtle hover:text-main"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {counties.length > 0 ? (
              <Select
                value={county || ALL_COUNTIES}
                onValueChange={(value) =>
                  setCounty(value === ALL_COUNTIES ? "" : value)
                }
              >
                <SelectTrigger
                  className="h-10 min-w-0 flex-1 rounded-full lg:w-52 lg:flex-none"
                  aria-label="Filter by county"
                >
                  <SelectValue placeholder="All counties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_COUNTIES}>All counties</SelectItem>
                  {counties.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}

            {/* The API has always supported this filter; until now there was no
                way to ask for it. Trust is the reason people browse by shop. */}
            <button
              type="button"
              onClick={() => setVerifiedOnly((on) => !on)}
              aria-pressed={verifiedOnly}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
                verifiedOnly
                  ? "border-primary bg-primary-soft text-primary-strong dark:text-primary"
                  : "border-border bg-surface text-main hover:bg-subtle",
              )}
            >
              <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
              Verified
            </button>
          </div>

          <div
            role="group"
            aria-label="Sort stores"
            className="flex shrink-0 items-center gap-1 rounded-full bg-surface p-1 lg:ml-auto"
          >
            {SORTS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={sort === option.value}
                onClick={() => setSort(option.value)}
                className={cn(
                  "inline-flex h-8 flex-1 items-center justify-center whitespace-nowrap rounded-full px-3.5 text-[13px] font-bold transition-colors lg:flex-none",
                  sort === option.value
                    ? "bg-primary text-white"
                    : "text-muted hover:text-main",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-360 px-4 pt-5 xl:px-8">
        {hasFilters ? (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {search ? (
              <FilterChip
                label={`“${search}”`}
                onClear={() => {
                  setSearchInput("");
                  setSearch("");
                }}
              />
            ) : null}
            {county ? (
              <FilterChip label={county} onClear={() => setCounty("")} />
            ) : null}
            {verifiedOnly ? (
              <FilterChip
                label="Verified only"
                onClear={() => setVerifiedOnly(false)}
              />
            ) : null}
            <button
              type="button"
              onClick={clearAll}
              className="text-[12px] font-semibold text-muted underline underline-offset-2 transition-colors hover:text-main"
            >
              Clear all
            </button>
          </div>
        ) : null}

        {showSkeletons ? (
          <div className={STORE_GRID_CLASS}>
            {Array.from({ length: 12 }).map((_, index) => (
              <StoreTileSkeleton key={index} />
            ))}
          </div>
        ) : page.stores.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
              <StoreIcon className="h-5 w-5 text-muted" aria-hidden />
            </span>
            <p className="mt-4 text-sm font-semibold text-main">
              No stores match that
            </p>
            <p className="mt-1 max-w-xs text-sm text-muted">
              Try a different county, or drop the search and browse everyone.
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearAll}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className={STORE_GRID_CLASS}>
              {page.stores.map((store) => (
                <StoreTile
                  key={store.id}
                  lang={lang}
                  store={store}
                  isFollowed={followedIds.has(store.id)}
                />
              ))}
            </div>

            {page.hasMore ? (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loading}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-elevated px-6 text-[13px] font-bold text-main transition-colors hover:bg-surface disabled:opacity-60"
                >
                  {loading
                    ? "Loading…"
                    : `Show ${Math.min(remaining, PAGE_SIZE)} more`}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
