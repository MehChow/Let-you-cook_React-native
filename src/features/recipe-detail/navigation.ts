import type { Href } from "expo-router";

interface RouterLike {
  push: (href: Href) => void;
}

/** Opens a recipe detail within the authenticated route group. */
export const pushRecipeDetail = (router: RouterLike, recipeId: string) => {
  router.push(`/private/recipe/${encodeURIComponent(recipeId)}` as Href);
};
