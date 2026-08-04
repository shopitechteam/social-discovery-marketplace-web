import { gql } from "@apollo/client";
import { query } from "@/lib/apollo/ApolloClient";

/**
 * A small, server-fetchable slice of the discovery feed.
 *
 * Deliberately narrower than the feed's own query — this exists to give the
 * browse routes crawlable content and outbound links, not to render media.
 */
const RECENT_LISTINGS = gql`
  query SeoRecentListings($limit: Int, $county: String) {
    discoveryFeed(sort: NEWEST, limit: $limit, county: $county) {
      items {
        id
        slug
        title
        price {
          amount
          currency
        }
        location {
          placeName
          county
        }
      }
    }
  }
`;

export type RecentListing = {
  id: string;
  slug?: string | null;
  title?: string | null;
  price?: { amount: number; currency: string } | null;
  location?: { placeName?: string | null; county?: string | null } | null;
};

/**
 * Best-effort: the browse pages must still render if the API is unreachable,
 * so a failure yields an empty list rather than throwing the route.
 */
export async function fetchRecentListings(
  limit = 24,
  county?: string,
): Promise<RecentListing[]> {
  try {
    const { data } = await query({
      query: RECENT_LISTINGS,
      variables: { limit, county: county ?? null },
    });
    const items = (
      data as { discoveryFeed?: { items?: RecentListing[] } } | undefined
    )?.discoveryFeed?.items;
    return (items ?? []).filter((i) => i?.id);
  } catch {
    return [];
  }
}
