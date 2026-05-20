import type { AddRecipeFormValues } from "@/features/add-recipe/schema";

type IngredientGroup = AddRecipeFormValues["ingredientGroups"][number];
type IngredientRow = IngredientGroup["items"][number];

const hasText = (value?: string) => Boolean(value?.trim());

export const createEmptyIngredientRow = (): IngredientRow => ({
  name: "",
  quantityAmount: "",
  quantityUnit: "g",
});

export const createEmptyIngredientGroup = (): IngredientGroup => ({
  groupName: "Group name",
  items: [createEmptyIngredientRow()],
});

export const isBlankIngredientRow = (row?: Partial<IngredientRow> | null) =>
  !hasText(row?.name) && !hasText(row?.quantityAmount);

export const isCompleteIngredientRow = (row?: Partial<IngredientRow> | null) =>
  hasText(row?.name) && hasText(row?.quantityAmount);

export const sanitizeIngredientGroups = (
  groups: AddRecipeFormValues["ingredientGroups"] | undefined,
): AddRecipeFormValues["ingredientGroups"] => {
  return (groups ?? [])
    .map((group) => {
      const items = (group.items ?? []).filter(
        (row) => !isBlankIngredientRow(row),
      );

      return {
        ...group,
        items,
      };
    })
    .filter((group) => (group.items ?? []).length > 0);
};
