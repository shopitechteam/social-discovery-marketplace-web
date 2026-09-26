/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { gql, NetworkStatus, type TypedDocumentNode } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedLoader } from "@/components/ui/feed-loader";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import {
  useDiscoverFiltersStore,
  type DiscoverContentType,
} from "@/stores/discoverFilters";
import { useSearchStore } from "@/stores/search";
import { useUiStore } from "@/stores/ui";
import { SHOW_ASK_SHOPI } from "@/features/feed/utils/askShopiAvailability";
import type {
  ContentCardFieldsFragment,
  ContentType,
} from "@/types/__generated__/graphql";
import { DISCOVER_GRID, DiscoverGridCard } from "./DiscoverGridCard";
import {
  ContentTypeSegments,
  DistanceFilter,
  POSTED_WITHIN_OPTIONS,
  PriceRangeFields,
  postedWithinLabel,
} from "./DiscoverFilterControls";
import { useInfiniteScroll } from "@/features/feed/hooks/useInfiniteScroll";
import { usePaginationGuard } from "@/features/feed/hooks/useFeed";
import { DISCOVERY_CATEGORIES, type CategoryFacet } from "../categories";

/**
 * Ask Shopi, the buyer agent: describe what you want (or send a photo) and it
 * finds listings. Loaded only when opened, and only in public development
 * builds — the flag is a build-time constant, so production bundles leave it
 * out entirely.
 */
const AskShopiGrid = SHOW_ASK_SHOPI
  ? dynamic(
      () => import("@/features/feed/components/AskShopiGrid").then((mod) => mod.AskShopiGrid),
      { ssr: false },
    )
  : null;

type DiscoverySort =
  | "RELEVANCE"
  | "NEWEST"
  | "PRICE_LOW_TO_HIGH"
  | "PRICE_HIGH_TO_LOW";

type LocationSheetStep = "county" | "subcounty" | "ward";

/** A spec filter, e.g. { key: "make", value: "Toyota" }. Keys are canonical. */
type SpecFilter = { key: string; value: string };

type SpecFacet = {
  key: string;
  label: string;
  values: Array<{ value: string; count: number }>;
};

/** An option list opened from a field in the mobile filter drawer. */
type FilterPicker =
  | { kind: "category" }
  | { kind: "subcategory" }
  | { kind: "posted" }
  | { kind: "spec"; key: string };

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
  type?: ContentType;
  countyId?: string;
  subCountyId?: string;
  wardId?: string;
  minPrice?: number;
  maxPrice?: number;
  negotiableOnly?: boolean;
  specs?: SpecFilter[];
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  postedWithinDays?: number;
  subcategory?: string;
  sort?: DiscoverySort;
  limit?: number;
  after?: string;
};

type DiscoveryFacetsVars = {
  query?: string;
  categoryId?: string;
  type?: ContentType;
  subcategory?: string;
  countyId?: string;
  subCountyId?: string;
  wardId?: string;
  minPrice?: number;
  maxPrice?: number;
  negotiableOnly?: boolean;
  specs?: SpecFilter[];
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  postedWithinDays?: number;
};

type DiscoveryResultCountData = {
  discoveryResultCount: number;
};

// The grid tops out at 5 columns (min-[90rem] in DISCOVER_GRID), so pages are
// a multiple of 5 — a page always fills whole rows instead of leaving a
// ragged last row while the next page loads.
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 280;

const DISCOVERY_FEED: TypedDocumentNode<DiscoveryFeedData, DiscoveryFeedVars> =
  gql`
    query DiscoveryFeed(
      $query: String
      $categoryId: String
      $type: ContentType
      $subcategory: String
      $countyId: String
      $subCountyId: String
      $wardId: String
      $minPrice: Float
      $maxPrice: Float
      $negotiableOnly: Boolean
      $specs: [DiscoverySpecFilterInput!]
      $latitude: Float
      $longitude: Float
      $radiusKm: Float
      $postedWithinDays: Int
      $sort: DiscoverySort
      $limit: Int
      $after: String
    ) {
      discoveryFeed(
        query: $query
        categoryId: $categoryId
        type: $type
        subcategory: $subcategory
        countyId: $countyId
        subCountyId: $subCountyId
        wardId: $wardId
        minPrice: $minPrice
        maxPrice: $maxPrice
        negotiableOnly: $negotiableOnly
        specs: $specs
        latitude: $latitude
        longitude: $longitude
        radiusKm: $radiusKm
        postedWithinDays: $postedWithinDays
        sort: $sort
        limit: $limit
        after: $after
      ) {
        items {
          id
          slug
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
    $type: ContentType
    $subcategory: String
    $countyId: String
    $subCountyId: String
    $wardId: String
    $minPrice: Float
    $maxPrice: Float
    $negotiableOnly: Boolean
    $specs: [DiscoverySpecFilterInput!]
    $latitude: Float
    $longitude: Float
    $radiusKm: Float
    $postedWithinDays: Int
  ) {
    discoveryFacets(
      query: $query
      categoryId: $categoryId
      type: $type
      subcategory: $subcategory
      countyId: $countyId
      subCountyId: $subCountyId
      wardId: $wardId
      minPrice: $minPrice
      maxPrice: $maxPrice
      negotiableOnly: $negotiableOnly
      specs: $specs
      latitude: $latitude
      longitude: $longitude
      radiusKm: $radiusKm
      postedWithinDays: $postedWithinDays
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

/**
 * Level-2 subcategories inside the active category, with a cover image each.
 *
 * Deliberately does NOT take `$subcategory`: the row must not rearrange itself
 * when you pick a tile from it, and leaving the variable out keeps one cache
 * entry per category instead of one per tile.
 */
type SubcategoryFacet = {
  name: string;
  count: number;
  imageUrl?: string | null;
};

type DiscoverySubcategoryFacetsData = {
  discoveryFacets: { subcategories: SubcategoryFacet[] };
};

const DISCOVERY_SUBCATEGORY_FACETS: TypedDocumentNode<
  DiscoverySubcategoryFacetsData,
  Omit<DiscoveryFacetsVars, "subcategory">
> = gql`
  query DiscoverySubcategoryFacets(
    $query: String
    $categoryId: String
    $type: ContentType
    $countyId: String
    $subCountyId: String
    $wardId: String
    $minPrice: Float
    $maxPrice: Float
    $negotiableOnly: Boolean
    $latitude: Float
    $longitude: Float
    $radiusKm: Float
    $postedWithinDays: Int
  ) {
    discoveryFacets(
      query: $query
      categoryId: $categoryId
      type: $type
      countyId: $countyId
      subCountyId: $subCountyId
      wardId: $wardId
      minPrice: $minPrice
      maxPrice: $maxPrice
      negotiableOnly: $negotiableOnly
      latitude: $latitude
      longitude: $longitude
      radiusKm: $radiusKm
      postedWithinDays: $postedWithinDays
    ) {
      subcategories {
        name
        count
        imageUrl
      }
    }
  }
`;

const DISCOVERY_RESULT_COUNT: TypedDocumentNode<
  DiscoveryResultCountData,
  DiscoveryFacetsVars
> = gql`
  query DiscoveryResultCount(
    $query: String
    $categoryId: String
    $type: ContentType
    $subcategory: String
    $countyId: String
    $subCountyId: String
    $wardId: String
    $minPrice: Float
    $maxPrice: Float
    $negotiableOnly: Boolean
    $specs: [DiscoverySpecFilterInput!]
    $latitude: Float
    $longitude: Float
    $radiusKm: Float
    $postedWithinDays: Int
  ) {
    discoveryResultCount(
      query: $query
      categoryId: $categoryId
      type: $type
      subcategory: $subcategory
      countyId: $countyId
      subCountyId: $subCountyId
      wardId: $wardId
      minPrice: $minPrice
      maxPrice: $maxPrice
      negotiableOnly: $negotiableOnly
      specs: $specs
      latitude: $latitude
      longitude: $longitude
      radiusKm: $radiusKm
      postedWithinDays: $postedWithinDays
    )
  }
`;

/**
 * Spec fields for the active category — Make, Model, Year… — with how many
 * listings carry each value. Empty without a category: specs only mean
 * something inside one.
 */
const DISCOVERY_SPEC_FACETS: TypedDocumentNode<
  { discoverySpecFacets: SpecFacet[] },
  DiscoveryFacetsVars
> = gql`
  query DiscoverySpecFacets(
    $query: String
    $categoryId: String
    $type: ContentType
    $subcategory: String
    $countyId: String
    $subCountyId: String
    $wardId: String
    $minPrice: Float
    $maxPrice: Float
    $negotiableOnly: Boolean
    $specs: [DiscoverySpecFilterInput!]
    $latitude: Float
    $longitude: Float
    $radiusKm: Float
    $postedWithinDays: Int
  ) {
    discoverySpecFacets(
      query: $query
      categoryId: $categoryId
      type: $type
      subcategory: $subcategory
      countyId: $countyId
      subCountyId: $subCountyId
      wardId: $wardId
      minPrice: $minPrice
      maxPrice: $maxPrice
      negotiableOnly: $negotiableOnly
      specs: $specs
      latitude: $latitude
      longitude: $longitude
      radiusKm: $radiusKm
      postedWithinDays: $postedWithinDays
    ) {
      key
      label
      values {
        value
        count
      }
    }
  }
