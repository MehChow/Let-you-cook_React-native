import { getRecipeDetailById } from "@/features/recipe-detail/mockData";
import { useFavourites } from "@/hooks/useFavourites";
import { router, type Href } from "expo-router";
import { useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

interface UseRecipeDetailScreenParams {
  recipeId: string;
}

/** Coordinates recipe detail state and user-triggered screen actions. */
export const useRecipeDetailScreen = ({
  recipeId,
}: UseRecipeDetailScreenParams) => {
  const recipe = getRecipeDetailById(recipeId);
  const { isFavourite, setFavourite } = useFavourites();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const favourite = recipe ? isFavourite(recipe.id) : false;

  /** Returns the user to the immediately preceding native route. */
  const handleBack = () => {
    router.back();
  };

  /** Toggles the current recipe within the local favourites store. */
  const handleToggleFavourite = () => {
    if (!recipe) return;
    setFavourite(recipe.id, !isFavourite(recipe.id));
  };

  /** Tracks the gallery page nearest the current horizontal offset. */
  const handleImageScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const viewWidth = event.nativeEvent.layoutMeasurement.width;
    if (viewWidth <= 0) return;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / viewWidth);
    setActiveImageIndex(nextIndex);
  };

  /** Opens reviews for the current recipe inside protected routes. */
  const handleOpenReviews = () => {
    if (!recipe) return;
    router.push(
      `/private/recipe/${encodeURIComponent(recipe.id)}/reviews` as Href,
    );
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
