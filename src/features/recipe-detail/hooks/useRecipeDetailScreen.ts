import { getRecipeDetailById } from "@/features/recipe-detail/mockData";
import { useFavourites } from "@/hooks/useFavourites";
import { router, type Href } from "expo-router";
import * as React from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

interface UseRecipeDetailScreenParams {
  recipeId: string;
}

export const useRecipeDetailScreen = ({
  recipeId,
}: UseRecipeDetailScreenParams) => {
  const recipe = React.useMemo(() => getRecipeDetailById(recipeId), [recipeId]);
  const { isFavourite, setFavourite } = useFavourites();
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  const favourite = recipe ? isFavourite(recipe.id) : false;

  const handleBack = React.useCallback(() => {
    router.back();
  }, []);

  const handleToggleFavourite = React.useCallback(() => {
    if (!recipe) return;
    setFavourite(recipe.id, !isFavourite(recipe.id));
  }, [isFavourite, recipe, setFavourite]);

  const handleImageScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const viewWidth = event.nativeEvent.layoutMeasurement.width;
      if (viewWidth <= 0) return;
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / viewWidth);
      setActiveImageIndex(nextIndex);
    },
    [],
  );

  const handleOpenReviews = React.useCallback(() => {
    if (!recipe) return;
    router.push(`/recipe/${encodeURIComponent(recipe.id)}/reviews` as Href);
  }, [recipe]);

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