`;

/** `?spec=make:Toyota&spec=model:Prado` ⇄ spec filters. */
function parseSpecParams(values: string[]): SpecFilter[] {
  const byKey = new Map<string, string>();
  for (const raw of values) {
    const separator = raw.indexOf(":");
    if (separator <= 0) continue;
    const key = raw.slice(0, separator).trim().toLowerCase();
    const value = raw.slice(separator + 1).trim();
    if (key && value) byKey.set(key, value);
  }
  return [...byKey].map(([key, value]) => ({ key, value }));
}

function parsePriceFilter(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function formatResultCount(count: number): string {
  return new Intl.NumberFormat("en-KE", {
    notation: count >= 1_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(count);
}

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

function isDiscoverySort(value: string | null): value is DiscoverySort {
  return SORT_OPTIONS.some((option) => option.value === value);
}

function isDiscoverContentType(
  value: string | null,
): value is DiscoverContentType {
  return value === "IMAGE" || value === "VIDEO";
}

function DiscoverFeedSkeleton() {
  return (
    <div className="px-4 pb-8 pt-3 lg:px-0">
      {/* 15 tiles so every column count (2 → 5) fills the viewport with full
          rows — fewer left the tail columns empty on wide screens. */}
      <div className={DISCOVER_GRID}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-3/4 w-full rounded-xl" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-4/5" />
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
      <p className="app-subcopy mx-auto mt-2 max-w-sm">{body}</p>
    </div>
  );
}

function LocationOption({
  item,
  active,
  onSelect,
  onDrillIn,
  indicator = "check",
}: {
  item: LocationFacet;
  active: boolean;
  /** Tapping the row's name/body — marks this item the active choice for the
   * current step. It doesn't navigate or close; the step's sticky footer picks
   * up whatever is active and is the one control that applies + closes. */
  onSelect: () => void;
  /**
   * The chevron control — marks the item active *and* advances into its
   * children. Only meaningful on a chevron row; omit it for a leaf level
   * (wards) that has nothing left to drill into.
   */
  onDrillIn?: () => void;
  indicator?: "check" | "chevron";
}) {
  const disabled = item.count === 0;
  const countLabel = `${item.count} ${item.count === 1 ? "item" : "items"}`;

  if (indicator === "chevron" && onDrillIn) {
    return (
      <div
        className={cn(
          "flex w-full items-stretch overflow-hidden rounded-2xl border transition-colors",
          active ? "border-primary bg-primary/5" : "border-default bg-app",
          disabled && "opacity-50",
        )}
      >
        <button
          type="button"
          onClick={onSelect}
          disabled={disabled}
          className="min-w-0 flex-1 px-4 py-3 text-left disabled:cursor-not-allowed"
        >
          <p className="truncate text-sm font-medium text-default">
            {item.name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{countLabel}</p>
        </button>
        <button
          type="button"
          onClick={onDrillIn}
          disabled={disabled}
          aria-label={`View places inside ${item.name}`}
          className={cn(
            "relative flex shrink-0 items-center border-l px-3 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:hover:bg-transparent",
            active
              ? "border-primary/20 bg-primary/10"
              : "border-default text-muted-foreground",
          )}
        >
          {/* Once a row is the active choice, drilling further in is the one
              obvious next move — a ping ring behind the chevron reads as
              "tap me", not just as a static "this has children" affordance.
              (animate-pulse on the icon itself was too subtle to notice.) */}
          {active ? (
            <span
              className="absolute inset-1.5 animate-ping rounded-full bg-primary/40"
              aria-hidden
            />
          ) : null}
          <ChevronRight
            size={18}
            className={cn("relative", active && "text-primary")}
          />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        active ? "border-primary bg-primary/5" : "border-default bg-app",
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-default">{item.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{countLabel}</p>
      </div>
      {active ? <Check size={18} className="text-primary" /> : null}
    </button>
  );
}

/** Client-side filter box shared by all three location steps — the facet
 * lists are already fully loaded, so this never hits the network. */
function LocationSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2 rounded-full border border-default bg-surface px-3.5 py-2">
      <Search
        size={15}
        className="shrink-0 text-muted-foreground"
        aria-hidden
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-5 min-w-0 flex-1 bg-transparent text-sm text-default outline-none placeholder:text-muted-foreground"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="shrink-0 text-muted-foreground"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      ) : null}
    </div>
  );
}

/**
 * Sticky action at the bottom of every location step. It always reflects
 * whatever is currently the active choice for that step (nationwide, or a
 * facet) — tapping a row above updates it live, and this is the one control
 * that actually applies the selection and closes the picker.
 */
function LocationStepFooter({
  count,
  label,
  onConfirm,
}: {
  count: number;
  label: string;
  onConfirm: () => void;
}) {
  return (
    <div className="shrink-0 border-t border-default px-4 py-3">
      <button
        type="button"
        onClick={onConfirm}
        disabled={count === 0}
        className="flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        Show {count} {count === 1 ? "item" : "items"} {label}
      </button>
    </div>
  );
}

/**
 * Stand-in for a list of LocationOptions while the facet query is still in
 * flight. Without this, a county with a slow-to-arrive (but non-empty)
 * subcounty list flashes the "nothing here" copy before the real rows land.
 */
function LocationOptionSkeletonList() {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex w-full items-center justify-between rounded-2xl border border-default px-4 py-3"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
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

function LocationSheetHeader({
  title,
  subtitle,
  onBack,
  action,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  action?: ReactNode;
}) {
  return (
    <div className="border-b border-default px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-default bg-app text-default transition-colors hover:bg-surface"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="min-w-0">
            <SheetTitle className="truncate text-base">{title}</SheetTitle>
            {subtitle ? (
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {action ?? <div className="h-9 w-9 shrink-0" aria-hidden />}
      </div>
    </div>
  );
}

/**
 * Header for a view inside the mobile filter drawer: back (or close) on the
 * left, the title, and an optional action on the right.
 */
function FilterDrawerHeader({
  title,
  subtitle,
  onBack,
  onClose,
  action,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onClose?: () => void;
  action?: ReactNode;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 pb-3 pt-1">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-main active:bg-surface"
        >
          <ChevronLeft size={22} />
        </button>
      ) : (
        <span className="w-1 shrink-0" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <DrawerTitle className="truncate text-base font-semibold text-main">{title}</DrawerTitle>
        {subtitle ? <p className="mt-0.5 truncate text-xs text-muted">{subtitle}</p> : null}
      </div>
      {action ??
        (onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-main active:bg-surface"
          >
            <X size={20} />
          </button>
        ) : (
          <span className="w-10 shrink-0" aria-hidden />
        ))}
    </div>
  );
}

/** One field in the filter list: its name, and what it is set to. */
function FilterFieldRow({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full border-b border-border py-3.5 text-left active:opacity-60"
    >
      <span className="block text-xs text-muted">{label}</span>
      <span className="mt-1 flex items-center justify-between gap-3">
        <span className={cn("truncate text-[15px] text-main", active && "font-semibold")}>
          {value}
        </span>
        <ChevronDown size={18} className="shrink-0 text-muted" aria-hidden />
      </span>
    </button>
  );
}

/**
 * The drawer's main view: every filter as one list of fields, the way people
 * already know it from classifieds apps. A field opens its options in place;
 * price is typed straight in. Spec fields (Make, Model, Year…) come from what
 * the category's listings actually carry, so there is never a field with
 * nothing behind it.
 */
function FilterFieldList({
  categoryLabel,
  subcategoryLabel,
  regionLabel,
  postedLabel,
  specFacets,
  specFacetsLoading,
  specs,
  negotiableOnly,
  onNegotiableOnly,
  onOpenPicker,
  onOpenRegion,
  onClose,
  onClear,
  canClear,
  resultLabel,
}: {
  categoryLabel: string;
  /** Null hides the row (no category, or a category without subcategories). */
  subcategoryLabel: string | null;
  regionLabel: string;
  postedLabel: string;
  specFacets: SpecFacet[];
  specFacetsLoading: boolean;
  specs: SpecFilter[];
  negotiableOnly: boolean;
  onNegotiableOnly: (value: boolean) => void;
  onOpenPicker: (picker: FilterPicker) => void;
  onOpenRegion: () => void;
  onClose: () => void;
  onClear: () => void;
  canClear: boolean;
  resultLabel: string;
}) {
  const specValue = (key: string) => specs.find((spec) => spec.key === key)?.value;

  return (
    <>
      <FilterDrawerHeader title="Filter results" onClose={onClose} />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
        <FilterFieldRow
          label="Category"
          value={categoryLabel}
          active={categoryLabel !== "All categories"}
          onClick={() => onOpenPicker({ kind: "category" })}
        />
        {subcategoryLabel ? (
          <FilterFieldRow
            label="Subcategory"
            value={subcategoryLabel}
            active={!subcategoryLabel.startsWith("All ")}
            onClick={() => onOpenPicker({ kind: "subcategory" })}
          />
        ) : null}
        <FilterFieldRow
          label="Region"
          value={regionLabel}
          active={regionLabel !== "All Kenya"}
          onClick={onOpenRegion}
        />

        <div className="border-b border-border py-3.5">
          <span className="mb-2 block text-xs text-muted">Distance</span>
          <DistanceFilter />
        </div>

        <div className="border-b border-border py-3.5">
          <span className="mb-2 block text-xs text-muted">Price, KSh</span>
          <PriceRangeFields />
        </div>

        {specFacetsLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border-b border-border py-3.5" aria-hidden>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-2 h-4 w-28" />
              </div>
            ))
          : specFacets.map((facet) => {
              const value = specValue(facet.key);
              return (
                <FilterFieldRow
                  key={facet.key}
                  label={facet.label}
                  value={value ?? "Any"}
                  active={Boolean(value)}
                  onClick={() => onOpenPicker({ kind: "spec", key: facet.key })}
                />
              );
            })}

        <div className="border-b border-border py-3.5">
          <span className="mb-2 block text-xs text-muted">Content type</span>
          <ContentTypeSegments />
        </div>

        <FilterFieldRow
          label="Posted"
          value={postedLabel}
          active={postedLabel !== "Any time"}
          onClick={() => onOpenPicker({ kind: "posted" })}
        />

        <div className="flex items-center justify-between gap-4 border-b border-border py-3.5">
          <div className="min-w-0">
            <span className="block text-[15px] text-main">Negotiable only</span>
            <span className="mt-0.5 block text-xs text-muted">
              Sellers open to discussing the price
            </span>
          </div>
          <Switch
            checked={negotiableOnly}
            onCheckedChange={onNegotiableOnly}
            aria-label="Negotiable only"
          />
        </div>

        {categoryLabel === "All categories" ? (
          <p className="py-4 text-xs leading-relaxed text-muted">
            Pick a category to filter by make, model, size and more.
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 gap-2.5 border-t border-border px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5">
        <button
          type="button"
          onClick={onClear}
          disabled={!canClear}
          className="h-10 shrink-0 rounded-lg border border-border px-5 text-[13px] font-semibold text-main transition-opacity active:opacity-70 disabled:opacity-40"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-10 flex-1 rounded-lg bg-primary text-[13px] font-semibold text-white transition-opacity active:opacity-80"
        >
          {resultLabel}
        </button>
      </div>
    </>
  );
}

/**
 * The options for one field, opened from the field list. Picking one applies
 * it and goes straight back to the list — one tap, no confirm step.
 */
function FilterPickerView({
  picker,
  categories,
  selectedCategory,
  subcategories,
  selectedSubcategory,
  specFacets,
  specs,
  postedWithinDays,
  onBack,
  onPickCategory,
  onPickSubcategory,
  onPickPosted,
  onPickSpec,
}: {
  picker: FilterPicker;
  categories: CategoryFacet[];
  selectedCategory: CategoryFacet | null;
  subcategories: SubcategoryFacet[];
  selectedSubcategory: string | null;
  specFacets: SpecFacet[];
  specs: SpecFilter[];
  postedWithinDays: number | null;
  onBack: () => void;
  onPickPosted: (days: number | null) => void;
  onPickCategory: (category: CategoryFacet | null) => void;
  onPickSubcategory: (name: string | null) => void;
  onPickSpec: (key: string, value: string | null) => void;
}) {
  const [search, setSearch] = useState("");

  let title: string;
  let anyLabel: string;
  let options: Array<{ id: string; label: string; count?: number; active: boolean; pick: () => void }>;
  let anyActive: boolean;
  let pickAny: () => void;

  if (picker.kind === "category") {
    title = "Category";
    anyLabel = "All categories";
    anyActive = !selectedCategory;
    pickAny = () => onPickCategory(null);
    options = categories.map((category) => ({
      id: category.id,
      label: category.name,
      count: category.count,
      active: selectedCategory?.id === category.id,
      pick: () => onPickCategory(category),
    }));
  } else if (picker.kind === "subcategory") {
    title = selectedCategory?.name ?? "Subcategory";
    anyLabel = selectedCategory ? `All ${selectedCategory.name}` : "All";
    anyActive = !selectedSubcategory;
    pickAny = () => onPickSubcategory(null);
    options = subcategories.map((item) => ({
      id: item.name,
      label: item.name,
      count: item.count,
      active: selectedSubcategory === item.name,
      pick: () => onPickSubcategory(item.name),
    }));
  } else if (picker.kind === "posted") {
    title = "Posted";
    anyLabel = "Any time";
    anyActive = postedWithinDays == null;
    pickAny = () => onPickPosted(null);
    options = POSTED_WITHIN_OPTIONS.filter((option) => option.value != null).map((option) => ({
      id: String(option.value),
      label: option.label,
      active: postedWithinDays === option.value,
      pick: () => onPickPosted(option.value),
    }));
  } else {
    const facet = specFacets.find((item) => item.key === picker.key);
    const current = specs.find((spec) => spec.key === picker.key)?.value;
    title = facet?.label ?? picker.key;
    anyLabel = "Any";
    anyActive = !current;
    pickAny = () => onPickSpec(picker.key, null);
    options = (facet?.values ?? []).map((item) => ({
      id: item.value,
      label: item.value,
      count: item.count,
      active: current?.toLowerCase() === item.value.toLowerCase(),
      pick: () => onPickSpec(picker.key, item.value),
    }));
  }

  // Long lists (Model, Category) get a filter box; short ones don't need it.
  const searchable = options.length > 8;
  const term = search.trim().toLowerCase();
  const visible = term
    ? options.filter((option) => option.label.toLowerCase().includes(term))
    : options;

  return (
    <>
      <FilterDrawerHeader title={title} onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        {searchable ? (
          <div className="pt-3">
            <LocationSearchInput
              value={search}
              onChange={setSearch}
              placeholder={`Search ${title.toLowerCase()}`}
            />
          </div>
        ) : null}
        {!term ? (
          <PickerOptionRow label={anyLabel} active={anyActive} onClick={pickAny} />
        ) : null}
        {visible.map((option) => (
          <PickerOptionRow
            key={option.id}
            label={option.label}
            count={option.count}
            active={option.active}
            onClick={option.pick}
          />
        ))}
        {term && visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No matches for “{search.trim()}”.</p>
        ) : null}
      </div>
    </>
  );
}

function PickerOptionRow({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex w-full items-center gap-3 border-b border-border py-3.5 text-left active:opacity-60"
    >
      <span className={cn("min-w-0 flex-1 truncate text-[15px] text-main", active && "font-semibold")}>
        {label}
      </span>
      {count != null ? <span className="shrink-0 text-xs tabular-nums text-muted">{count}</span> : null}
      <Check
        size={18}
        className={cn("shrink-0 text-primary", active ? "opacity-100" : "opacity-0")}
        aria-hidden
      />
    </button>
  );
}

function locationSheetDepth(step: LocationSheetStep | null) {
  switch (step) {
    case "county":
      return 1;
    case "subcounty":
      return 2;
    case "ward":
      return 3;
    default:
      return 0;
  }
}

export function DiscoverPage({ lang }: { lang: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Seed the search box from a ?q= deep link (e.g. /search?q=iphone, and the
  // /explore?q= URL advertised in our WebSite SearchAction structured data).
  // useState reads its argument only on the first render, so this is a plain
  // initial value — no effect, no cascading render — after which the input owns
  // the term and the mirror effect keeps the URL in sync.
  // The draft lives in a store rather than here because the desktop nav's
  // search box writes to it too — see stores/search.ts. `query` stays local:
  // it is the debounced value this page actually searches on, and nothing
  // outside needs it.
  const searchDraft = useSearchStore((s) => s.draft);
  const setSearchDraft = useSearchStore((s) => s.setDraft);
  const [query, setQuery] = useState(() => searchParams.get("q")?.trim() ?? "");

  // Seed the shared draft from a ?q= deep link on mount. The store outlives
  // this page (it is a module singleton), so without this a term typed on
  // /explore would still be sitting in the nav box on the next visit, and a
  // ?q= link would open with the box showing the previous search.
  useEffect(() => {
    setSearchDraft(searchParams.get("q")?.trim() ?? "");
    // Mount only: after this the input owns the term. Re-running on
    // searchParams would fight the debounce, because the mirror effect below
    // writes ?q= back from `query` on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const selectedCategory = useDiscoverFiltersStore(
    (s) => s.selectedCategory as CategoryFacet | null,
  );
  const setSelectedCategory = useDiscoverFiltersStore(
    (s) => s.setSelectedCategory,
  );
  const selectedSubcategory = useDiscoverFiltersStore(
    (s) => s.selectedSubcategory,
  );
  const setSelectedSubcategory = useDiscoverFiltersStore(
    (s) => s.setSelectedSubcategory,
  );
  const selectedCounty = useDiscoverFiltersStore(
    (s) => s.selectedCounty as LocationFacet | null,
  );
  const setSelectedCounty = useDiscoverFiltersStore((s) => s.setSelectedCounty);
  const selectedSubCounty = useDiscoverFiltersStore(
    (s) => s.selectedSubCounty as LocationFacet | null,
  );
  const setSelectedSubCounty = useDiscoverFiltersStore(
    (s) => s.setSelectedSubCounty,
  );
  const selectedWard = useDiscoverFiltersStore(
    (s) => s.selectedWard as LocationFacet | null,
  );
  const setSelectedWard = useDiscoverFiltersStore((s) => s.setSelectedWard);
  const selectedType = useDiscoverFiltersStore(
    (s) => s.selectedType as ContentType | null,
  );
  const setSelectedType = useDiscoverFiltersStore((s) => s.setSelectedType);
  const sort = useDiscoverFiltersStore((s) => s.sort as DiscoverySort);
  const setSort = useDiscoverFiltersStore((s) => s.setSort);
  const minPrice = useDiscoverFiltersStore((s) => s.minPrice);
  const setMinPrice = useDiscoverFiltersStore((s) => s.setMinPrice);
  const maxPrice = useDiscoverFiltersStore((s) => s.maxPrice);
  const setMaxPrice = useDiscoverFiltersStore((s) => s.setMaxPrice);
  const negotiableOnly = useDiscoverFiltersStore((s) => s.negotiableOnly);
  const setNegotiableOnly = useDiscoverFiltersStore((s) => s.setNegotiableOnly);
  const requestLocationPicker = useDiscoverFiltersStore(
    (s) => s.requestLocationPicker,
  );
  const setStoreSubcategories = useDiscoverFiltersStore(
    (s) => s.setSubcategories,
  );
  const [locationStep, setLocationStep] = useState<LocationSheetStep | null>(
    null,
  );
  // The location picker is a right-side sheet on mobile (matches Filters/Sort)
  // but a centered dialog on desktop, where a slide-in panel reads as a leftover
  // mobile pattern rather than a deliberate desktop control.
  const isDesktop = useIsDesktop({ ssrDefault: false });
  // One search box shared by all three location steps — only one step is ever
  // visible at a time, so a single term is enough. It's client-side (the
  // facet lists are already fully loaded); every step transition below clears
  // it so leftover text from "county" doesn't linger into "ward".
  const [locationSearch, setLocationSearch] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  // An option list open inside the mobile filter drawer (Category, Make…).
  const [picker, setPicker] = useState<FilterPicker | null>(null);
  // Ask Shopi, opened full screen over Browse from the search bar.
  const [askOpen, setAskOpen] = useState(false);
  const setBottomNavHidden = useUiStore((s) => s.setBottomNavHidden);
  // Spec filters (Make: Toyota…), distance and recency live in the shared
  // store so the desktop sidebar edits the same state as the mobile drawer.
  const specs = useDiscoverFiltersStore((s) => s.specs);
  const setSpec = useDiscoverFiltersStore((s) => s.setSpec);
  const setSpecs = useDiscoverFiltersStore((s) => s.setSpecs);
  const setStoreSpecFacets = useDiscoverFiltersStore((s) => s.setSpecFacets);
  const nearby = useDiscoverFiltersStore((s) => s.nearby);
  const radiusKm = useDiscoverFiltersStore((s) => s.radiusKm);
  const postedWithinDays = useDiscoverFiltersStore((s) => s.postedWithinDays);
  const setPostedWithinDays = useDiscoverFiltersStore(
    (s) => s.setPostedWithinDays,
  );
  const [locationParamsApplied, setLocationParamsApplied] = useState(() => {
    return !(
      searchParams.get("countyId") ||
      searchParams.get("subCountyId") ||
      searchParams.get("wardId")
    );
  });
  const initialLocationParams = useRef({
    countyId: searchParams.get("countyId"),
    subCountyId: searchParams.get("subCountyId"),
    wardId: searchParams.get("wardId"),
  });

  const parsedMinPrice = parsePriceFilter(minPrice);
  const parsedMaxPrice = parsePriceFilter(maxPrice);

  useEffect(() => {
    const initialSort = searchParams.get("sort");
    setSort(isDiscoverySort(initialSort) ? initialSort : "RELEVANCE");
    const initialType = searchParams.get("type");
    setSelectedType(isDiscoverContentType(initialType) ? initialType : null);
    setSelectedSubcategory(searchParams.get("subcategory")?.trim() || null);
    setMinPrice(searchParams.get("minPrice") ?? "");
    setMaxPrice(searchParams.get("maxPrice") ?? "");
    setNegotiableOnly(searchParams.get("negotiable") === "1");
    // The URL decides what Explore opens on. The filters store outlives the
    // page, so a category or region picked on an earlier visit would otherwise
    // still be applied — invisibly, now that category lives in the filters.
    // (A ?category= deep link is applied below once categories have loaded.)
    // Category first: setting it clears the spec filters, which come next.
    if (!searchParams.get("category")) setSelectedCategory(null);
    if (
      !searchParams.get("countyId") &&
      !searchParams.get("subCountyId") &&
      !searchParams.get("wardId")
    ) {
      setSelectedCounty(null);
    }
    setSpecs(parseSpecParams(searchParams.getAll("spec")));
    const posted = Number(searchParams.get("posted"));
    setPostedWithinDays(Number.isInteger(posted) && posted > 0 ? posted : null);
    // Mount only: query params seed the shared desktop sidebar filters once.
    // After that, the shared filter store owns changes and the URL mirror below
    // persists them without fighting user input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchDraft.trim();
      setQuery(next);
      // Search spans every category, so drop any category constraint when one
      // starts — otherwise results would be silently scoped to a category whose
      // bar is now hidden.
      if (next) {
        setSelectedCategory(null);
        setSelectedSubcategory(null);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchDraft]);

  // Subcategory tiles follow every filter EXCEPT the subcategory itself, so
  // picking a tile narrows the grid below without the row reshuffling under the
  // thumb that just tapped it. Built before the feed variables because the feed
  // depends on which tiles actually exist — see `subcategory` below.
  const subcategoryFacetVariables = useMemo(
    () => ({
      query: query || undefined,
      categoryId: selectedCategory?.id,
      type: selectedType ?? undefined,
      countyId: selectedCounty?.id,
      subCountyId: selectedSubCounty?.id,
      wardId: selectedWard?.id,
      minPrice: parsedMinPrice,
      maxPrice: parsedMaxPrice,
      negotiableOnly: negotiableOnly || undefined,
      latitude: nearby?.latitude,
      longitude: nearby?.longitude,
      radiusKm: nearby ? radiusKm : undefined,
      postedWithinDays: postedWithinDays ?? undefined,
    }),
    [
      query,
      selectedCategory?.id,
      selectedType,
      selectedCounty?.id,
      selectedSubCounty?.id,
      selectedWard?.id,
      parsedMinPrice,
      parsedMaxPrice,
      negotiableOnly,
      nearby,
      radiusKm,
      postedWithinDays,
    ],
  );

  const { data: subcategoryFacetsData } = useQuery(
    DISCOVERY_SUBCATEGORY_FACETS,
    {
      variables: subcategoryFacetVariables,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
  );

  const subcategories = useMemo(
    () => subcategoryFacetsData?.discoveryFacets.subcategories ?? [],
    [subcategoryFacetsData?.discoveryFacets.subcategories],
  );

  useEffect(() => {
    setStoreSubcategories(subcategories);
  }, [setStoreSubcategories, subcategories]);

  /**
   * The subcategory actually applied to the queries.
   *
   * Narrowing the location (or the search) can empty out the chosen
   * subcategory. Left alone that reads as a broken page: an empty grid with no
   * visibly selected tile to un-tap. Deriving it rather than clearing the state
   * in an effect means the stale name simply stops counting for as long as it
   * has no listings, and starts counting again if widening the filters brings
   * it back — no cascading render either way.
   */
  const subcategory =
    selectedSubcategory &&
    (!subcategoryFacetsData ||
      subcategories.some((item) => item.name === selectedSubcategory))
      ? selectedSubcategory
      : null;

  const feedVariables = useMemo<DiscoveryFeedVars>(
    () => ({
      query: query || undefined,
      categoryId: selectedCategory?.id,
      type: selectedType ?? undefined,
      subcategory: subcategory || undefined,
      countyId: selectedCounty?.id,
      subCountyId: selectedSubCounty?.id,
      wardId: selectedWard?.id,
      minPrice: parsedMinPrice,
      maxPrice: parsedMaxPrice,
      negotiableOnly: negotiableOnly || undefined,
      specs: specs.length > 0 ? specs : undefined,
      latitude: nearby?.latitude,
      longitude: nearby?.longitude,
      radiusKm: nearby ? radiusKm : undefined,
      postedWithinDays: postedWithinDays ?? undefined,
      sort,
      limit: PAGE_SIZE,
    }),
    [
      query,
      selectedCategory?.id,
      selectedType,
      subcategory,
      selectedCounty?.id,
      selectedSubCounty?.id,
      selectedWard?.id,
      parsedMinPrice,
      parsedMaxPrice,
      negotiableOnly,
      specs,
      nearby,
      radiusKm,
      postedWithinDays,
      sort,
    ],
  );

  const facetVariables = useMemo<DiscoveryFacetsVars>(
    () => ({
      query: query || undefined,
      categoryId: selectedCategory?.id,
      type: selectedType ?? undefined,
      subcategory: subcategory || undefined,
      countyId: selectedCounty?.id,
      subCountyId: selectedSubCounty?.id,
      wardId: selectedWard?.id,
      minPrice: parsedMinPrice,
      maxPrice: parsedMaxPrice,
      negotiableOnly: negotiableOnly || undefined,
      specs: specs.length > 0 ? specs : undefined,
      latitude: nearby?.latitude,
      longitude: nearby?.longitude,
      radiusKm: nearby ? radiusKm : undefined,
      postedWithinDays: postedWithinDays ?? undefined,
    }),
    [
      query,
      selectedCategory?.id,
      selectedType,
      subcategory,
      selectedCounty?.id,
      selectedSubCounty?.id,
      selectedWard?.id,
      parsedMinPrice,
      parsedMaxPrice,
      negotiableOnly,
      specs,
      nearby,
      radiusKm,
      postedWithinDays,
    ],
  );

  const { data, loading, error, fetchMore, refetch, networkStatus } = useQuery(
    DISCOVERY_FEED,
    {
      variables: feedVariables,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      // The discoveryFeed field policy needs `existing` during refetches so a
      // background page-1 refresh splices over the head of the accumulated
      // window instead of replacing it (Apollo's default is "overwrite").
      refetchWritePolicy: "merge",
      notifyOnNetworkStatusChange: true,
    },
  );

  // Category list loads once on mount and never refetches — it is independent
  // of the active query/category/location so the category bar stays stable.
  const { data: categoriesData } = useQuery(
    DISCOVERY_CATEGORIES,
    {
      fetchPolicy: "cache-first",
      nextFetchPolicy: "cache-first",
    },
  );

  // Location facets follow the active filters (their post counts depend on the
  // current query/category). Kept separate so they don't disturb categories.
  const { data: locationFacetsData, loading: locationFacetsLoading } = useQuery(
    DISCOVERY_LOCATION_FACETS,
    {
      variables: facetVariables,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
  );

  /** Picking a category drops the subcategory — it only means something inside its parent. */
  const selectCategory = useCallback((next: CategoryFacet | null) => {
    // The store also clears the spec filters: a new category has its own.
    setSelectedCategory(next);
    setSelectedSubcategory(null);
  }, []);

  const { data: resultCountData, loading: resultCountLoading } = useQuery(
    DISCOVERY_RESULT_COUNT,
    {
      variables: facetVariables,
      skip: !filterOpen,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
  );

  // Spec fields only exist inside a category. The desktop sidebar lists them
  // all the time; on a phone they're only needed while the drawer is open.
  const { data: specFacetsData, loading: specFacetsLoading } = useQuery(
    DISCOVERY_SPEC_FACETS,
    {
      variables: facetVariables,
      skip: (!selectedCategory && !subcategory) || (!isDesktop && !filterOpen),
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
  );
  const specFacets = useMemo(
    () =>
      selectedCategory || subcategory
        ? (specFacetsData?.discoverySpecFacets ?? [])
        : [],
    [selectedCategory, subcategory, specFacetsData?.discoverySpecFacets],
  );

  useEffect(() => {
    setStoreSpecFacets(specFacets);
  }, [setStoreSpecFacets, specFacets]);

  const items = data?.discoveryFeed.items ?? [];
  const pageInfo = data?.discoveryFeed.pageInfo;
  const locationFacets = locationFacetsData?.discoveryFacets;
  const isFetchingMore = networkStatus === NetworkStatus.fetchMore;
  // A full reload with nothing to show yet: the very first load, or a
  // filter/search/sort change whose combination has never been cached. A
  // revisit (or a previously used filter combo) has cached items, renders them
  // instantly, and refreshes silently in the background — no skeleton flash,
  // no scroll loss.
  const isReloading = loading && !isFetchingMore && items.length === 0;

  const itemCount = items.length;
  const guard = usePaginationGuard(itemCount);
  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    const cursor = pageInfo.endCursor;
    // The discoveryFeed cache field policy appends + dedupes the page; the
    // guard stops a duplicate-only page from re-requesting the same cursor
    // forever.
    guard(cursor, itemCount, () =>
      fetchMore({
        variables: {
          ...feedVariables,
          after: cursor,
        },
      }),
    );
  }, [fetchMore, feedVariables, pageInfo, guard, itemCount]);

  const { sentinelRef } = useInfiniteScroll({
    hasMore: pageInfo?.hasNextPage ?? false,
    loading: isFetchingMore,
    onLoadMore: loadMore,
    rootMargin: "1200px",
  });

  const locationLabel =
    selectedWard?.name ??
    selectedSubCounty?.name ??
    selectedCounty?.name ??
    "All Kenya";
  const locationDepth = locationSheetDepth(locationStep);
  const overlayDepth =
    (sortOpen ? 1 : 0) +
    (filterOpen ? 1 : 0) +
    (picker ? 1 : 0) +
    (askOpen ? 1 : 0) +
    locationDepth;
  // Count only what lives inside the filter sheet (location + price + negotiable);
  // category and sort have their own controls outside the sheet.
  const hasLocation = Boolean(
    selectedCounty || selectedSubCounty || selectedWard,
  );
  // Everything that narrows the results counts — category too, now that it
  // is chosen in the filters rather than shown as a tab.
  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (subcategory ? 1 : 0) +
    (selectedType ? 1 : 0) +
    (hasLocation ? 1 : 0) +
    (minPrice.trim() || maxPrice.trim() ? 1 : 0) +
    (negotiableOnly ? 1 : 0) +
    (nearby ? 1 : 0) +
    (postedWithinDays ? 1 : 0) +
    specs.length;
  const matchingResultCount = resultCountData?.discoveryResultCount;
  const resultButtonLabel =
    resultCountLoading && matchingResultCount == null
      ? "Show … results"
      : `Show ${formatResultCount(matchingResultCount ?? 0)} ${
          matchingResultCount === 1 ? "result" : "results"
        }`;

  // Bumped after every history step taken to close a drawer layer. Each layer
  // holds its own history entry, so filters changed inside the drawer were
  // written to that entry's URL — and stepping back to close it restored the
  // older URL without them. Re-running the URL mirror once the step has landed
  // writes them back onto the entry the page is left on.
  const [urlSyncTick, setUrlSyncTick] = useState(0);
  const overlayDepthRef = useRef(overlayDepth);
  const lastPushedOverlayDepthRef = useRef(overlayDepth);
  const ignoredPopStateCountRef = useRef(0);

  useEffect(() => {
    overlayDepthRef.current = overlayDepth;
  }, [overlayDepth]);

  const clearLocation = useCallback(() => {
    setSelectedCounty(null);
    setSelectedSubCounty(null);
    setSelectedWard(null);
  }, []);

  // Clear means back to defaults: every filter, the category and the sort.
  // (The search text stays — it isn't a filter.) Same as the desktop
  // sidebar's Clear, so both surfaces agree.
  const clearAllFilters = useDiscoverFiltersStore((s) => s.clearAll);
  const clearFilters = useCallback(() => {
    clearAllFilters();
  }, [clearAllFilters]);

  const clearSearch = useCallback(() => {
    setSearchDraft("");
    setQuery("");
  }, [setSearchDraft]);

  const closeTopOverlayState = useCallback(() => {
    if (askOpen) {
      setAskOpen(false);
      return;
    }
    if (locationStep === "ward") {
      setLocationStep("subcounty");
      return;
    }
    if (locationStep === "subcounty") {
      setLocationStep("county");
      return;
    }
    if (locationStep === "county") {
      setLocationStep(null);
      return;
    }
    if (picker) {
      setPicker(null);
      return;
    }
    if (filterOpen) {
      setFilterOpen(false);
      return;
    }
    if (sortOpen) setSortOpen(false);
  }, [askOpen, filterOpen, locationStep, picker, sortOpen]);

  const closeTopOverlayStateRef = useRef(closeTopOverlayState);

  useEffect(() => {
    closeTopOverlayStateRef.current = closeTopOverlayState;
  }, [closeTopOverlayState]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onPopState = () => {
      if (ignoredPopStateCountRef.current > 0) {
        ignoredPopStateCountRef.current -= 1;
        setUrlSyncTick((tick) => tick + 1);
        return;
      }

      if (overlayDepthRef.current > 0) {
        closeTopOverlayStateRef.current();
        setUrlSyncTick((tick) => tick + 1);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const previousDepth = lastPushedOverlayDepthRef.current;
    if (overlayDepth > previousDepth) {
      for (let i = 0; i < overlayDepth - previousDepth; i += 1) {
        window.history.pushState({ discoverMobileSheet: true }, "");
      }
    }

    lastPushedOverlayDepthRef.current = overlayDepth;
  }, [overlayDepth]);

  const requestHistoryClose = useCallback((delta = 1) => {
    if (typeof window === "undefined") return;
    ignoredPopStateCountRef.current += 1;
    if (delta > 1) {
      window.history.go(-delta);
      return;
    }
    window.history.back();
  }, []);

  const openFilterSheet = useCallback(() => {
    setSortOpen(false);
    setFilterOpen(true);
  }, []);

  /**
   * Close the whole filter drawer, whatever view it is on — the drawer, an
   * option list and up to three location steps each hold a history entry, and
   * all of them go at once.
   */
  const closeFilterSheet = useCallback(() => {
    const depth =
      (filterOpen ? 1 : 0) + (picker ? 1 : 0) + locationSheetDepth(locationStep);
    if (depth === 0) return;
    setFilterOpen(false);
    setPicker(null);
    setLocationStep(null);
    setLocationSearch("");
    requestHistoryClose(depth);
  }, [filterOpen, locationStep, picker, requestHistoryClose]);

  const openAsk = useCallback(() => {
    setSortOpen(false);
    setAskOpen(true);
  }, []);

  const closeAsk = useCallback(() => {
    if (!askOpen) return;
    setAskOpen(false);
    requestHistoryClose();
  }, [askOpen, requestHistoryClose]);

  // The chat's message box owns the bottom of the screen while it's open.
  useEffect(() => {
    if (!askOpen) return;
    setBottomNavHidden(true);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Esc belongs to whatever sits on top: with the chat's history panel
      // open, it closes the panel, not the whole chat.
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;
      closeAsk();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      setBottomNavHidden(false);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [askOpen, closeAsk, setBottomNavHidden]);

  const openPicker = useCallback((next: FilterPicker) => {
    setPicker(next);
  }, []);

  /** Back from an option list to the field list. */
  const closePicker = useCallback(() => {
    if (!picker) return;
    setPicker(null);
    requestHistoryClose();
  }, [picker, requestHistoryClose]);

  const openSortSheet = useCallback(() => {
    setFilterOpen(false);
    setLocationStep(null);
    setSortOpen(true);
  }, []);

  const closeSortSheet = useCallback(() => {
    if (!sortOpen) return;
    setSortOpen(false);
    requestHistoryClose();
  }, [requestHistoryClose, sortOpen]);

  const openCountySheet = useCallback(() => {
    setSortOpen(false);
    setLocationStep("county");
    setLocationSearch("");
  }, []);

  const handledLocationRequestRef = useRef(requestLocationPicker);
  useEffect(() => {
    if (requestLocationPicker === handledLocationRequestRef.current) return;
    handledLocationRequestRef.current = requestLocationPicker;
    openCountySheet();
  }, [openCountySheet, requestLocationPicker]);

  const collapseLocationSheets = useCallback(() => {
    const depth = locationSheetDepth(locationStep);
    if (depth === 0) return;
    setLocationStep(null);
    requestHistoryClose(depth);
  }, [locationStep, requestHistoryClose]);

  // Tapping a row's name/body only marks it the active choice for the step
  // it's on — it doesn't navigate or close. The sticky footer at the bottom of
  // each step reads whichever selection is currently active and is the one
  // thing that actually applies it and closes the picker. The chevron on a
  // county/subcounty row is the only thing that drills in one level.
  const selectNationwide = useCallback(() => {
    clearLocation();
  }, [clearLocation]);

  const handleCountySelection = useCallback((item: LocationFacet) => {
    setSelectedCounty(item);
    setSelectedSubCounty(null);
    setSelectedWard(null);
  }, []);

  const drillIntoSubcounties = useCallback((item: LocationFacet) => {
    setSelectedCounty(item);
    setSelectedSubCounty(null);
    setSelectedWard(null);
    setLocationStep("subcounty");
    setLocationSearch("");
  }, []);

  const handleSubCountySelection = useCallback((item: LocationFacet) => {
    setSelectedSubCounty(item);
    setSelectedWard(null);
  }, []);

  const drillIntoWards = useCallback((item: LocationFacet) => {
    setSelectedSubCounty(item);
    setSelectedWard(null);
    setLocationStep("ward");
    setLocationSearch("");
  }, []);

  const handleWardSelection = useCallback((item: LocationFacet) => {
    setSelectedWard(item);
  }, []);

  const stepBackLocationSheet = useCallback(() => {
    setLocationSearch("");
    if (locationStep === "ward") {
      setLocationStep("subcounty");
      requestHistoryClose();
      return;
    }
    if (locationStep === "subcounty") {
      setLocationStep("county");
      requestHistoryClose();
      return;
    }
    if (locationStep === "county") {
      setLocationStep(null);
      requestHistoryClose();
    }
  }, [locationStep, requestHistoryClose]);

  const subCountySheetTitle = selectedCounty?.name ?? "Subcounties";
  const wardSheetTitle = selectedSubCounty?.name ?? "Wards";
  const wardSheetSubtitle = selectedSubCounty
    ? `Choose a ward inside ${selectedSubCounty.name}.`
    : "Choose the most precise place for these results.";

  const categories = useMemo(
    () => categoriesData?.discoveryFacets.categories ?? [],
    [categoriesData?.discoveryFacets.categories],
  );

  // Deep-link support: /explore?category=<slug> (e.g. from the SideNav Browse
  // list) preselects that category. Applied once per param value — the ref
  // stops it re-asserting after the user clears or switches categories in-page.
  const categoryParam = searchParams.get("category");
  const appliedCategoryParam = useRef<string | null>(null);
  useEffect(() => {
    if (!categoryParam) {
      appliedCategoryParam.current = null;
      return;
    }
    if (appliedCategoryParam.current === categoryParam) return;
    const match = categories.find(
      (c) => c.slug === categoryParam || c.id === categoryParam,
    );
    // Categories may still be loading — leave the param pending until they
    // arrive; an unknown slug simply never matches and is ignored.
    if (!match) return;
    appliedCategoryParam.current = categoryParam;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCategory(match);
    // A deep link means "show me this category" — a leftover search query
    // would hide the category bar and scope results, so clear it.
    setSearchDraft("");
    setQuery("");
  }, [categoryParam, categories, setSearchDraft, setSelectedCategory]);

  const counties = useMemo(
    () => locationFacets?.counties ?? [],
    [locationFacets?.counties],
  );
  const subCounties = useMemo(
    () => locationFacets?.subCounties ?? [],
    [locationFacets?.subCounties],
  );
  const wards = useMemo(
    () => locationFacets?.wards ?? [],
    [locationFacets?.wards],
  );
  const nationwideCount = useMemo(
    () => counties.reduce((sum, item) => sum + item.count, 0),
    [counties],
  );

  // Client-side filter for whichever list the location picker is currently
  // showing — the facets are already fully loaded, so there's no round trip.
  const locationSearchTerm = locationSearch.trim().toLowerCase();
  const filteredCounties = useMemo(
    () =>
      locationSearchTerm
        ? counties.filter((item) =>
            item.name.toLowerCase().includes(locationSearchTerm),
          )
        : counties,
    [counties, locationSearchTerm],
  );
  const filteredSubCounties = useMemo(
    () =>
      locationSearchTerm
        ? subCounties.filter((item) =>
            item.name.toLowerCase().includes(locationSearchTerm),
          )
        : subCounties,
    [subCounties, locationSearchTerm],
  );
  const filteredWards = useMemo(
    () =>
      locationSearchTerm
        ? wards.filter((item) =>
            item.name.toLowerCase().includes(locationSearchTerm),
          )
        : wards,
    [wards, locationSearchTerm],
  );

  useEffect(() => {
    if (locationParamsApplied) return;

    const { countyId, subCountyId, wardId } = initialLocationParams.current;
    const county = countyId
      ? counties.find((item) => item.id === countyId || item.slug === countyId)
      : null;
    const subCounty = subCountyId
      ? subCounties.find(
          (item) => item.id === subCountyId || item.slug === subCountyId,
        )
      : null;
    const ward = wardId
      ? wards.find((item) => item.id === wardId || item.slug === wardId)
      : null;

    if (countyId && !county) return;
    if (subCountyId && !subCounty) return;
    if (wardId && !ward) return;

    if (county) setSelectedCounty(county);
    if (subCounty) setSelectedSubCounty(subCounty);
    if (ward) setSelectedWard(ward);
    setLocationParamsApplied(true);
  }, [counties, locationParamsApplied, subCounties, wards]);

  // Keep share/reload-worthy filters in the URL and use Next navigation so
  // other client components (notably the desktop sidebar) see changes.
  useEffect(() => {
    if (categoryParam && appliedCategoryParam.current !== categoryParam) return;
    if (!locationParamsApplied) return;

    // Read the filters from the store as they are NOW, not from this render.
    // On arrival the reset above clears a stale category in the same commit
    // this effect runs in; the render's values still held it, and writing them
    // back into the URL was then picked up as a ?category= deep link and
    // re-selected the old category.
    const live = useDiscoverFiltersStore.getState();
    const params = new URLSearchParams(window.location.search);
    const setOrDelete = (key: string, value: string | null) => {
      if (value) params.set(key, value);
      else params.delete(key);
    };

    setOrDelete("q", query || null);
    setOrDelete("category", live.selectedCategory?.slug ?? null);
    setOrDelete("type", live.selectedType ?? null);
    setOrDelete("subcategory", live.selectedSubcategory || null);
    setOrDelete("sort", live.sort === "RELEVANCE" ? null : live.sort);
    setOrDelete("countyId", live.selectedCounty?.id ?? null);
    setOrDelete("subCountyId", live.selectedSubCounty?.id ?? null);
    setOrDelete("wardId", live.selectedWard?.id ?? null);
    setOrDelete("minPrice", live.minPrice.trim() || null);
    setOrDelete("maxPrice", live.maxPrice.trim() || null);
    setOrDelete("negotiable", live.negotiableOnly ? "1" : null);
    params.delete("spec");
    for (const spec of live.specs) params.append("spec", `${spec.key}:${spec.value}`);
    setOrDelete(
      "posted",
      live.postedWithinDays ? String(live.postedWithinDays) : null,
    );

    appliedCategoryParam.current = live.selectedCategory?.slug ?? null;

    const qs = params.toString();
    const next = `${pathname}${qs ? `?${qs}` : ""}`;
    const current = `${window.location.pathname}${window.location.search}`;
    if (next !== current) {
      router.replace(next, { scroll: false });
    }
  }, [
    categoryParam,
    locationParamsApplied,
    maxPrice,
    minPrice,
    negotiableOnly,
    pathname,
    query,
    router,
    selectedCategory,
    selectedCounty,
    selectedSubcategory,
    selectedSubCounty,
    selectedType,
    selectedWard,
    sort,
    specs,
    postedWithinDays,
    urlSyncTick,
  ]);


  return (
    <div className="min-h-svh bg-app pb-24 md:pb-8">
      <div className="mx-auto w-full lg:max-w-390 lg:px-8 lg:pt-4">
        <main className="min-w-0">
          <div className="sticky top-0 z-30 border-b border-default bg-app/92 backdrop-blur-md lg:hidden">
            <div className="flex items-center gap-2 px-4 pb-3 pt-3 lg:px-0 lg:pt-0">
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
                  className="h-5 min-w-0 flex-1 bg-transparent text-sm text-default outline-none  placeholder:text-muted-foreground"
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
                ) : SHOW_ASK_SHOPI ? (
                  // Ask Shopi is another way to search — describe it or send a
                  // photo — so it lives in the search field, not the filters.
                  <button
                    type="button"
                    onClick={openAsk}
                    className="-my-1 -mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-primary active:bg-primary/10"
                    aria-label="Ask Shopi — describe what you want"
                  >
                    <Sparkles size={17} />
                  </button>
                ) : null}
              </div>

              {/* Sort + Filter icon buttons — opposite the search bar */}
              <button
                type="button"
                onClick={openSortSheet}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors lg:hidden",
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
                onClick={openFilterSheet}
                className={cn(
                  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors lg:hidden",
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

          </div>

          <div className="min-w-0">
            {/* No category tabs or subcategory tiles here: Category and
              Subcategory are fields in the filters (the drawer on a phone,
              the sidebar on desktop), which keeps the top of the page to the
              search bar and the results. */}

            {error && items.length === 0 ? (
              <div className="px-4 py-12 lg:px-0">
                <div className="rounded-[22px] border border-default bg-app p-6 text-center">
                  <p className="text-base font-semibold text-default">
                    Couldn&apos;t load Discover
                  </p>
                  <p className="app-subcopy mt-2">
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

            {/* A full reload (filter/search/sort change) — NOT pagination — is in
              flight. Show only the skeleton; the stale results grid below is
              hidden so we never stack old items under a loader. */}
            {isReloading && <DiscoverFeedSkeleton />}

            {!loading && items.length === 0 && !error ? (
              <EmptyState
                title="No posts match this search"
                body="Try a broader keyword, another category, or a wider location around you."
              />
            ) : null}

            {!isReloading && items.length > 0 ? (
              <div className="px-4 pb-6 pt-3 lg:px-0">
                {/* Only a search gets a heading now. The old one labelled the
                  default state "Listings picked for discovery" over "Across
                  Kenya", which restated what the page already is and what the
                  location control already shows — two lines of chrome above
                  every visit. A hairline does the separating instead. */}
                {query ? (
                  <p className="mb-3 text-sm font-semibold text-default">
                    Results for “{query}”
                  </p>
                ) : (
                  // `border-border`, not `border-default`: the latter is a
                  // hand-written class in globals.css rather than a theme token,
                  // so Tailwind cannot apply an opacity modifier to it — the
                  // `/60` was dropped and the border fell back to currentColor,
                  // which painted a near-black line instead of a hairline.
                  <div className="mb-4 border-t border-border/60" />
                )}

                <div className={DISCOVER_GRID}>
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

                {isFetchingMore ? <FeedLoader /> : null}

                {!pageInfo?.hasNextPage ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    You&apos;ve seen the latest matches.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </main>
      </div>

      {(() => {
        // The footer always mirrors the deepest currently-active choice for
        // this step, whether that came from tapping a row on this screen or
        // from the parent step that got you here.
        const countyFooterFacet = selectedCounty;
        const subcountyFooterFacet = selectedSubCounty ?? selectedCounty;
        const wardFooterFacet = selectedWard ?? selectedSubCounty;

        const countySearchEmpty =
          locationSearchTerm.length > 0 && filteredCounties.length === 0;
        const countyBody = (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <LocationSearchInput
                value={locationSearch}
                onChange={setLocationSearch}
                placeholder="Search counties"
              />

              {!locationSearchTerm ? (
                <button
                  type="button"
                  onClick={selectNationwide}
                  disabled={nationwideCount === 0}
                  className={cn(
                    "mb-2 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    !hasLocation
                      ? "border-primary bg-primary/5"
                      : "border-default bg-app",
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-default">
                      All Kenya
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {nationwideCount}{" "}
                      {nationwideCount === 1 ? "item" : "items"} available
                      nationwide
                    </p>
                  </div>
                  {!hasLocation ? (
                    <Check size={18} className="text-primary" />
                  ) : null}
                </button>
              ) : null}

              <div className="space-y-2">
                {countySearchEmpty ? (
                  <p className="rounded-2xl border border-dashed border-default px-4 py-3 text-sm leading-6 text-muted-foreground">
                    {`No counties match "${locationSearch.trim()}".`}
                  </p>
                ) : (
                  filteredCounties.map((item) => (
                    <LocationOption
                      key={item.id}
                      item={item}
                      active={selectedCounty?.id === item.id}
                      indicator="chevron"
                      onSelect={() => handleCountySelection(item)}
                      onDrillIn={() => drillIntoSubcounties(item)}
                    />
                  ))
                )}
              </div>
            </div>
            <LocationStepFooter
              count={
                countyFooterFacet ? countyFooterFacet.count : nationwideCount
              }
              label={
                countyFooterFacet
                  ? `in ${countyFooterFacet.name}`
                  : "nationwide"
              }
              onConfirm={collapseLocationSheets}
            />
          </>
        );

        // Loading is only trusted as "still fetching" when there's nothing to
        // show yet — a background refetch of an already-populated list (e.g.
        // switching sort) shouldn't flash a skeleton over rows already on screen.
        const subCountiesLoading =
          subCounties.length === 0 && locationFacetsLoading;
        const subcountySearchEmpty =
          !subCountiesLoading &&
          subCounties.length > 0 &&
          locationSearchTerm.length > 0 &&
          filteredSubCounties.length === 0;
        const subcountyBody = (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {subCounties.length > 0 || subCountiesLoading ? (
                <LocationSearchInput
                  value={locationSearch}
                  onChange={setLocationSearch}
                  placeholder="Search subcounties"
                />
              ) : null}

              <div className="space-y-2">
                {subCountiesLoading ? (
                  <LocationOptionSkeletonList />
                ) : subCounties.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-default px-4 py-3 text-sm leading-6 text-muted-foreground">
                    No subcounty clusters yet for this county. You can keep the
                    county selection and continue browsing.
                  </p>
                ) : subcountySearchEmpty ? (
                  <p className="rounded-2xl border border-dashed border-default px-4 py-3 text-sm leading-6 text-muted-foreground">
                    {`No subcounties match "${locationSearch.trim()}".`}
                  </p>
                ) : (
                  filteredSubCounties.map((item) => (
                    <LocationOption
                      key={item.id}
                      item={item}
                      active={selectedSubCounty?.id === item.id}
                      indicator="chevron"
                      onSelect={() => handleSubCountySelection(item)}
                      onDrillIn={() => drillIntoWards(item)}
                    />
                  ))
                )}
              </div>
            </div>
            {subcountyFooterFacet ? (
              <LocationStepFooter
                count={subcountyFooterFacet.count}
                label={`in ${subcountyFooterFacet.name}`}
                onConfirm={collapseLocationSheets}
              />
            ) : null}
          </>
        );

        const wardsLoading = wards.length === 0 && locationFacetsLoading;
        const wardSearchEmpty =
          !wardsLoading &&
          wards.length > 0 &&
          locationSearchTerm.length > 0 &&
          filteredWards.length === 0;
        const wardBody = (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {wards.length > 0 || wardsLoading ? (
                <LocationSearchInput
                  value={locationSearch}
                  onChange={setLocationSearch}
                  placeholder="Search wards"
                />
              ) : null}

              <div className="space-y-2">
                {wardsLoading ? (
                  <LocationOptionSkeletonList />
                ) : wards.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-default px-4 py-3 text-sm leading-6 text-muted-foreground">
                    Ward-level options will show up here whenever listings are
                    tagged that precisely.
                  </p>
                ) : wardSearchEmpty ? (
                  <p className="rounded-2xl border border-dashed border-default px-4 py-3 text-sm leading-6 text-muted-foreground">
                    {`No wards match "${locationSearch.trim()}".`}
                  </p>
                ) : (
                  filteredWards.map((item) => (
                    <LocationOption
                      key={item.id}
                      item={item}
                      active={selectedWard?.id === item.id}
                      onSelect={() => handleWardSelection(item)}
                    />
                  ))
                )}
              </div>
            </div>
            {wardFooterFacet ? (
              <LocationStepFooter
                count={wardFooterFacet.count}
                label={`in ${wardFooterFacet.name}`}
                onConfirm={collapseLocationSheets}
              />
            ) : null}
          </>
        );

        const countyClearAction = hasLocation ? (
          <button
            type="button"
            onClick={clearLocation}
            className="h-9 shrink-0 rounded-full px-3 text-xs font-semibold text-primary"
          >
            Clear
          </button>
        ) : undefined;

        const locationViews: Record<
          LocationSheetStep,
          { title: string; subtitle: string; action?: ReactNode; body: ReactNode }
        > = {
          county: {
            title: "Choose county",
            subtitle: "Start broad, then drill into the exact place.",
            action: countyClearAction,
            body: countyBody,
          },
          subcounty: {
            title: subCountySheetTitle,
            subtitle: "Pick a subcounty, or keep the whole county selected.",
            body: subcountyBody,
          },
          ward: {
            title: wardSheetTitle,
            subtitle: wardSheetSubtitle,
            body: wardBody,
          },
        };
        const locationView = locationStep ? locationViews[locationStep] : null;

        // Desktop, opened from the sidebar: one centered dialog whose content
        // swaps per step. Escape/backdrop click closes the whole picker; the
        // header's back chevron steps back one level at a time. Opened from
        // the filter drawer (tablet widths), it lives inside the drawer instead.
        const locationDialog = isDesktop ? (
          <Dialog
            open={locationDepth >= 1 && !filterOpen}
            onOpenChange={(open) => {
              if (!open) collapseLocationSheets();
            }}
          >
            <DialogContent className="flex h-[min(80svh,640px)] w-[min(92vw,480px)] max-w-none flex-col gap-0 overflow-hidden rounded-3xl bg-app p-0 [&>button:last-of-type]:hidden">
              {locationView ? (
                <>
                  <LocationSheetHeader
                    title={locationView.title}
                    subtitle={locationView.subtitle}
                    onBack={stepBackLocationSheet}
                    action={locationView.action}
                  />
                  {locationView.body}
                </>
              ) : null}
            </DialogContent>
          </Dialog>
        ) : null;

        // Mobile: ONE bottom drawer. The field list, each field's option list
        // and the county → subcounty → ward steps are views inside it, so
        // nothing stacks on top of anything — back steps between views, and
        // swiping down closes the lot.
        const drawerOpen = filterOpen || (!isDesktop && locationDepth >= 1);
        let drawerView: ReactNode;
        if (locationView) {
          drawerView = (
            <>
              <FilterDrawerHeader
                title={locationView.title}
                subtitle={locationView.subtitle}
                onBack={stepBackLocationSheet}
                action={locationView.action}
              />
              {locationView.body}
            </>
          );
        } else if (picker) {
          drawerView = (
            <FilterPickerView
              picker={picker}
              categories={categories}
              selectedCategory={selectedCategory}
              subcategories={subcategories}
              selectedSubcategory={subcategory}
              specFacets={specFacets}
              specs={specs}
              postedWithinDays={postedWithinDays}
              onBack={closePicker}
              onPickPosted={(days) => {
                setPostedWithinDays(days);
                closePicker();
              }}
              onPickCategory={(next) => {
                selectCategory(next);
                closePicker();
              }}
              onPickSubcategory={(next) => {
                setSelectedSubcategory(next);
                closePicker();
              }}
              onPickSpec={(key, value) => {
                setSpec(key, value);
                closePicker();
              }}
            />
          );
        } else {
          drawerView = (
            <FilterFieldList
              categoryLabel={selectedCategory?.name ?? "All categories"}
              subcategoryLabel={
                selectedCategory && subcategories.length > 0
                  ? (subcategory ?? `All ${selectedCategory.name}`)
                  : null
              }
              regionLabel={locationLabel}
              postedLabel={postedWithinLabel(postedWithinDays)}
              specFacets={specFacets}
              specFacetsLoading={
                specFacetsLoading && specFacets.length === 0 && Boolean(selectedCategory || subcategory)
              }
              specs={specs}
              negotiableOnly={negotiableOnly}
              onNegotiableOnly={setNegotiableOnly}
              onOpenPicker={openPicker}
              onOpenRegion={openCountySheet}
              onClose={closeFilterSheet}
              onClear={clearFilters}
              canClear={activeFilterCount > 0 || sort !== "RELEVANCE"}
              resultLabel={resultButtonLabel}
            />
          );
        }

        return (
          <>
            {locationDialog}
            <Drawer
              open={drawerOpen}
              onOpenChange={(open) => {
                if (!open) closeFilterSheet();
              }}
            >
              <DrawerContent className="mx-auto h-[88svh] w-full max-w-107.5 bg-app">
                <div className="flex min-h-0 flex-1 flex-col">{drawerView}</div>
              </DrawerContent>
            </Drawer>
          </>
        );
      })()}

      {AskShopiGrid && askOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ask Shopi"
          className="fixed inset-0 z-90 overflow-y-auto overscroll-contain bg-surface"
        >
          <AskShopiGrid lang={lang} active onClose={closeAsk} />
        </div>
      ) : null}

      <Drawer
        open={sortOpen}
        onOpenChange={(open) => {
          if (open) {
            openSortSheet();
            return;
          }
          if (sortOpen) closeSortSheet();
        }}
      >
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
                  closeSortSheet();
                }}
              />
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
