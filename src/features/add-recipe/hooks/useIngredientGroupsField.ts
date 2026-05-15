import {
  MAX_INGREDIENT_GROUPS,
  MAX_INGREDIENTS,
} from "@/features/add-recipe/constants";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { useCallback, useEffect, useMemo } from "react";
import {
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner-native";

export const DEFAULT_INGREDIENT_GROUP = {
  groupName: "Group name",
  items: [{ name: "", quantityAmount: "", quantityUnit: "g" }],
} satisfies AddRecipeFormValues["ingredientGroups"][number];

const getQuantityAmountErrorMessage = (
  errorNode: unknown
): string | undefined => {
  if (!errorNode || typeof errorNode !== "object") return undefined;

  const node = errorNode as Record<string, unknown>;
  const quantityAmount = node.quantityAmount;

  if (quantityAmount && typeof quantityAmount === "object") {
    const message = (quantityAmount as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  for (const value of Object.values(node)) {
    const nestedMessage = getQuantityAmountErrorMessage(value);
    if (nestedMessage) return nestedMessage;
  }

  return undefined;
};

const hasNestedIngredientFieldErrors = (errorNode: unknown): boolean => {
  if (!errorNode || typeof errorNode !== "object") return false;

  const node = errorNode as Record<string, unknown>;
  return Object.entries(node).some(([key, value]) => {
    if (key === "message" || key === "type" || key === "ref") {
      return false;
    }

    return Boolean(value && typeof value === "object");
  });
};

export const useIngredientGroupsField = () => {
  const { control, clearErrors } = useFormContext<AddRecipeFormValues>();
  const { errors } = useFormState({ control });

  const watchedGroups = useWatch({ control, name: "ingredientGroups" });

  useEffect(() => {
    const hasCompleteIngredient = (watchedGroups ?? []).some((g) =>
      (g.items ?? []).some(
        (row) =>
          Boolean(row.name?.trim()) &&
          Boolean(row.quantityAmount?.trim()) &&
          Boolean(row.quantityUnit?.trim())
      )
    );

    // Clear the ingredientGroups-level error whenever there's a complete ingredient,
    // but only when the error tree does not already contain nested field issues.
    // This preserves quantity/name validation messages from submit-time Zod checks.
    if (
      hasCompleteIngredient &&
      !hasNestedIngredientFieldErrors(errors.ingredientGroups)
    ) {
      clearErrors("ingredientGroups");
    }
  }, [watchedGroups, clearErrors, errors.ingredientGroups]);

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
    toast("Hello, World!");
  }, [appendGroup, canAddGroup]);

  const onRemoveGroup = useCallback(
    (groupIndex: number) => {
      if (groupCount <= 1) return;
      removeGroup(groupIndex);
    },
    [groupCount, removeGroup]
  );

  const ingredientGroupsError = useMemo(
    () =>
      getQuantityAmountErrorMessage(errors.ingredientGroups) ??
      (errors.ingredientGroups?.message as string | undefined) ??
      undefined,
    [errors.ingredientGroups]
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
