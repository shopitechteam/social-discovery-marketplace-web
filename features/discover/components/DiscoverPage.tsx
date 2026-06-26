"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gql, NetworkStatus, type TypedDocumentNode } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
  ArrowUpDown,
  Check,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";
import { DiscoverGridCard } from "./DiscoverGridCard";
import { useInfiniteScroll } from "@/features/feed/hooks/useInfiniteScroll";

type DiscoverySort =
  | "RELEVANCE"
  | "NEWEST"
  | "PRICE_LOW_TO_HIGH"
  | "PRICE_HIGH_TO_LOW";

type CategoryFacet = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  count: number;
};

type LocationFacet = {
  id: string;
  name: string;
  slug: string;
  count: number;
  countyId?: string | null;
  subCountyId?: string | null;
};

type DiscoveryFeedData = {
  discoveryFeed: {
    items: ContentCardFieldsFragment[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
};

type DiscoveryFeedVars = {
  query?: string;
  categoryId?: string;
  countyId?: string;
  subCountyId?: string;
  wardId?: string;
  sort?: DiscoverySort;
  limit?: number;
  after?: string;
};

type DiscoveryFacetsVars = {
  query?: string;
  categoryId?: string;
  countyId?: string;
  subCountyId?: string;
  wardId?: string;
};

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 280;

const DISCOVERY_FEED: TypedDocumentNode<DiscoveryFeedData, DiscoveryFeedVars> =
  gql`
    query DiscoveryFeed(
      $query: String
      $categoryId: String
      $countyId: String
      $subCountyId: String
      $wardId: String
      $sort: DiscoverySort
      $limit: Int
      $after: String
    ) {
      discoveryFeed(
        query: $query
        categoryId: $categoryId
        countyId: $countyId
        subCountyId: $subCountyId
        wardId: $wardId
        sort: $sort
        limit: $limit
        after: $after
      ) {
        items {
          id
          type
          title
          caption
          hashtags
          creatorId
          allowDownload
          hdEnabled
          createdAt
          creator {
            id
            username
            isFollowedByMe
            followerCount
            profile {
              firstName
              lastName
              avatar
            }
          }
          media {
            mediaType
            url
            imageUrl
            thumbnailUrl
            sortOrder
            displayWidth
            displayHeight
            muxMeta {
              playbackId
              duration
              aspectRatio
              thumbnailUrl
              animatedThumbnailUrl
            }
            r2Variants {
              url
              variant
              width
              height
            }
          }
          price {
            amount
            currency
            negotiable
          }
          stats {
            views
            likes
            shares
            saves
          }
          location {
            county
            subregion
            placeName
          }
          ranking {
            rankScore
            trendingScore
          }
          isLikedByMe
          isSavedByMe
          isMyContent
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

// Category list — fetched once with NO filter variables so the category bar
// stays stable. Changing category/sort/location/search must never reload it.
type DiscoveryCategoriesData = {
  discoveryFacets: { categories: CategoryFacet[] };
};

const DISCOVERY_CATEGORIES: TypedDocumentNode<
  DiscoveryCategoriesData,
  Record<string, never>
> = gql`
  query DiscoveryCategories {
    discoveryFacets {
      categories {
        id
        name
        slug
        icon
        count
      }
    }
  }
`;

// Location facets — these DO depend on the active filters because the post
// counts shown in the location drawer reflect the current query/category.
type DiscoveryLocationFacetsData = {
  discoveryFacets: {
    counties: LocationFacet[];
    subCounties: LocationFacet[];
    wards: LocationFacet[];
  };
};

const DISCOVERY_LOCATION_FACETS: TypedDocumentNode<
  DiscoveryLocationFacetsData,
  DiscoveryFacetsVars
> = gql`
  query DiscoveryLocationFacets(
    $query: String
    $categoryId: String
    $countyId: String
    $subCountyId: String
    $wardId: String
  ) {
    discoveryFacets(
      query: $query
      categoryId: $categoryId
      countyId: $countyId
      subCountyId: $subCountyId
      wardId: $wardId
    ) {
      counties {
        id
        name
        slug
        count
      }
      subCounties {
        id
        name
        slug
        count
        countyId
      }
      wards {
        id
        name
        slug
        count
        countyId
        subCountyId
      }
    }
  }
`;

const SORT_OPTIONS: Array<{
  value: DiscoverySort;
  label: string;
  hint: string;
}> = [
  {
    value: "RELEVANCE",
    label: "Best match",
    hint: "Top posts for what you want",
  },
  { value: "NEWEST", label: "Newest first", hint: "Fresh listings first" },
  { value: "PRICE_LOW_TO_HIGH", label: "Lowest price", hint: "Cheapest first" },
  {
    value: "PRICE_HIGH_TO_LOW",
    label: "Highest price",
    hint: "Premium picks first",
  },
];

function pillButton(active: boolean) {
  return cn(
    "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
    active
      ? "border-transparent bg-primary text-white shadow-sm"
      : "border-default bg-app text-default",
  );
}

/**
 * RedNote-style category tab — plain text, no chip. Active is bold and full
 * contrast; inactive sits back in muted gray. Lives in a horizontally scrolling
 * row so categories run off the right edge like the reference design.
 */
function CategoryTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  // When this tab becomes the selected one, slide it toward the start of the
  // scroller so a far-right pick doesn't stay stranded at the edge. `inline:
  // "start"` anchors it left when there's room to scroll, and naturally stops
  // short for tabs already near the start (no awkward over-scroll).
  useEffect(() => {
    if (active) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        inline: "start",
        block: "nearest",
      });
    }
  }, [active]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 scroll-ml-4 whitespace-nowrap text-sm py-1 transition-colors",
        active
          ? "font-bold text-default border-b border-gray-800"
          : "font-medium text-muted-foreground",
      )}
    >
      {label}
    </button>
  );
}

