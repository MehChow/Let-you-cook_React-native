import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import {
  prepareCookingStepsForPreview,
  prepareIngredientGroupsForPreview,
} from "@/features/add-recipe/utils/previewHelpers";

export const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const;

export type NutritionMacroKey = keyof typeof CALORIES_PER_GRAM;
export type NutritionSource = "ai" | "manual";
export type NutritionAiStatus = "empty" | "ready" | "stale";

export interface NutritionSummaryRowData {
  key: NutritionMacroKey;
  label: string;
  color: string;
  grams: number;
  gramsText: string;
  calories: number;
  ratio: number;
}

export interface NutritionSummaryData {
  totalCalories: number;
  rows: NutritionSummaryRowData[];
}

export interface CanonicalNutritionData {
  source: NutritionSource;
  totalCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface NutritionManualState {
  hasAnyValue: boolean;
  hasAnyValidValue: boolean;
  isComplete: boolean;
  summary: NutritionSummaryData;
}

export interface NutritionAiDraftState {
  status: NutritionAiStatus;
  hasDraft: boolean;
  summary: NutritionSummaryData;
  sourceFingerprint: string;
  currentFingerprint: string;
}

export type NutritionSaveDecision =
  | { kind: "save"; nutrition: CanonicalNutritionData }
  | { kind: "save_none" }
  | {
      kind: "switch_source";
      suggestedSource: NutritionSource;
      nutrition: CanonicalNutritionData;
    }
  | {
      kind: "stale_ai";
      canSwitchToManual: boolean;
      manualNutrition?: CanonicalNutritionData;
    };

const NUTRITION_COLORS = {
  protein: "#46685f",
  carbs: "#e59b7d",
  fat: "#f4b562",
} as const;

function parseManualMacroValue(value?: string) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return { grams: 0, isValid: false, hasValue: false };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { grams: 0, isValid: false, hasValue: true };
  }
  return {
    grams: Number.parseInt(trimmed, 10),
    isValid: true,
    hasValue: true,
  };
}

