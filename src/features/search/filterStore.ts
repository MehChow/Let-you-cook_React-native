import { create } from "zustand";

export type SortBy = "relevance" | "top_rated" | "newest" | "quickest";
export type CookingTime = "any" | "lt_15" | "lt_30" | "lt_60" | "lt_120";

export type Range = readonly [number, number];

export const FILTER_DEFAULTS = {
  sortBy: "relevance" as SortBy,
  cookingTime: "any" as CookingTime,
  calories: [0, 2000] as const satisfies Range,
  servings: [1, 12] as const satisfies Range,
};

export type SearchFilters = {
  sortBy: SortBy;
  cookingTime: CookingTime;
  calories: Range;
  servings: Range;
};

export function getAppliedCount(filters: SearchFilters) {
  let count = 0;
  if (filters.sortBy !== FILTER_DEFAULTS.sortBy) count += 1;
  if (filters.cookingTime !== FILTER_DEFAULTS.cookingTime) count += 1;
  if (
    filters.calories[0] !== FILTER_DEFAULTS.calories[0] ||
    filters.calories[1] !== FILTER_DEFAULTS.calories[1]
  ) {
    count += 1;
  }
  if (
    filters.servings[0] !== FILTER_DEFAULTS.servings[0] ||
    filters.servings[1] !== FILTER_DEFAULTS.servings[1]
  ) {
    count += 1;
  }
  return count;
}

type FilterState = SearchFilters & {
  setSortBy: (sortBy: SortBy) => void;
  setCookingTime: (cookingTime: CookingTime) => void;
  setCalories: (range: Range) => void;
  setServings: (range: Range) => void;
  reset: () => void;
};

export const useSearchFilterStore = create<FilterState>((set) => ({
  ...FILTER_DEFAULTS,
  setSortBy: (sortBy) => set({ sortBy }),
  setCookingTime: (cookingTime) => set({ cookingTime }),
  setCalories: (calories) => set({ calories }),
  setServings: (servings) => set({ servings }),
  reset: () => set({ ...FILTER_DEFAULTS }),
}));

