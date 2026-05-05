export const TOTAL_WIZARD_STEPS = 6;

export const MAX_DESCRIPTION_LENGTH = 100;
export const MAX_STEP_INSTRUCTION_LENGTH = 200;
export const MAX_CHEF_NOTES_LENGTH = 200;
export const MAX_RECIPE_NAME_LENGTH = 120;

export const MAX_INGREDIENTS = 20;
export const MAX_COOKING_STEPS = 15;

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
  "Ingredients",
  "Cooking steps",
  "Reminder",
  "Nutritional information",
] as const;

export const WIZARD_STEP_DESCRIPTIONS: (string | undefined)[] = [
  undefined,
  "Tap an image to set it as the cover (green border). Maximum up to 9 images.",
  undefined,
  undefined,
  undefined,
  undefined,
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
