import { DEFAULT_INGREDIENT_UNIT } from "@/features/add-recipe/constants";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";

type IngredientGroup = AddRecipeFormValues["ingredientGroups"][number];
type IngredientRow = IngredientGroup["items"][number];

const hasText = (value?: string) => Boolean(value?.trim());

export const createEmptyIngredientRow = (): IngredientRow => ({
  name: "",
  quantityAmount: "",
  quantityUnit: DEFAULT_INGREDIENT_UNIT,
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
    .map((group: IngredientGroup) => {
      const items = (group.items ?? []).filter(
        (row: IngredientRow) => !isBlankIngredientRow(row),
      );

      return {
        ...group,
        items,
      };
    })
    .filter((group: IngredientGroup) => (group.items ?? []).length > 0);
};
