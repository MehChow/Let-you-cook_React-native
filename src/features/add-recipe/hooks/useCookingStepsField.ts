import { MAX_COOKING_STEPS } from "@/features/add-recipe/constants";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { useCallback } from "react";
import {
  type FieldArrayWithId,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";

export function useCookingStepsField() {
  const { control } = useFormContext<AddRecipeFormValues>();
  const previewSteps = useWatch({ control, name: "cookingSteps" });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "cookingSteps",
  });

  const canAddStep = fields.length < MAX_COOKING_STEPS;
  const canRemoveStep = useCallback((index: number) => index > 0, []);

  const handleAddStep = useCallback(() => {
    if (!canAddStep) return;
    append({ instruction: "", imageUri: "" });
  }, [append, canAddStep]);

  const handleRemoveStep = useCallback(
    (index: number) => {
      if (!canRemoveStep(index)) return;
      remove(index);
    },
    [canRemoveStep, remove],
  );

  const handleMoveStep = useCallback(
    (from: number, to: number) => {
      move(from, to);
    },
    [move],
  );

  const keyExtractor = useCallback(
    (item: FieldArrayWithId<AddRecipeFormValues, "cookingSteps", "id">) => {
      return item.id;
    },
    [],
  );

  return {
    fields,
    previewSteps,
    canAddStep,
    canRemoveStep,
    handleAddStep,
    handleRemoveStep,
    handleMoveStep,
    keyExtractor,
  };
}
