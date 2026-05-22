import {
  FILTER_DEFAULTS,
  getAppliedCount,
  useSearchFilterStore,
  type SearchFilters,
} from "@/features/search/filterStore";
import { useRouter } from "expo-router";
import * as React from "react";

export function useSearchFiltersScreen() {
  const router = useRouter();
  const sortBy = useSearchFilterStore((s) => s.sortBy);
  const cookingTime = useSearchFilterStore((s) => s.cookingTime);
  const calories = useSearchFilterStore((s) => s.calories);
  const servings = useSearchFilterStore((s) => s.servings);
  const setFilters = useSearchFilterStore((s) => s.setFilters);

  const [draftFilters, setDraftFilters] = React.useState<SearchFilters>(() => ({
    sortBy,
    cookingTime,
    calories,
    servings,
  }));
  const [isApplying, setIsApplying] = React.useState(false);
  const applyTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  React.useEffect(() => {
    return () => {
      if (applyTimeoutRef.current) {
        clearTimeout(applyTimeoutRef.current);
      }
    };
  }, []);

  const appliedCount = React.useMemo(
    () => getAppliedCount(draftFilters),
    [draftFilters],
  );

  const caloriesLabel = `${draftFilters.calories[0]} - ${draftFilters.calories[1]} kcal`;
  const servingsLabel = `${draftFilters.servings[0]} - ${draftFilters.servings[1]} people`;

  const handleReset = React.useCallback(() => {
    setDraftFilters({ ...FILTER_DEFAULTS });
  }, []);

  const handleApply = React.useCallback(() => {
    if (isApplying) return;

    setIsApplying(true);
    applyTimeoutRef.current = setTimeout(() => {
      setFilters(draftFilters);
      setIsApplying(false);
      router.back();
    }, 1000);
  }, [draftFilters, isApplying, router, setFilters]);

  const setDraftSortBy = React.useCallback(
    (sortBy: SearchFilters["sortBy"]) => {
      setDraftFilters((prev) => ({ ...prev, sortBy }));
    },
    [],
  );

  const setDraftCookingTime = React.useCallback(
    (cookingTime: SearchFilters["cookingTime"]) => {
      setDraftFilters((prev) => ({ ...prev, cookingTime }));
    },
    [],
  );

  const setDraftCalories = React.useCallback(
    (calories: SearchFilters["calories"]) => {
      setDraftFilters((prev) => ({ ...prev, calories }));
    },
    [],
  );

  const setDraftServings = React.useCallback(
    (servings: SearchFilters["servings"]) => {
      setDraftFilters((prev) => ({ ...prev, servings }));
    },
    [],
  );

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
