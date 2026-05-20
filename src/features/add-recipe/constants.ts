export const TOTAL_WIZARD_STEPS = 6;

export const MAX_DESCRIPTION_LENGTH = 100;
export const MAX_STEP_INSTRUCTION_LENGTH = 200;
export const MAX_CHEF_NOTES_LENGTH = 200;
export const MAX_RECIPE_NAME_LENGTH = 120;

export const MAX_INGREDIENTS = 30;
export const MAX_INGREDIENT_GROUPS = 5;
export const MAX_COOKING_STEPS = 20;
export const MAX_RECIPE_IMAGES = 9;

export const INGREDIENT_UNIT_OPTIONS = ["n/a", "ml", "g", "cup"] as const;
export type IngredientUnitOption = (typeof INGREDIENT_UNIT_OPTIONS)[number];
export const DEFAULT_INGREDIENT_UNIT: IngredientUnitOption = "g";

export const MIN_SERVING = 1;
export const MAX_SERVING = 99;

/** Short labels under the step indicator (matches Figma). */
export const WIZARD_STEPPER_LABELS = [
  "Basics",
  "Images",
  "Ingredients",
  "Steps",
  "Reminder",
  "Calories",
] as const;

/** Uppercase segment used in the pre-title, e.g. STEP 1 — THE BASICS */
export const WIZARD_STEP_PRETITLE_KEYS = [
  "THE BASICS",
  "DISH IMAGES",
  "INGREDIENTS",
  "COOKING STEPS",
  "REMINDER",
  "NUTRITION",
] as const;

export const WIZARD_STEP_TITLES = [
  "What are you cooking today?",
  "Show us your dish",
  "What goes in the dish?",
  "Walk us through it",
  "Any extra nodes?",
  "Estimate nutritional information (optional)",
] as const;

export const WIZARD_STEP_DESCRIPTIONS: (string | undefined)[] = [
  undefined,
  "The first image is your thumbnail. Drag to reorder.",
  "Organize your ingredients into groups for better readability.",
  "Drag to reorder steps. Add images for visual guidance.",
  "Tips, substitutions, or anything else worth noting.",
  "Use AI to estimate calories per serving or fill them in manually.",
];

/** Preview / section titles (match design copy). */
export const SECTION_PREVIEW_TITLES = [
  "Basics",
  "Images",
  "Ingredients",
  "Cooking steps",
  "Reminder",
  "Nutritional information",
] as const;

export const formatIngredientQuantity = (
  amount?: string,
  unit?: IngredientUnitOption,
) => {
  const trimmedAmount = amount?.trim() ?? "";

  if (!trimmedAmount) return "";
  if (unit === "n/a") return trimmedAmount;

  return `${trimmedAmount} ${unit ?? DEFAULT_INGREDIENT_UNIT}`;
};
