import type { CategoryCarouselItem } from "@/features/home/CategoryCarousel";
import { useCategoryStore } from "@/features/home/categoryStore";
import {
  categories,
  mockAvatar,
  popularRecipes,
} from "@/features/home/mockData";
import { useSearchFilterStore } from "@/features/search/filterStore";
import { useSearchDerived } from "@/features/search/hooks/useSearchDerived";
import { useFavourites } from "@/hooks/useFavourites";
import { useRouter } from "expo-router";
import * as React from "react";

const RECENT_SEARCHES = ["healthy", "tiramisu", "snacks", "vegan", "cake"];

export function useSearchScreen() {
  const router = useRouter();
  const selectedCategoryId = useCategoryStore((s) => s.selectedCategoryId);
  const setSelectedCategoryId = useCategoryStore(
    (s) => s.setSelectedCategoryId,
  );

  const [searchText, setSearchText] = React.useState("");
  const { favourites, isFavourite, setFavourite } = useFavourites();

  const sortBy = useSearchFilterStore((s) => s.sortBy);
  const cookingTime = useSearchFilterStore((s) => s.cookingTime);
  const caloriesRange = useSearchFilterStore((s) => s.calories);
  const servingsRange = useSearchFilterStore((s) => s.servings);
  const setSortBy = useSearchFilterStore((s) => s.setSortBy);
  const setCookingTime = useSearchFilterStore((s) => s.setCookingTime);
  const setCalories = useSearchFilterStore((s) => s.setCalories);
  const setServings = useSearchFilterStore((s) => s.setServings);

  const filters = React.useMemo(
    () => ({
      sortBy,
      cookingTime,
      calories: caloriesRange,
      servings: servingsRange,
    }),
    [caloriesRange, cookingTime, servingsRange, sortBy],
  );

  const { appliedCount, filteredRecipes, activeFilterChips } = useSearchDerived(
    {
      recipes: popularRecipes,
      searchText,
      selectedCategoryId,
      filters,
      setSortBy,
      setCookingTime,
      setCalories,
      setServings,
    },
  );

  const categoryItems = React.useMemo<CategoryCarouselItem[]>(
    () =>
      categories.map((c) => ({
        id: c.id,
        label: c.label,
        placeholderColorClass: c.placeholderColorClass,
        imageSource: c.imageThumb,
      })),
    [],
  );

  const handleOpenFilters = React.useCallback(() => {
    router.push("/filters");
  }, [router]);

  const handleOpenCategories = React.useCallback(() => {
    router.push("/modal");
  }, [router]);

  const handleSelectCategory = React.useCallback(
    (id: string) => {
      setSelectedCategoryId(selectedCategoryId === id ? null : id);
    },
    [selectedCategoryId, setSelectedCategoryId],
  );

  const handleToggleFavourite = React.useCallback(
    (id: string, next: boolean) => {
      setFavourite(id, next);
    },
    [setFavourite],
  );

  return {
    activeFilterChips,
    appliedCount,
    categoryItems,
    favourites,
    filteredRecipes,
    handleOpenCategories,
    handleOpenFilters,
    handleSelectCategory,
    handleToggleFavourite,
    isFavourite,
    mockAvatar,
    recentSearches: RECENT_SEARCHES,
    searchText,
    selectedCategoryId: selectedCategoryId ?? undefined,
    setSearchText,
  };
}
