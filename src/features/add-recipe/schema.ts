import { z } from "zod";
import {
  MAX_CHEF_NOTES_LENGTH,
  MAX_COOKING_STEPS,
  MAX_DESCRIPTION_LENGTH,
  MAX_INGREDIENTS,
  MAX_RECIPE_NAME_LENGTH,
  MAX_SERVING,
  MAX_STEP_INSTRUCTION_LENGTH,
  MIN_SERVING,
} from "./constants";

export const servingsSchema = z
  .string()
  .trim()
  .min(1, "Servings are required")
  .superRefine((val, ctx) => {
    // 1. Guard: If empty, stop here so .min(1) takes over
    if (!val) return;

    const single = /^(\d+)$/.exec(val);
    const range = /^(\d+)-(\d+)$/.exec(val);

    // 2. Validate Single Number
    if (single) {
      const n = Number.parseInt(single[1]!, 10);
      if (n < MIN_SERVING || n > MAX_SERVING) {
        ctx.addIssue({
          code: "custom", // Use the string literal here
          message: `Amount must be between ${MIN_SERVING} and ${MAX_SERVING}`,
        });
      }
      return;
    }

    // 3. Validate Range
    if (range) {
      const a = Number.parseInt(range[1]!, 10);
      const b = Number.parseInt(range[2]!, 10);

      if (a < MIN_SERVING || b > MAX_SERVING) {
        ctx.addIssue({
          code: "custom",
          message: `Range must be between ${MIN_SERVING} and ${MAX_SERVING}`,
        });
      } else if (a >= b) {
        ctx.addIssue({
          code: "custom",
          message: "Range start must be less than end (e.g., 2-4)",
        });
      }
      return;
    }

    // 4. Fallback for invalid characters/format
    ctx.addIssue({
      code: "custom",
      message: "Enter a number or range (e.g., 4 or 3-5)",
    });
  });

export const ingredientRowSchema = z.object({
  name: z.string().trim().min(1, "Ingredient name required"),
  quantity: z.string().trim().min(1, "Quantity required"),
});

export const cookingStepSchema = z.object({
  instruction: z
    .string()
    .trim()
    .min(1, "Describe this step")
    .max(MAX_STEP_INSTRUCTION_LENGTH),
  imageUri: z.string().optional(),
});

export const basicsStepSchema = z.object({
  recipeName: z
    .string()
    .trim()
    .min(1, "Please enter a name for your recipe.")
    .max(MAX_RECIPE_NAME_LENGTH),
  description: z.string().max(MAX_DESCRIPTION_LENGTH),
  cookTimeMinutes: z
    .string()
    .trim()
    .min(1, "Cook time is required") // Step 1: Must not be empty
    .pipe(
      z
        .string()
        .regex(/^\d+$/, "Use minutes as a whole number") // Step 2: Must be digits
        .refine((v) => {
          const n = Number.parseInt(v, 10);
          return n > 0 && n <= 1440;
        }, "Enter a realistic cook time")
    ),
  servings: servingsSchema,
});

export const imagesStepSchema = z.object({
  thumbnailUri: z.string().min(1, "Add a cover image"),
  secondaryImageUri: z.string().optional(),
});

export const ingredientsStepSchema = z.object({
  ingredients: z
    .array(ingredientRowSchema)
    .min(1, "Add at least one ingredient")
    .max(MAX_INGREDIENTS),
});

export const cookingStepsStepSchema = z.object({
  cookingSteps: z
    .array(cookingStepSchema)
    .min(1, "Add at least one step")
    .max(MAX_COOKING_STEPS),
});

export const reminderStepSchema = z.object({
  chefNotes: z.string().max(MAX_CHEF_NOTES_LENGTH),
});

export const caloriesStepSchema = z.object({
  nutritionMode: z.enum(["ai", "manual"]),
});

export const addRecipeFormSchema = basicsStepSchema
  .merge(imagesStepSchema)
  .merge(ingredientsStepSchema)
  .merge(cookingStepsStepSchema)
  .merge(reminderStepSchema)
  .merge(caloriesStepSchema);

export type AddRecipeFormValues = z.infer<typeof addRecipeFormSchema>;

export const WIZARD_STEP_SCHEMAS = [
  basicsStepSchema,
  imagesStepSchema,
  ingredientsStepSchema,
  cookingStepsStepSchema,
  reminderStepSchema,
  caloriesStepSchema,
] as const;
