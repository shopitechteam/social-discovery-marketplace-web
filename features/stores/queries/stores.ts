import { gql } from "@apollo/client";

/**
 * The Stores directory documents and types.
 *
 * A "store" is a seller's public storefront at /{lang}/@{username} — there is
 * no separate store record on the API. These queries index those storefronts by
 * the listings behind them, so every number on a card is live stock rather than
 * something a seller typed once.
 *
 * Deliberately free of any server-only import: StoresPage is a client component
 * and pulls these documents into the browser bundle. The server-side fetchers
 * live in ./stores.server, which imports the registered Apollo client and must
 * never be reachable from a "use client" module.
 */
export const STORES_QUERY = gql`
  query Stores($input: StoreDirectoryInput) {
    stores(input: $input) {
      total
      hasMore
      nextOffset
      stores {
        id
        username
        displayName
        avatar
        headline
        isVerified
        county
        placeName
        listingCount
        totalViews
        lastListedAt
        memberSince
        previewImages
      }
    }
  }
`;

export const STORE_COUNTIES_QUERY = gql`
  query StoreCounties {
    storeCounties
  }
`;

export type StoreSort = "LISTINGS" | "RECENT" | "POPULAR";

export type StoreCard = {
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
  headline?: string | null;
  isVerified: boolean;
  county?: string | null;
  /** Neighbourhood or landmark, e.g. "The Bazaar" — finer-grained than county. */
  placeName?: string | null;
  listingCount: number;
  totalViews: number;
  lastListedAt: string;
  memberSince: string;
  previewImages: string[];
};

export type StoreDirectoryPage = {
  stores: StoreCard[];
  total: number;
  hasMore: boolean;
  nextOffset?: number | null;
};

export type StoreFilters = {
  search?: string;
  county?: string;
  sort?: StoreSort;
  verifiedOnly?: boolean;
  limit?: number;
  offset?: number;
};

export const EMPTY_STORE_PAGE: StoreDirectoryPage = {
  stores: [],
  total: 0,
  hasMore: false,
  nextOffset: null,
};
