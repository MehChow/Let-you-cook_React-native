import type { CategoryCarouselItem } from "@/features/home/CategoryCarousel";
import { useCategoryStore } from "@/features/home/categoryStore";
import {
  categories,
  mockAvatar,
  popularRecipes,
} from "@/features/home/mockData";
import { pushRecipeDetail } from "@/features/recipe-detail/navigation";
import { useSearchFilterStore } from "@/features/search/filterStore";
import { useSearchDerived } from "@/features/search/hooks/useSearchDerived";
import { useFavourites } from "@/hooks/useFavourites";
import { useRouter } from "expo-router";
import { useState } from "react";

const RECENT_SEARCHES = ["healthy", "tiramisu", "snacks", "vegan", "cake"];
const categoryItems: CategoryCarouselItem[] = categories.map((category) => ({
  id: category.id,
  label: category.label,
  placeholderColorClass: category.placeholderColorClass,
  imageSource: category.imageThumb,
}));

export function useSearchScreen() {
  const router = useRouter();
  const selectedCategoryId = useCategoryStore((s) => s.selectedCategoryId);
  const setSelectedCategoryId = useCategoryStore(
    (s) => s.setSelectedCategoryId,
  );
  const [searchText, setSearchText] = useState("");
  const { favourites, isFavourite, setFavourite } = useFavourites();

  const sortBy = useSearchFilterStore((s) => s.sortBy);
  const cookingTime = useSearchFilterStore((s) => s.cookingTime);
  const caloriesRange = useSearchFilterStore((s) => s.calories);
  const servingsRange = useSearchFilterStore((s) => s.servings);
  const setSortBy = useSearchFilterStore((s) => s.setSortBy);
  const setCookingTime = useSearchFilterStore((s) => s.setCookingTime);
  const setCalories = useSearchFilterStore((s) => s.setCalories);
  const setServings = useSearchFilterStore((s) => s.setServings);

  const filters = {
    sortBy,
    cookingTime,
    calories: caloriesRange,
    servings: servingsRange,
  };

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

  const handleOpenFilters = () => {
    router.push("/private/filters");
  };

  const handleOpenCategories = () => {
    router.push("/private/modal");
  };

  const handleSelectCategory = (id: string) => {
    setSelectedCategoryId(selectedCategoryId === id ? null : id);
  };

  const handleToggleFavourite = (id: string, next: boolean) => {
    setFavourite(id, next);
  };

  const handleOpenRecipe = (id: string) => {
    pushRecipeDetail(router, id);
  };

  return {
    activeFilterChips,
    appliedCount,
    categoryItems,
    favourites,
    filteredRecipes,
    handleOpenCategories,
    handleOpenFilters,
    handleOpenRecipe,
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
