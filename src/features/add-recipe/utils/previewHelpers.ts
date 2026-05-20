import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { sanitizeIngredientGroups } from "@/features/add-recipe/utils/ingredientGroups";

/**
 * Filter cooking steps for preview, excluding empty ones.
 */
export const prepareCookingStepsForPreview = (
  steps: AddRecipeFormValues["cookingSteps"]
): AddRecipeFormValues["cookingSteps"] => {
  return (steps ?? []).filter((step: AddRecipeFormValues["cookingSteps"][number]) =>
    Boolean(step.instruction?.trim()),
  );
};

/**
 * Filter and format ingredient groups for preview.
 * Removes empty ingredient rows and groups with no complete items.
 */
export const prepareIngredientGroupsForPreview = (
  groups: AddRecipeFormValues["ingredientGroups"]
): AddRecipeFormValues["ingredientGroups"] => {
  return sanitizeIngredientGroups(groups);
};