function CategorySkeletonRow() {
  return (
    <div className="flex gap-6 overflow-hidden px-4 pb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-16 rounded-md" />
      ))}
    </div>
  );
}

function DiscoverFeedSkeleton() {
  return (
    <div className="px-4 pb-8 pt-3 md:px-0">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-default bg-app"
          >
            <Skeleton className="aspect-3/4 w-full rounded-none" />
            <div className="space-y-2 p-2.5">
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          backgroundColor: "rgb(var(--brand-primary) / 0.12)",
          color: "rgb(var(--brand-primary))",
        }}
      >
        <Search size={22} />
      </div>
      <h2 className="mt-4 text-base font-semibold text-default">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function LocationOption({
  item,
  active,
  onClick,
}: {
  item: LocationFacet;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
        active ? "border-primary bg-primary/5" : "border-default bg-app",
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-default">{item.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.count} posts
        </p>
      </div>
      {active ? <Check size={18} className="text-primary" /> : null}
    </button>
  );
}

function SortOption({
  label,
  hint,
  active,
  onClick,
}: {
  label: string;
  hint: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
        active ? "border-primary bg-primary/5" : "border-default bg-app",
      )}
    >
      <div>
        <p className="text-sm font-medium text-default">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
      {active ? <Check size={18} className="text-primary" /> : null}
    </button>
  );
}

