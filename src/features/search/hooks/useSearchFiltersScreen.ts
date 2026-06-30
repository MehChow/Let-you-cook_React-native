import {
  FILTER_DEFAULTS,
  getAppliedCount,
  useSearchFilterStore,
  type SearchFilters,
} from "@/features/search/filterStore";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

export function useSearchFiltersScreen() {
  const router = useRouter();
  const sortBy = useSearchFilterStore((s) => s.sortBy);
  const cookingTime = useSearchFilterStore((s) => s.cookingTime);
  const calories = useSearchFilterStore((s) => s.calories);
  const servings = useSearchFilterStore((s) => s.servings);
  const setFilters = useSearchFilterStore((s) => s.setFilters);

  const [draftFilters, setDraftFilters] = useState<SearchFilters>(() => ({
    sortBy,
    cookingTime,
    calories,
    servings,
  }));
  const [isApplying, setIsApplying] = useState(false);
  const applyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (applyTimeoutRef.current) {
        clearTimeout(applyTimeoutRef.current);
      }
    };
  }, []);

  const appliedCount = getAppliedCount(draftFilters);
  const caloriesLabel = `${draftFilters.calories[0]} - ${draftFilters.calories[1]} kcal`;
  const servingsLabel = `${draftFilters.servings[0]} - ${draftFilters.servings[1]} people`;

  const handleReset = () => {
    setDraftFilters({ ...FILTER_DEFAULTS });
  };

  const handleApply = () => {
    if (isApplying) return;

    setIsApplying(true);
    applyTimeoutRef.current = setTimeout(() => {
      setFilters(draftFilters);
      setIsApplying(false);
      router.back();
    }, 1000);
  };

  const setDraftSortBy = (sortBy: SearchFilters["sortBy"]) => {
    setDraftFilters((prev) => ({ ...prev, sortBy }));
  };

  const setDraftCookingTime = (cookingTime: SearchFilters["cookingTime"]) => {
    setDraftFilters((prev) => ({ ...prev, cookingTime }));
  };

  const setDraftCalories = (calories: SearchFilters["calories"]) => {
    setDraftFilters((prev) => ({ ...prev, calories }));
  };

  const setDraftServings = (servings: SearchFilters["servings"]) => {
    setDraftFilters((prev) => ({ ...prev, servings }));
  };

  return {
    appliedCount,
    caloriesLabel,
    draftFilters,
    handleApply,
    handleReset,
    isApplying,
    servingsLabel,
    setDraftCalories,
    setDraftCookingTime,
    setDraftServings,
    setDraftSortBy,
  };
}
