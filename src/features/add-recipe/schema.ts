import { z } from "zod";
import {
  MAX_CHEF_NOTES_LENGTH,
  MAX_COOKING_STEPS,
  MAX_DESCRIPTION_LENGTH,
  MAX_INGREDIENTS,
  MAX_INGREDIENT_GROUPS,
  MAX_RECIPE_IMAGES,
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
  // Lenient rows: allow empty strings; required-ness is enforced at the step level
  // so we can ignore fully-blank rows and only block partial ones.
  name: z
    .string()
    .trim()
    .max(50, "Ingredient name must be 50 characters or fewer"),
  quantityAmount: z
    .string()
    .trim()
    .superRefine((val, ctx) => {
      // Validate amount only when user entered something.
      if (!val) return;
      // Accept: integers, decimals, fractions, mixed fractions (no spaces)
      // 7, 1.5, 1/2, 1-1/2
      if (/\s/.test(val)) {
        ctx.addIssue({
          code: "custom",
          message: "No spaces (e.g., 7, 1.5, 1/2, 1-1/2)",
        });
        return;
      }
      const re = /^(\d+(?:\.\d+)?|\d+\/\d+|\d+-\d+\/\d+)$/;
      if (!re.test(val)) {
        ctx.addIssue({
          code: "custom",
          message: "Use 7, 1.5, 1/2, or 1-1/2",
        });
      }
    }),
  quantityUnit: z.enum(["ml", "g", "cup"]),
});

export const ingredientGroupSchema = z.object({
  groupName: z
    .string()
    .trim()
    .min(1, "Group name required")
    .max(50, "Group name must be 50 characters or fewer"),
  items: z.array(ingredientRowSchema).min(1, "Add at least one ingredient"),
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

const recipeImageRowSchema = z.object({
  uri: z.string().min(1),
  /** Stable identity for list reorder (RHF field `id` changes on `replace`). */
  clientKey: z.string().min(1),
});

export const imagesStepSchema = z.object({
  recipeImageUris: z
    .array(recipeImageRowSchema)
    .min(1, "Add at least one recipe image")
    .max(MAX_RECIPE_IMAGES, `You can add up to ${MAX_RECIPE_IMAGES} images`),
});

export const ingredientsStepSchema = z
  .object({
    ingredientGroups: z
      .array(ingredientGroupSchema)
      .min(1, "Add at least one group")
      .max(MAX_INGREDIENT_GROUPS),
  })
  .superRefine((val, ctx) => {
    const groups = val.ingredientGroups ?? [];
    const totalIngredients = groups.reduce(
      (sum, g) => sum + (g.items?.length ?? 0),
      0
    );
    if (totalIngredients > MAX_INGREDIENTS) {
      ctx.addIssue({
        code: "custom",
        path: ["ingredientGroups"],
        message: `You can add up to ${MAX_INGREDIENTS} ingredients`,
      });
    }

    let hasAnyCompleteIngredient = false;

    for (let gi = 0; gi < groups.length; gi++) {
      const items = groups[gi]?.items ?? [];
      for (let ii = 0; ii < items.length; ii++) {
        const row = items[ii];
        const name = row?.name?.trim() ?? "";
        const quantityAmount = row?.quantityAmount?.trim() ?? "";

        if (!name && !quantityAmount) {
          // fully blank row: ignore
          continue;
        }

        if (!name) {
          ctx.addIssue({
            code: "custom",
            path: ["ingredientGroups", gi, "items", ii, "name"],
            message: "Ingredient name required",
          });
        }
        if (!quantityAmount) {
          ctx.addIssue({
            code: "custom",
            path: ["ingredientGroups", gi, "items", ii, "quantityAmount"],
            message: "Amount required",
          });
        }

        if (name && quantityAmount) {
          hasAnyCompleteIngredient = true;
        }
      }
    }

    if (!hasAnyCompleteIngredient) {
      ctx.addIssue({
        code: "custom",
        path: ["ingredientGroups"],
        message: "Fill in at least one ingredient (name and amount).",
      });
    }
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
