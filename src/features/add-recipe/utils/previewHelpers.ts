import type { AddRecipeFormValues } from "@/features/add-recipe/schema";

/**
 * Filter cooking steps for preview, excluding empty ones.
 */
export const prepareCookingStepsForPreview = (
  steps: AddRecipeFormValues["cookingSteps"]
): AddRecipeFormValues["cookingSteps"] => {
  return (steps ?? []).filter((step) => Boolean(step.instruction?.trim()));
};

/**
 * Filter and format ingredient groups for preview.
 * Removes empty ingredient rows and groups with no complete items.
 */
export const prepareIngredientGroupsForPreview = (
  groups: AddRecipeFormValues["ingredientGroups"]
): AddRecipeFormValues["ingredientGroups"] => {
  return (groups ?? [])
    .map((g) => {
      const completedItems = (g.items ?? []).filter(
        (row) =>
          Boolean(row.name?.trim()) && Boolean(row.quantityAmount?.trim())
      );
      return { ...g, items: completedItems };
    })
    .filter((g) => (g.items ?? []).length > 0);
};
