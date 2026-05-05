import type { FieldPath, UseFormSetError } from "react-hook-form";
import type { z } from "zod";
import type { AddRecipeFormValues } from "./schema";
import { WIZARD_STEP_SCHEMAS } from "./schema";

export function validateWizardStep(
  step: number,
  values: AddRecipeFormValues
): { ok: true } | { ok: false; error: z.ZodError } {
  const schema = WIZARD_STEP_SCHEMAS[step];
  const parsed = schema.safeParse(values);
  if (parsed.success) return { ok: true };
  return { ok: false, error: parsed.error };
}

export function applyZodIssuesToForm(
  error: z.ZodError,
  setError: UseFormSetError<AddRecipeFormValues>
) {
  for (const issue of error.issues) {
    const path = issue.path.join(".") as FieldPath<AddRecipeFormValues>;
    if (path) {
      setError(path, { type: "manual", message: issue.message });
    }
  }
}
