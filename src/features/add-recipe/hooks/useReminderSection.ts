import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { useFormContext, useFormState, useWatch } from "react-hook-form";

export function useReminderSection() {
  const { control } = useFormContext<AddRecipeFormValues>();
  const { errors } = useFormState({ control });
  const notes = useWatch({ control, name: "chefNotes" });
  const notesError =
    typeof errors.chefNotes?.message === "string"
      ? errors.chefNotes.message
      : undefined;

  return {
    control,
    notes: notes ?? "",
    notesError,
  };
}
