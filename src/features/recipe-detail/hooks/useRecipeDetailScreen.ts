import { getRecipeDetailById } from "@/features/recipe-detail/mockData";
import { useFavourites } from "@/hooks/useFavourites";
import { router, type Href } from "expo-router";
import { useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

interface UseRecipeDetailScreenParams {
  recipeId: string;
}

export const useRecipeDetailScreen = ({
  recipeId,
}: UseRecipeDetailScreenParams) => {
  const recipe = getRecipeDetailById(recipeId);
  const { isFavourite, setFavourite } = useFavourites();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const favourite = recipe ? isFavourite(recipe.id) : false;

  const handleBack = () => {
    router.back();
  };

  const handleToggleFavourite = () => {
    if (!recipe) return;
    setFavourite(recipe.id, !isFavourite(recipe.id));
  };

  const handleImageScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const viewWidth = event.nativeEvent.layoutMeasurement.width;
    if (viewWidth <= 0) return;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / viewWidth);
    setActiveImageIndex(nextIndex);
  };

  const handleOpenReviews = () => {
    if (!recipe) return;
    router.push(`/recipe/${encodeURIComponent(recipe.id)}/reviews` as Href);
  };

  return {
    activeImageIndex,
    favourite,
    handleBack,
    handleImageScroll,
    handleOpenReviews,
    handleToggleFavourite,
    recipe,
  };
};
