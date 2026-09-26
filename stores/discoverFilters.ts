import { create } from "zustand";

export type DiscoverSort =
  | "RELEVANCE"
  | "NEWEST"
  | "PRICE_LOW_TO_HIGH"
  | "PRICE_HIGH_TO_LOW";

export type DiscoverContentType = "IMAGE" | "VIDEO";

export type DiscoverCategory = {
  id: string;
  name: string;
  slug: string;
};

export type DiscoverLocation = DiscoverCategory & {
  count?: number;
  countyId?: string | null;
  subCountyId?: string | null;
};

export type DiscoverSubcategory = {
  name: string;
  count: number;
};

/** A spec filter, e.g. { key: "make", value: "Toyota" }. Keys are canonical. */
export type DiscoverSpecFilter = { key: string; value: string };

/** A filterable spec field in the current category, with value counts. */
export type DiscoverSpecFacet = {
  key: string;
  label: string;
  values: Array<{ value: string; count: number }>;
};

/** Centre of the distance filter — the viewer's position when they asked. */
export type DiscoverNearby = { latitude: number; longitude: number };

/** Radius stops the distance slider moves between, in km. */
export const DISTANCE_STOPS_KM = [1, 2, 5, 10, 20, 30, 50, 100] as const;
export const DEFAULT_RADIUS_KM = 10;

type DiscoverFilterState = {
  selectedCategory: DiscoverCategory | null;
  selectedSubcategory: string | null;
  selectedCounty: DiscoverLocation | null;
  selectedSubCounty: DiscoverLocation | null;
  selectedWard: DiscoverLocation | null;
  selectedType: DiscoverContentType | null;
  sort: DiscoverSort;
  minPrice: string;
  maxPrice: string;
  negotiableOnly: boolean;
  specs: DiscoverSpecFilter[];
  /** Distance filter centre; null means "anywhere". Never put in the URL. */
  nearby: DiscoverNearby | null;
  radiusKm: number;
  postedWithinDays: number | null;
  subcategories: DiscoverSubcategory[];
  specFacets: DiscoverSpecFacet[];
  requestLocationPicker: number;
  setSelectedCategory: (category: DiscoverCategory | null) => void;
  setSelectedSubcategory: (subcategory: string | null) => void;
  setSelectedCounty: (county: DiscoverLocation | null) => void;
  setSelectedSubCounty: (subCounty: DiscoverLocation | null) => void;
  setSelectedWard: (ward: DiscoverLocation | null) => void;
  setSelectedType: (type: DiscoverContentType | null) => void;
  setSort: (sort: DiscoverSort) => void;
  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;
  setNegotiableOnly: (value: boolean) => void;
  setSpec: (key: string, value: string | null) => void;
  setSpecs: (specs: DiscoverSpecFilter[]) => void;
  /** Turning distance on clears the region: "near me" and "in Kisumu" conflict. */
  setNearby: (nearby: DiscoverNearby | null) => void;
  setRadiusKm: (radiusKm: number) => void;
  setPostedWithinDays: (days: number | null) => void;
  setSubcategories: (subcategories: DiscoverSubcategory[]) => void;
  setSpecFacets: (specFacets: DiscoverSpecFacet[]) => void;
  openLocationPicker: () => void;
  clearLocation: () => void;
  clearFilters: () => void;
  clearAll: () => void;
};

const initial = {
  selectedCategory: null,
  selectedSubcategory: null,
  selectedCounty: null,
  selectedSubCounty: null,
  selectedWard: null,
  selectedType: null,
  sort: "RELEVANCE" as DiscoverSort,
  minPrice: "",
  maxPrice: "",
  negotiableOnly: false,
  specs: [] as DiscoverSpecFilter[],
  nearby: null,
  radiusKm: DEFAULT_RADIUS_KM,
  postedWithinDays: null,
  subcategories: [],
  specFacets: [] as DiscoverSpecFacet[],
  requestLocationPicker: 0,
};

export const useDiscoverFiltersStore = create<DiscoverFilterState>((set) => ({
  ...initial,
  // Make/Model belong to Cars, Size to Fashion — a new category's spec fields
  // start empty.
  setSelectedCategory: (selectedCategory) =>
    set({ selectedCategory, selectedSubcategory: null, specs: [] }),
  setSelectedSubcategory: (selectedSubcategory) =>
    set({ selectedSubcategory }),
  setSelectedCounty: (selectedCounty) =>
    set((state) => ({
      selectedCounty,
      selectedSubCounty: null,
      selectedWard: null,
      // Picking a region replaces a distance filter, and vice versa.
      nearby: selectedCounty ? null : state.nearby,
    })),
  setSelectedSubCounty: (selectedSubCounty) =>
    set({ selectedSubCounty, selectedWard: null }),
  setSelectedWard: (selectedWard) => set({ selectedWard }),
  setSelectedType: (selectedType) => set({ selectedType }),
  setSort: (sort) => set({ sort }),
  setMinPrice: (minPrice) => set({ minPrice }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  setNegotiableOnly: (negotiableOnly) => set({ negotiableOnly }),
  setSpec: (key, value) =>
    set((state) => {
      const rest = state.specs.filter((spec) => spec.key !== key);
      return { specs: value ? [...rest, { key, value }] : rest };
    }),
  setSpecs: (specs) => set({ specs }),
  setNearby: (nearby) =>
    set(
      nearby
        ? { nearby, selectedCounty: null, selectedSubCounty: null, selectedWard: null }
        : { nearby: null },
    ),
  setRadiusKm: (radiusKm) => set({ radiusKm }),
  setPostedWithinDays: (postedWithinDays) => set({ postedWithinDays }),
  setSubcategories: (subcategories) => set({ subcategories }),
  setSpecFacets: (specFacets) => set({ specFacets }),
  openLocationPicker: () =>
    set((state) => ({ requestLocationPicker: state.requestLocationPicker + 1 })),
  clearLocation: () =>
    set({ selectedCounty: null, selectedSubCounty: null, selectedWard: null }),
  clearFilters: () =>
    set({
      selectedType: null,
      selectedCounty: null,
      selectedSubCounty: null,
      selectedWard: null,
      minPrice: "",
      maxPrice: "",
      negotiableOnly: false,
      specs: [],
      nearby: null,
      radiusKm: DEFAULT_RADIUS_KM,
      postedWithinDays: null,
    }),
  // Facets describe the page, not the user's choices — clearing keeps them.
  // So does the location-picker request counter: it is an event, and resetting
  // it would look like a new request and pop the picker open.
  clearAll: () =>
    set((state) => ({
      ...initial,
      subcategories: state.subcategories,
      specFacets: state.specFacets,
      requestLocationPicker: state.requestLocationPicker,
    })),
}));