export function DiscoverPage({ lang }: { lang: string }) {
  const [searchDraft, setSearchDraft] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFacet | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<LocationFacet | null>(
    null,
  );
  const [selectedSubCounty, setSelectedSubCounty] =
    useState<LocationFacet | null>(null);
  const [selectedWard, setSelectedWard] = useState<LocationFacet | null>(null);
  const [sort, setSort] = useState<DiscoverySort>("RELEVANCE");
  // Price + negotiable filters — UI/state only for now; not yet sent to the API
  // (backend support pending). minPrice/maxPrice are raw input strings.
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [negotiable, setNegotiable] = useState<"ANY" | "YES" | "NO">("ANY");
  const [locationOpen, setLocationOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchDraft.trim();
      setQuery(next);
      // Search spans every category, so drop any category constraint when one
      // starts — otherwise results would be silently scoped to a category whose
      // bar is now hidden.
      if (next) setSelectedCategory(null);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchDraft]);

  const feedVariables = useMemo<DiscoveryFeedVars>(
    () => ({
      query: query || undefined,
      categoryId: selectedCategory?.id,
      countyId: selectedCounty?.id,
      subCountyId: selectedSubCounty?.id,
      wardId: selectedWard?.id,
      sort,
      limit: PAGE_SIZE,
    }),
    [
      query,
      selectedCategory?.id,
      selectedCounty?.id,
      selectedSubCounty?.id,
      selectedWard?.id,
      sort,
    ],
  );

  const facetVariables = useMemo<DiscoveryFacetsVars>(
    () => ({
      query: query || undefined,
      categoryId: selectedCategory?.id,
      countyId: selectedCounty?.id,
      subCountyId: selectedSubCounty?.id,
      wardId: selectedWard?.id,
    }),
    [
      query,
      selectedCategory?.id,
      selectedCounty?.id,
      selectedSubCounty?.id,
      selectedWard?.id,
    ],
  );

  const { data, loading, error, fetchMore, refetch, networkStatus } = useQuery(
    DISCOVERY_FEED,
    {
      variables: feedVariables,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    },
  );

  // Category list loads once on mount and never refetches — it is independent
  // of the active query/category/location so the category bar stays stable.
  const { data: categoriesData, loading: categoriesLoading } = useQuery(
    DISCOVERY_CATEGORIES,
    {
      fetchPolicy: "cache-first",
      nextFetchPolicy: "cache-first",
    },
  );

  // Location facets follow the active filters (their post counts depend on the
  // current query/category). Kept separate so they don't disturb categories.
  const { data: locationFacetsData } = useQuery(DISCOVERY_LOCATION_FACETS, {
    variables: facetVariables,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const items = data?.discoveryFeed.items ?? [];
  const pageInfo = data?.discoveryFeed.pageInfo;
  const locationFacets = locationFacetsData?.discoveryFacets;
  const isFetchingMore = networkStatus === NetworkStatus.fetchMore;

  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    void fetchMore({
      variables: {
        ...feedVariables,
        after: pageInfo.endCursor,
      },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) return prev;
        return {
          discoveryFeed: {
            ...fetchMoreResult.discoveryFeed,
            items: [
              ...(prev.discoveryFeed?.items ?? []),
              ...fetchMoreResult.discoveryFeed.items,
            ],
          },
        };
      },
    });
  }, [fetchMore, feedVariables, pageInfo]);

  const { sentinelRef } = useInfiniteScroll({
    hasMore: pageInfo?.hasNextPage ?? false,
    loading: isFetchingMore,
    onLoadMore: loadMore,
    rootMargin: "1200px",
  });

  const activeSort =
    SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0];
  const locationLabel =
    selectedWard?.name ??
    selectedSubCounty?.name ??
    selectedCounty?.name ??
    "All Kenya";
  // Count only what lives inside the filter sheet (location + price + negotiable);
  // category and sort have their own controls outside the sheet.
  const hasLocation = Boolean(
    selectedCounty || selectedSubCounty || selectedWard,
  );
  const activeFilterCount =
    (hasLocation ? 1 : 0) +
    (minPrice.trim() || maxPrice.trim() ? 1 : 0) +
    (negotiable !== "ANY" ? 1 : 0);

  function clearLocation() {
    setSelectedCounty(null);
    setSelectedSubCounty(null);
    setSelectedWard(null);
  }

  function clearFilters() {
    clearLocation();
    setMinPrice("");
    setMaxPrice("");
    setNegotiable("ANY");
  }

  function clearSearch() {
    setSearchDraft("");
    setQuery("");
  }

  function pickCounty(item: LocationFacet | null) {
    setSelectedCounty(item);
    setSelectedSubCounty(null);
    setSelectedWard(null);
  }

  function pickSubCounty(item: LocationFacet | null) {
    setSelectedSubCounty(item);
    setSelectedWard(null);
  }

  const categories = categoriesData?.discoveryFacets.categories ?? [];
  const counties = locationFacets?.counties ?? [];
  const subCounties = locationFacets?.subCounties ?? [];
  const wards = locationFacets?.wards ?? [];

  // When searching, results span every category, so the category bar would be
  // misleading (most categories hide / counts no longer reflect the row). Hide
  // it during an active search and show the full set again once search clears.
  const showCategories = query.length === 0;

  return (
    <div className="min-h-svh bg-app pb-24 md:pb-8">
      <div className="mx-auto w-full max-w-5xl md:grid md:grid-cols-[320px_minmax(0,1fr)] md:gap-6 md:px-6 md:pt-6">
        <aside className="hidden md:block">
          <div className="sticky top-6 space-y-4 rounded-3xl border border-default bg-app p-4">
            <div>
              <p className="text-lg font-semibold text-default">Discover</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Search by intent, then narrow by category and place.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setLocationOpen(true)}
                className="flex w-full items-center justify-between rounded-2xl border border-default px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-default">Location</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {locationLabel}
                  </p>
                </div>
                <MapPin size={18} className="text-muted-foreground" />
              </button>

              <button
                type="button"
                onClick={() => setSortOpen(true)}
                className="flex w-full items-center justify-between rounded-2xl border border-default px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-default">Sort</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {activeSort.label}
                  </p>
                </div>
                <ArrowUpDown size={18} className="text-muted-foreground" />
              </button>
            </div>

            {showCategories ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-default">
                    Categories
                  </p>
                  {selectedCategory ? (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className="text-xs text-primary"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className={pillButton(selectedCategory === null)}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={pillButton(
                        selectedCategory?.id === category.id,
                      )}
                    >
                      <span>{category.icon ?? "#"}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="sticky top-0 z-30 border-b border-default bg-app/92 backdrop-blur-md md:static md:border-b-0 md:bg-transparent md:backdrop-blur-none">
            <div className="flex items-center gap-2 px-4 pb-3 pt-3 md:px-0 md:pt-0">
              <div className="flex border border-gray-300 min-w-0 flex-1 items-center gap-2.5 rounded-full bg-surface px-4 py-2.5">
                <Search
                  size={16}
                  className="shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <input
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="Search cars, dresses, fresh produce..."
                  className="h-5 min-w-0 flex-1 bg-transparent text-sm text-default outline-none placeholder:text-muted-foreground"
                />
                {searchDraft ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="shrink-0 text-muted-foreground"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                ) : null}
              </div>

              {/* Sort + Filter icon buttons — opposite the search bar */}
              <button
                type="button"
                onClick={() => setSortOpen(true)}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors md:hidden",
                  sort !== "RELEVANCE"
                    ? "bg-primary/10 text-primary"
                    : "bg-surface text-default",
                )}
                aria-label="Sort"
              >
                <ArrowUpDown size={18} />
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className={cn(
                  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors md:hidden",
                  activeFilterCount > 0
                    ? "bg-primary/10 text-primary"
                    : "bg-surface text-default",
                )}
                aria-label="Filters"
              >
                <SlidersHorizontal size={18} />
                {activeFilterCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
            </div>

            {showCategories ? (
              categoriesLoading && categories.length === 0 ? (
                <CategorySkeletonRow />
              ) : (
                <div className="scrollbar-none flex items-center gap-6 overflow-x-auto px-4 pb-3 md:hidden">
                  <CategoryTab
                    label="All"
                    active={selectedCategory === null}
                    onClick={() => setSelectedCategory(null)}
                  />
                  {categories.map((category) => (
                    <CategoryTab
                      key={category.id}
                      label={category.name}
                      active={selectedCategory?.id === category.id}
                      onClick={() => setSelectedCategory(category)}
                    />
                  ))}
                </div>
              )
            ) : null}
          </div>

          {error && items.length === 0 ? (
            <div className="px-4 py-12 md:px-0">
              <div className="rounded-[22px] border border-default bg-app p-6 text-center">
                <p className="text-base font-semibold text-default">
                  Couldn&apos;t load Discover
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Check the connection to the API, then try again.
                </p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-white"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : null}

          {loading && <DiscoverFeedSkeleton />}

          {!loading && items.length === 0 && !error ? (
            <EmptyState
              title="No posts match this search"
              body="Try a broader keyword, another category, or a wider location around you."
            />
          ) : null}

          {items.length > 0 ? (
            <div className="px-4 pb-6 pt-3 md:px-0">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-default">
                    {query
                      ? `Results for “${query}”`
                      : "Listings picked for discovery"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedWard?.name ??
                      selectedSubCounty?.name ??
                      selectedCounty?.name ??
                      "Across Kenya"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
                {items.map((post, index) => (
                  <DiscoverGridCard
                    key={post.id}
                    post={post}
                    lang={lang}
                    priority={index < 4}
                  />
                ))}
              </div>

              <div ref={sentinelRef} className="h-2" />

              {isFetchingMore ? (
                <div className="grid grid-cols-2 gap-2 pt-3 md:grid-cols-3 md:gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-3/4 rounded-2xl" />
                  ))}
                </div>
              ) : null}

              {!pageInfo?.hasNextPage ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  You&apos;ve seen the latest matches.
                </p>
              ) : null}
            </div>
          ) : null}
        </main>
      </div>

      {/* Filter sheet — full-width, slides in from the right. Holds location,
          price range, and negotiable. (Category and sort have their own
          controls outside the sheet.) */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent
          side="right"
          className="flex w-full max-w-none flex-col gap-0 bg-app p-0 sm:max-w-none"
        >
          <SheetHeader className="border-b border-default px-5 py-4 text-left">
            <SheetTitle className="text-base">Filters</SheetTitle>
          </SheetHeader>

          <div className="flex-1 space-y-7 overflow-y-auto px-5 py-5">
            {/* Location */}
            <section>
              <p className="mb-3 text-sm font-semibold text-default">
                Location
              </p>
              <button
                type="button"
                onClick={() => setLocationOpen(true)}
                className="flex w-full items-center justify-between rounded-2xl border border-default px-4 py-3.5 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-default">
                    {locationLabel}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Tap to change county, subcounty or ward
                  </p>
                </div>
                <MapPin size={18} className="shrink-0 text-muted-foreground" />
              </button>
            </section>

            {/* Price range */}
            <section>
              <p className="mb-3 text-sm font-semibold text-default">
                Price range
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="mb-1 block text-xs text-muted-foreground">
                    Min (KSh)
                  </span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
                <span className="mt-5 text-muted-foreground">–</span>
                <div className="flex-1">
                  <span className="mb-1 block text-xs text-muted-foreground">
                    Max (KSh)
                  </span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="Any"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            </section>

            {/* Negotiable */}
            <section>
              <p className="mb-3 text-sm font-semibold text-default">
                Negotiable
              </p>
              <RadioGroup
                value={negotiable}
                onValueChange={(v) => setNegotiable(v as "ANY" | "YES" | "NO")}
                className="gap-0 overflow-hidden rounded-2xl border border-default"
              >
                {[
                  { value: "ANY", label: "Any", hint: "Show all listings" },
                  {
                    value: "YES",
                    label: "Negotiable",
                    hint: "Price can be discussed",
                  },
                  {
                    value: "NO",
                    label: "Fixed price",
                    hint: "Non-negotiable only",
                  },
                ].map((opt, i) => (
                  <label
                    key={opt.value}
                    htmlFor={`negotiable-${opt.value}`}
                    className={cn(
                      "flex cursor-pointer items-center justify-between px-4 py-3.5",
                      i > 0 && "border-t border-default",
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-default">
                        {opt.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {opt.hint}
                      </p>
                    </div>
                    <RadioGroupItem
                      id={`negotiable-${opt.value}`}
                      value={opt.value}
                    />
                  </label>
                ))}
              </RadioGroup>
            </section>
          </div>

          <SheetFooter className="flex-row gap-3 border-t border-default px-5 py-4">
            <button
              type="button"
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
              className="h-11 flex-1 rounded-full border border-default text-sm font-semibold text-default disabled:opacity-40"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="h-11 flex-1 rounded-full bg-primary text-sm font-semibold text-white"
            >
              Show results
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Drawer open={locationOpen} onOpenChange={setLocationOpen}>
        <DrawerContent className="mx-auto max-w-107.5 max-h-[82svh]">
          <DrawerHeader className="pb-2 text-left">
            <DrawerTitle className="text-base">Choose location</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-5">
            <div className="space-y-6">
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-default">County</p>
                  {selectedCounty || selectedSubCounty || selectedWard ? (
                    <button
                      type="button"
                      onClick={clearLocation}
                      className="text-xs text-primary"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => pickCounty(null)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left",
                      selectedCounty === null &&
                        selectedSubCounty === null &&
                        selectedWard === null
                        ? "border-primary bg-primary/5"
                        : "border-default bg-app",
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-default">
                        All Kenya
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Browse nationwide
                      </p>
                    </div>
                    {selectedCounty === null &&
                    selectedSubCounty === null &&
                    selectedWard === null ? (
                      <Check size={18} className="text-primary" />
                    ) : null}
                  </button>
                  {counties.map((item) => (
                    <LocationOption
                      key={item.id}
                      item={item}
                      active={selectedCounty?.id === item.id}
                      onClick={() => pickCounty(item)}
                    />
                  ))}
                </div>
              </section>

              {selectedCounty ? (
                <section>
                  <p className="mb-3 text-sm font-semibold text-default">
                    Subcounty
                  </p>
                  <div className="space-y-2">
                    {subCounties.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-default px-4 py-3 text-sm text-muted-foreground">
                        No subcounty clusters yet for this selection.
                      </p>
                    ) : (
                      subCounties.map((item) => (
                        <LocationOption
                          key={item.id}
                          item={item}
                          active={selectedSubCounty?.id === item.id}
                          onClick={() => pickSubCounty(item)}
                        />
                      ))
                    )}
                  </div>
                </section>
              ) : null}

              {selectedCounty ? (
                <section>
                  <p className="mb-3 text-sm font-semibold text-default">
                    Ward
                  </p>
                  <div className="space-y-2">
                    {wards.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-default px-4 py-3 text-sm text-muted-foreground">
                        Ward options appear where sellers posted at ward level.
                      </p>
                    ) : (
                      wards.map((item) => (
                        <LocationOption
                          key={item.id}
                          item={item}
                          active={selectedWard?.id === item.id}
                          onClick={() => setSelectedWard(item)}
                        />
                      ))
                    )}
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={sortOpen} onOpenChange={setSortOpen}>
        <DrawerContent className="mx-auto max-w-107.5">
          <DrawerHeader className="pb-2 text-left">
            <DrawerTitle className="text-base">Sort results</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-2 px-4 pb-5">
            {SORT_OPTIONS.map((option) => (
              <SortOption
                key={option.value}
                label={option.label}
                hint={option.hint}
                active={sort === option.value}
                onClick={() => {
                  setSort(option.value);
                  setSortOpen(false);
                }}
              />
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
