import { MAX_INGREDIENT_GROUPS, MAX_INGREDIENTS } from "@/features/add-recipe/constants";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { useCallback, useMemo } from "react";
import {
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";

export const DEFAULT_INGREDIENT_GROUP = {
  groupName: "Group name",
  items: [{ name: "", quantityAmount: "", quantityUnit: "g" }],
} satisfies AddRecipeFormValues["ingredientGroups"][number];

export const useIngredientGroupsField = () => {
  const { control } = useFormContext<AddRecipeFormValues>();
  const { errors } = useFormState({ control });

  const watchedGroups = useWatch({ control, name: "ingredientGroups" });

  const {
    fields: groupFields,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({
    control,
    name: "ingredientGroups",
  });

  const groupCount = groupFields.length;

  const totalIngredients = useMemo(() => {
    return (watchedGroups ?? []).reduce(
      (sum, g) => sum + (g.items?.length ?? 0),
      0
    );
  }, [watchedGroups]);

  const canAddGroup = groupCount < MAX_INGREDIENT_GROUPS;
  const canAddIngredient = totalIngredients < MAX_INGREDIENTS;

  const onAddGroup = useCallback(() => {
    if (!canAddGroup) return;
    appendGroup(DEFAULT_INGREDIENT_GROUP, { shouldFocus: false });
  }, [appendGroup, canAddGroup]);

  const onRemoveGroup = useCallback(
    (groupIndex: number) => {
      if (groupCount <= 1) return;
      removeGroup(groupIndex);
    },
    [groupCount, removeGroup]
  );

  const ingredientGroupsError = useMemo(
    () => (errors.ingredientGroups?.message as string | undefined) ?? undefined,
    [errors.ingredientGroups?.message]
  );

  return {
    groupFields,
    groupCount,
    totalIngredients,
    canAddGroup,
    canAddIngredient,
    onAddGroup,
    onRemoveGroup,
    ingredientGroupsError,
  };
};
