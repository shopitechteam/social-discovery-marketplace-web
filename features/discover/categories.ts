import { gql, type TypedDocumentNode } from "@apollo/client";

export type CategoryFacet = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  count: number;
};

export type DiscoveryCategoriesData = {
  discoveryFacets: { categories: CategoryFacet[] };
};

// Category list — fetched with NO filter variables so it is stable and shared
// (same cache entry) between the explore page's category bar and the SideNav
// Browse list.
export const DISCOVERY_CATEGORIES: TypedDocumentNode<
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
