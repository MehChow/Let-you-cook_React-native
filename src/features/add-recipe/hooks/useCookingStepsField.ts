import { MAX_COOKING_STEPS } from "@/features/add-recipe/constants";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
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
  const canRemoveStep = (index: number) => index > 0;

  const handleAddStep = () => {
    if (!canAddStep) return;
    append({ instruction: "", imageUri: "" });
  };

  const handleRemoveStep = (index: number) => {
    if (!canRemoveStep(index)) return;
    remove(index);
  };

  const handleMoveStep = (from: number, to: number) => {
    move(from, to);
  };

  const keyExtractor = (
    item: FieldArrayWithId<AddRecipeFormValues, "cookingSteps", "id">,
  ) => item.id;

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
