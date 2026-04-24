import * as React from "react";
import type { SearchFilters } from "@/features/search/filterStore";
import { FILTER_DEFAULTS, getAppliedCount } from "@/features/search/filterStore";
import { parseServingRange } from "@/features/search/utils/parseServingRange";
import type { HomeRecipe } from "@/features/home/mockData";

type Params = {
  recipes: readonly HomeRecipe[];
  searchText: string;
  selectedCategoryLabel: string | null;
  filters: SearchFilters;
  setSortBy: (next: SearchFilters["sortBy"]) => void;
  setCookingTime: (next: SearchFilters["cookingTime"]) => void;
  setCalories: (next: SearchFilters["calories"]) => void;
  setServings: (next: SearchFilters["servings"]) => void;
};

export function useSearchDerived({
  recipes,
  searchText,
  selectedCategoryLabel,
  filters,
  setSortBy,
  setCookingTime,
  setCalories,
  setServings,
}: Params) {
  const appliedCount = React.useMemo(() => getAppliedCount(filters), [filters]);

  const filteredRecipes = React.useMemo(() => {
    const q = searchText.trim().toLowerCase();
    const filtered = recipes.filter((r) => {
      const matchesQuery =
        q.length === 0 ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tag.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q);

      const matchesCategory =
        !selectedCategoryLabel ||
        r.tag.toLowerCase() === selectedCategoryLabel.toLowerCase();

      const matchesCookingTime = (() => {
        switch (filters.cookingTime) {
          case "lt_15":
            return r.timeMin < 15;
          case "lt_30":
            return r.timeMin < 30;
          case "lt_60":
            return r.timeMin < 60;
          case "lt_120":
            return r.timeMin < 120;
          case "any":
          default:
            return true;
        }
      })();

      const matchesCalories =
        r.calories >= filters.calories[0] && r.calories <= filters.calories[1];

      const matchesServings = (() => {
        const range = parseServingRange(r.serving);
        if (!range) return true;
        const selMin = filters.servings[0];
        const selMax = filters.servings[1];
        return range.max >= selMin && range.min <= selMax;
      })();

      return (
        matchesQuery &&
        matchesCategory &&
        matchesCookingTime &&
        matchesCalories &&
        matchesServings
      );
    });

    switch (filters.sortBy) {
      case "top_rated":
        return [...filtered].sort((a, b) => b.rating - a.rating);
      case "quickest":
        return [...filtered].sort((a, b) => a.timeMin - b.timeMin);
      case "newest":
      case "relevance":
      default:
        return filtered;
    }
  }, [filters, recipes, searchText, selectedCategoryLabel]);

  const activeFilterChips = React.useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

    if (filters.sortBy !== FILTER_DEFAULTS.sortBy) {
      const sortLabel =
        filters.sortBy === "top_rated"
          ? "Top rated"
          : filters.sortBy === "quickest"
            ? "Quickest"
            : filters.sortBy === "newest"
              ? "Newest"
              : "Relevance";
      chips.push({
        key: "sortBy",
        label: sortLabel,
        onRemove: () => setSortBy(FILTER_DEFAULTS.sortBy),
      });
    }

    if (filters.cookingTime !== FILTER_DEFAULTS.cookingTime) {
      const timeLabel =
        filters.cookingTime === "lt_15"
          ? "< 15 min"
          : filters.cookingTime === "lt_30"
            ? "< 30 min"
            : filters.cookingTime === "lt_60"
              ? "< 1 hr"
              : filters.cookingTime === "lt_120"
                ? "< 2 hr"
                : "Any";
      chips.push({
        key: "cookingTime",
        label: timeLabel,
        onRemove: () => setCookingTime(FILTER_DEFAULTS.cookingTime),
      });
    }

    if (
      filters.calories[0] !== FILTER_DEFAULTS.calories[0] ||
      filters.calories[1] !== FILTER_DEFAULTS.calories[1]
    ) {
      chips.push({
        key: "calories",
        label: `${filters.calories[0]} - ${filters.calories[1]} kcal`,
        onRemove: () => setCalories(FILTER_DEFAULTS.calories),
      });
    }

    if (
      filters.servings[0] !== FILTER_DEFAULTS.servings[0] ||
      filters.servings[1] !== FILTER_DEFAULTS.servings[1]
    ) {
      chips.push({
        key: "servings",
        label: `${filters.servings[0]} - ${filters.servings[1]} people`,
        onRemove: () => setServings(FILTER_DEFAULTS.servings),
      });
    }

    return chips;
  }, [filters, setCalories, setCookingTime, setServings, setSortBy]);

  return {
    appliedCount,
    hasAppliedFilters: appliedCount > 0,
    filteredRecipes,
    activeFilterChips,
  };
}

