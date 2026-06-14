"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";
import { PostCard } from "@/features/feed/components/PostCard";
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

type DiscoveryFacetsData = {
  discoveryFacets: {
    categories: CategoryFacet[];
    counties: LocationFacet[];
    subCounties: LocationFacet[];
    wards: LocationFacet[];
  };
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

const DISCOVERY_FEED: TypedDocumentNode<DiscoveryFeedData, DiscoveryFeedVars> = gql`
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

const DISCOVERY_FACETS: TypedDocumentNode<DiscoveryFacetsData, DiscoveryFacetsVars> = gql`
  query DiscoveryFacets(
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
      categories {
        id
        name
        slug
        icon
        count
      }
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

const SORT_OPTIONS: Array<{ value: DiscoverySort; label: string; hint: string }> = [
  { value: "RELEVANCE", label: "Best match", hint: "Top posts for what you want" },
  { value: "NEWEST", label: "Newest first", hint: "Fresh listings first" },
  { value: "PRICE_LOW_TO_HIGH", label: "Lowest price", hint: "Cheapest first" },
  { value: "PRICE_HIGH_TO_LOW", label: "Highest price", hint: "Premium picks first" },
];

function pillButton(active: boolean) {
  return cn(
    "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
    active
      ? "border-transparent bg-primary text-white shadow-sm"
      : "border-default bg-app text-default",
  );
}

function FilterButton({
  active,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={pillButton(Boolean(active))} onClick={onClick}>
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

function CategorySkeletonRow() {
  return (
    <div className="flex gap-2 overflow-hidden px-4 pb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-28 rounded-full" />
      ))}
    </div>
  );
}

function DiscoverFeedSkeleton() {
  return (
    <div className="px-4 pb-8 pt-3">
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-[18px] border border-default bg-app p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="mt-4 aspect-[4/5] w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgb(var(--brand-primary) / 0.12)", color: "rgb(var(--brand-primary))" }}
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
        <p className="mt-0.5 text-xs text-muted-foreground">{item.count} posts</p>
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
  const [selectedCategory, setSelectedCategory] = useState<CategoryFacet | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<LocationFacet | null>(null);
  const [selectedSubCounty, setSelectedSubCounty] = useState<LocationFacet | null>(null);
  const [selectedWard, setSelectedWard] = useState<LocationFacet | null>(null);
  const [sort, setSort] = useState<DiscoverySort>("RELEVANCE");
  const [locationOpen, setLocationOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setQuery(searchDraft.trim());
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
    [query, selectedCategory?.id, selectedCounty?.id, selectedSubCounty?.id, selectedWard?.id, sort],
  );

  const facetVariables = useMemo<DiscoveryFacetsVars>(
    () => ({
      query: query || undefined,
      categoryId: selectedCategory?.id,
      countyId: selectedCounty?.id,
      subCountyId: selectedSubCounty?.id,
      wardId: selectedWard?.id,
    }),
    [query, selectedCategory?.id, selectedCounty?.id, selectedSubCounty?.id, selectedWard?.id],
  );

  const {
    data,
    loading,
    error,
    fetchMore,
    refetch,
    networkStatus,
  } = useQuery(DISCOVERY_FEED, {
    variables: feedVariables,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  const { data: facetsData, loading: facetsLoading } = useQuery(DISCOVERY_FACETS, {
    variables: facetVariables,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const items = data?.discoveryFeed.items ?? [];
  const pageInfo = data?.discoveryFeed.pageInfo;
  const facets = facetsData?.discoveryFacets;
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

  const activeSort = SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0];
  const locationLabel = selectedWard?.name ?? selectedSubCounty?.name ?? selectedCounty?.name ?? "All Kenya";
  const activeFilterCount = [selectedCategory, selectedCounty, selectedSubCounty, selectedWard].filter(Boolean).length + (sort !== "RELEVANCE" ? 1 : 0);

  function clearLocation() {
    setSelectedCounty(null);
    setSelectedSubCounty(null);
    setSelectedWard(null);
  }

  function clearFilters() {
    setSelectedCategory(null);
    clearLocation();
    setSort("RELEVANCE");
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

  const categories = facets?.categories ?? [];
  const counties = facets?.counties ?? [];
  const subCounties = facets?.subCounties ?? [];
  const wards = facets?.wards ?? [];

  return (
    <div className="min-h-svh bg-app pb-24 md:pb-8">
      <div className="mx-auto w-full max-w-5xl md:grid md:grid-cols-[320px_minmax(0,1fr)] md:gap-6 md:px-6 md:pt-6">
        <aside className="hidden md:block">
          <div className="sticky top-6 space-y-4 rounded-[24px] border border-default bg-app p-4">
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
                  <p className="mt-0.5 text-xs text-muted-foreground">{locationLabel}</p>
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
                  <p className="mt-0.5 text-xs text-muted-foreground">{activeSort.label}</p>
                </div>
                <ArrowUpDown size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-default">Categories</p>
                {selectedCategory ? (
                  <button type="button" onClick={() => setSelectedCategory(null)} className="text-xs text-primary">
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
                    className={pillButton(selectedCategory?.id === category.id)}
                  >
                    <span>{category.icon ?? "#"}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="sticky top-0 z-30 border-b border-default bg-app/92 backdrop-blur-md md:static md:border-b-0 md:bg-transparent md:backdrop-blur-none">
            <div className="px-4 pb-3 pt-3 md:px-0 md:pt-0">
              <div className="flex items-center gap-3 rounded-[22px] border border-default bg-app px-4 py-3 shadow-sm">
                <Search size={18} className="shrink-0 text-muted-foreground" />
                <input
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="Search cars, dresses, fresh produce..."
                  className="h-6 flex-1 bg-transparent text-sm text-default outline-none placeholder:text-muted-foreground"
                />
                {searchDraft ? (
                  <button type="button" onClick={clearSearch} className="text-muted-foreground">
                    <X size={16} />
                  </button>
                ) : null}
              </div>
            </div>

            {facetsLoading && categories.length === 0 ? (
              <CategorySkeletonRow />
            ) : (
              <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
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
                    className={pillButton(selectedCategory?.id === category.id)}
                  >
                    <span>{category.icon ?? "#"}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-3 md:px-0">
              <FilterButton
                active={Boolean(selectedCounty || selectedSubCounty || selectedWard)}
                icon={<MapPin size={16} />}
                label={locationLabel}
                onClick={() => setLocationOpen(true)}
              />
              <FilterButton
                active={sort !== "RELEVANCE"}
                icon={<ArrowUpDown size={16} />}
                label={activeSort.label}
                onClick={() => setSortOpen(true)}
              />
              {activeFilterCount > 0 ? (
                <button type="button" className={pillButton(false)} onClick={clearFilters}>
                  <X size={16} />
                  <span>Clear</span>
                </button>
              ) : null}
              <div className="flex min-w-4 items-center rounded-full border border-default px-3 text-xs text-muted-foreground">
                <SlidersHorizontal size={14} className="mr-2" />
                {activeFilterCount} filters
              </div>
            </div>
          </div>

          {error && items.length === 0 ? (
            <div className="px-4 py-12 md:px-0">
              <div className="rounded-[22px] border border-default bg-app p-6 text-center">
                <p className="text-base font-semibold text-default">Couldn&apos;t load Discover</p>
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

          {loading && items.length === 0 ? <DiscoverFeedSkeleton /> : null}

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
                    {query ? `Results for “${query}”` : "Listings picked for discovery"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedWard?.name ?? selectedSubCounty?.name ?? selectedCounty?.name ?? "Across Kenya"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {items.map((post, index) => (
                  <PostCard key={post.id} post={post} lang={lang} priority={index < 2} />
                ))}
              </div>

              <div ref={sentinelRef} className="h-2" />

              {isFetchingMore ? (
                <div className="space-y-2 pt-3">
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
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
                  {(selectedCounty || selectedSubCounty || selectedWard) ? (
                    <button type="button" onClick={clearLocation} className="text-xs text-primary">
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
                      selectedCounty === null && selectedSubCounty === null && selectedWard === null
                        ? "border-primary bg-primary/5"
                        : "border-default bg-app",
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-default">All Kenya</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Browse nationwide</p>
                    </div>
                    {selectedCounty === null && selectedSubCounty === null && selectedWard === null ? (
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
                  <p className="mb-3 text-sm font-semibold text-default">Subcounty</p>
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
                  <p className="mb-3 text-sm font-semibold text-default">Ward</p>
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
