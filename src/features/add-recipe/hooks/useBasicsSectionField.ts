import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { useFormContext, useFormState, useWatch } from "react-hook-form";

export interface BasicsSectionPreviewValues {
  recipeName: string;
  description: string;
  cookTimeMinutes: string;
  servings: string;
}

export function useBasicsSectionField() {
  const { control } = useFormContext<AddRecipeFormValues>();
  const { errors } = useFormState({ control });

  const recipeName = useWatch({ control, name: "recipeName" });
  const description = useWatch({ control, name: "description" });
  const cookTimeMinutes = useWatch({ control, name: "cookTimeMinutes" });
  const servings = useWatch({ control, name: "servings" });

  const previewValues: BasicsSectionPreviewValues = {
    recipeName: recipeName ?? "",
    description: description ?? "",
    cookTimeMinutes: cookTimeMinutes ?? "",
    servings: servings ?? "",
  };

  return {
    control,
    errors,
    previewValues,
  };
}
