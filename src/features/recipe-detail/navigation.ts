import type { Href } from "expo-router";

interface RouterLike {
  push: (href: Href) => void;
}

export const pushRecipeDetail = (router: RouterLike, recipeId: string) => {
  router.push(`/recipe/${encodeURIComponent(recipeId)}` as Href);
};
