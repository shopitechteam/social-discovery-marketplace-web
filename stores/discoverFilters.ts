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
  subcategories: DiscoverSubcategory[];
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
  setSubcategories: (subcategories: DiscoverSubcategory[]) => void;
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
  subcategories: [],
  requestLocationPicker: 0,
};

export const useDiscoverFiltersStore = create<DiscoverFilterState>((set) => ({
  ...initial,
  setSelectedCategory: (selectedCategory) =>
    set({ selectedCategory, selectedSubcategory: null }),
  setSelectedSubcategory: (selectedSubcategory) =>
    set({ selectedSubcategory }),
  setSelectedCounty: (selectedCounty) =>
    set({ selectedCounty, selectedSubCounty: null, selectedWard: null }),
  setSelectedSubCounty: (selectedSubCounty) =>
    set({ selectedSubCounty, selectedWard: null }),
  setSelectedWard: (selectedWard) => set({ selectedWard }),
  setSelectedType: (selectedType) => set({ selectedType }),
  setSort: (sort) => set({ sort }),
  setMinPrice: (minPrice) => set({ minPrice }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  setNegotiableOnly: (negotiableOnly) => set({ negotiableOnly }),
  setSubcategories: (subcategories) => set({ subcategories }),
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
    }),
  clearAll: () => set(initial),
}));
