import type { Href, Router } from "expo-router";

export const pushRecipeDetail = (router: Router, recipeId: string) => {
  router.push(`/recipe/${encodeURIComponent(recipeId)}` as Href);
};