function normalizeNumericValue(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function buildNutritionSummary(source: Record<NutritionMacroKey, number>) {
  const protein = normalizeNumericValue(source.protein);
  const carbs = normalizeNumericValue(source.carbs);
  const fat = normalizeNumericValue(source.fat);

  const macroCalories = {
    protein: protein * CALORIES_PER_GRAM.protein,
    carbs: carbs * CALORIES_PER_GRAM.carbs,
    fat: fat * CALORIES_PER_GRAM.fat,
  };
  const totalCalories =
    macroCalories.protein + macroCalories.carbs + macroCalories.fat;

  const rows: NutritionSummaryRowData[] = [
    {
      key: "protein",
      label: "Protein",
      color: NUTRITION_COLORS.protein,
      grams: protein,
      gramsText: protein > 0 ? `${protein}g` : "0g",
      calories: macroCalories.protein,
      ratio: totalCalories > 0 ? macroCalories.protein / totalCalories : 0,
    },
    {
      key: "carbs",
      label: "Carbs",
      color: NUTRITION_COLORS.carbs,
      grams: carbs,
      gramsText: carbs > 0 ? `${carbs}g` : "0g",
      calories: macroCalories.carbs,
      ratio: totalCalories > 0 ? macroCalories.carbs / totalCalories : 0,
    },
    {
      key: "fat",
      label: "Fat",
      color: NUTRITION_COLORS.fat,
      grams: fat,
      gramsText: fat > 0 ? `${fat}g` : "0g",
      calories: macroCalories.fat,
      ratio: totalCalories > 0 ? macroCalories.fat / totalCalories : 0,
    },
  ];

  return {
    totalCalories,
    rows,
  };
}

export function buildNutritionDependencyFingerprint(
  values: Pick<
    AddRecipeFormValues,
    "servings" | "ingredientGroups" | "cookingSteps"
  >,
) {
  return JSON.stringify({
    servings: values.servings?.trim() ?? "",
    ingredientGroups: prepareIngredientGroupsForPreview(
      values.ingredientGroups ?? [],
    ).map((group: AddRecipeFormValues["ingredientGroups"][number]) => ({
      items: (group.items ?? []).map((item: AddRecipeFormValues["ingredientGroups"][number]["items"][number]) => ({
        name: item.name?.trim() ?? "",
        quantityAmount: item.quantityAmount?.trim() ?? "",
        quantityUnit: item.quantityUnit,
      })),
    })),
    cookingSteps: prepareCookingStepsForPreview(values.cookingSteps ?? []).map(
      (step: AddRecipeFormValues["cookingSteps"][number]) => ({
        instruction: step.instruction?.trim() ?? "",
      }),
    ),
  });
}

export function getManualNutritionState(
  values: Pick<
    AddRecipeFormValues,
    | "nutritionProteinGrams"
    | "nutritionCarbsGrams"
    | "nutritionFatGrams"
  >,
): NutritionManualState {
  const protein = parseManualMacroValue(values.nutritionProteinGrams);
  const carbs = parseManualMacroValue(values.nutritionCarbsGrams);
  const fat = parseManualMacroValue(values.nutritionFatGrams);

  return {
    hasAnyValue: protein.hasValue || carbs.hasValue || fat.hasValue,
    hasAnyValidValue: protein.isValid || carbs.isValid || fat.isValid,
    isComplete: protein.isValid && carbs.isValid && fat.isValid,
    summary: buildNutritionSummary({
      protein: protein.grams,
      carbs: carbs.grams,
      fat: fat.grams,
    }),
  };
}

export function getAiNutritionDraftState(
  values: Pick<
    AddRecipeFormValues,
    | "nutritionAiProteinGrams"
    | "nutritionAiCarbsGrams"
    | "nutritionAiFatGrams"
    | "nutritionAiTotalCalories"
    | "nutritionAiSourceFingerprint"
    | "servings"
    | "ingredientGroups"
    | "cookingSteps"
  >,
): NutritionAiDraftState {
  const protein = normalizeNumericValue(values.nutritionAiProteinGrams);
  const carbs = normalizeNumericValue(values.nutritionAiCarbsGrams);
  const fat = normalizeNumericValue(values.nutritionAiFatGrams);
  const hasDraft =
    values.nutritionAiTotalCalories !== null ||
    values.nutritionAiProteinGrams !== null ||
    values.nutritionAiCarbsGrams !== null ||
    values.nutritionAiFatGrams !== null;
  const currentFingerprint = buildNutritionDependencyFingerprint(values);
  const sourceFingerprint = values.nutritionAiSourceFingerprint ?? "";

  return {
    status: !hasDraft
      ? "empty"
      : sourceFingerprint === currentFingerprint
        ? "ready"
        : "stale",
    hasDraft,
    summary: buildNutritionSummary({
      protein,
      carbs,
      fat,
    }),
    sourceFingerprint,
    currentFingerprint,
  };
}

function toCanonicalNutrition(
  source: NutritionSource,
  summary: NutritionSummaryData,
): CanonicalNutritionData {
  const proteinRow = summary.rows.find((row) => row.key === "protein");
  const carbsRow = summary.rows.find((row) => row.key === "carbs");
  const fatRow = summary.rows.find((row) => row.key === "fat");

  return {
    source,
    totalCalories: summary.totalCalories,
    proteinGrams: proteinRow?.grams ?? 0,
    carbsGrams: carbsRow?.grams ?? 0,
    fatGrams: fatRow?.grams ?? 0,
  };
}

export function resolvePreviewNutrition(
  values: Pick<
    AddRecipeFormValues,
    | "nutritionMode"
    | "nutritionProteinGrams"
    | "nutritionCarbsGrams"
    | "nutritionFatGrams"
    | "nutritionAiProteinGrams"
    | "nutritionAiCarbsGrams"
    | "nutritionAiFatGrams"
    | "nutritionAiTotalCalories"
    | "nutritionAiSourceFingerprint"
    | "servings"
    | "ingredientGroups"
    | "cookingSteps"
  >,
) {
  const manual = getManualNutritionState(values);
  const ai = getAiNutritionDraftState(values);

  if (values.nutritionMode === "manual") {
    return manual.hasAnyValidValue ? manual.summary : null;
  }

  return ai.status === "ready" ? ai.summary : null;
}

export function resolveNutritionSaveDecision(
  values: Pick<
    AddRecipeFormValues,
    | "nutritionMode"
    | "nutritionProteinGrams"
    | "nutritionCarbsGrams"
    | "nutritionFatGrams"
    | "nutritionAiProteinGrams"
    | "nutritionAiCarbsGrams"
    | "nutritionAiFatGrams"
    | "nutritionAiTotalCalories"
    | "nutritionAiSourceFingerprint"
    | "servings"
    | "ingredientGroups"
    | "cookingSteps"
  >,
): NutritionSaveDecision {
  const manual = getManualNutritionState(values);
  const ai = getAiNutritionDraftState(values);
  const manualNutrition = manual.hasAnyValidValue
    ? toCanonicalNutrition("manual", manual.summary)
    : null;
  const aiNutrition =
    ai.status === "ready" ? toCanonicalNutrition("ai", ai.summary) : null;

  if (values.nutritionMode === "manual") {
    if (manualNutrition) {
      return { kind: "save", nutrition: manualNutrition };
    }
    if (aiNutrition) {
      return {
        kind: "switch_source",
        suggestedSource: "ai",
        nutrition: aiNutrition,
      };
    }
    return { kind: "save_none" };
  }

  if (ai.status === "ready" && aiNutrition) {
    return { kind: "save", nutrition: aiNutrition };
  }
  if (ai.status === "stale") {
    return {
      kind: "stale_ai",
      canSwitchToManual: Boolean(manualNutrition),
      manualNutrition: manualNutrition ?? undefined,
    };
  }
  if (manualNutrition) {
    return {
      kind: "switch_source",
      suggestedSource: "manual",
      nutrition: manualNutrition,
    };
  }
  return { kind: "save_none" };
}
