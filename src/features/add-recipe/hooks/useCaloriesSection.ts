import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { useEffect, useRef, useState } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";

const DEMO_AI_MACROS = {
  protein: 7,
  carbs: 48,
  fat: 40,
} as const;

const NUTRITION_COLORS = {
  protein: "#46685f",
  carbs: "#e59b7d",
  fat: "#f4b562",
} as const;

const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const;

export type NutritionMacroKey = keyof typeof CALORIES_PER_GRAM;
export type NutritionModeValue = AddRecipeFormValues["nutritionMode"];
export type NutritionAiState = "idle" | "loading" | "success";

export interface NutritionSummaryRow {
  key: NutritionMacroKey;
  label: string;
  color: string;
  grams: number;
  gramsText: string;
  calories: number;
  ratio: number;
}

export interface NutritionInputRow {
  key: NutritionMacroKey;
  label: string;
  color: string;
  value: string;
  fieldName:
    | "nutritionProteinGrams"
    | "nutritionCarbsGrams"
    | "nutritionFatGrams";
}

function parseMacroValue(value?: string) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return { grams: 0, isValid: false, hasValue: false };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { grams: 0, isValid: false, hasValue: true };
  }
  return { grams: Number.parseInt(trimmed, 10), isValid: true, hasValue: true };
}

function buildSummary(source: Record<NutritionMacroKey, number | string>) {
  const protein =
    typeof source.protein === "number"
      ? source.protein
      : parseMacroValue(source.protein).grams;
  const carbs =
    typeof source.carbs === "number"
      ? source.carbs
      : parseMacroValue(source.carbs).grams;
  const fat =
    typeof source.fat === "number"
      ? source.fat
      : parseMacroValue(source.fat).grams;

  const macroCalories = {
    protein: protein * CALORIES_PER_GRAM.protein,
    carbs: carbs * CALORIES_PER_GRAM.carbs,
    fat: fat * CALORIES_PER_GRAM.fat,
  };
  const totalCalories =
    macroCalories.protein + macroCalories.carbs + macroCalories.fat;

  const rows: NutritionSummaryRow[] = [
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
      calories: macroCalories.fat,
      gramsText: fat > 0 ? `${fat}g` : "0g",
      ratio: totalCalories > 0 ? macroCalories.fat / totalCalories : 0,
    },
  ];

  return {
    totalCalories,
    rows,
  };
}

export function useCaloriesSection() {
  const { control, setValue } = useFormContext<AddRecipeFormValues>();
  const { errors } = useFormState({ control });
  const nutritionMode = useWatch({ control, name: "nutritionMode" });
  const nutritionProteinGrams = useWatch({
    control,
    name: "nutritionProteinGrams",
  });
  const nutritionCarbsGrams = useWatch({
    control,
    name: "nutritionCarbsGrams",
  });
  const nutritionFatGrams = useWatch({
    control,
    name: "nutritionFatGrams",
  });
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [aiState, setAiState] = useState<NutritionAiState>("idle");

  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, []);

  const manualProtein = parseMacroValue(nutritionProteinGrams);
  const manualCarbs = parseMacroValue(nutritionCarbsGrams);
  const manualFat = parseMacroValue(nutritionFatGrams);
  const manualSummary = buildSummary({
    protein: nutritionProteinGrams ?? "",
    carbs: nutritionCarbsGrams ?? "",
    fat: nutritionFatGrams ?? "",
  });
  const aiSummary = buildSummary(DEMO_AI_MACROS);

  const manualHasAnyValue =
    manualProtein.hasValue || manualCarbs.hasValue || manualFat.hasValue;
  const manualHasAnyValidValue =
    manualProtein.isValid || manualCarbs.isValid || manualFat.isValid;
  const manualIsComplete =
    manualProtein.isValid && manualCarbs.isValid && manualFat.isValid;

  const inputRows: NutritionInputRow[] = [
    {
      key: "protein",
      label: "Protein",
      color: NUTRITION_COLORS.protein,
      value: nutritionProteinGrams ?? "",
      fieldName: "nutritionProteinGrams",
    },
    {
      key: "carbs",
      label: "Carbs",
      color: NUTRITION_COLORS.carbs,
      value: nutritionCarbsGrams ?? "",
      fieldName: "nutritionCarbsGrams",
    },
    {
      key: "fat",
      label: "Fat",
      color: NUTRITION_COLORS.fat,
      value: nutritionFatGrams ?? "",
      fieldName: "nutritionFatGrams",
    },
  ];

  const setMode = (nextMode: NutritionModeValue) => {
    setValue("nutritionMode", nextMode, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  };

  const setMacroValue = (
    fieldName: NutritionInputRow["fieldName"],
    nextValue: string,
  ) => {
    const digitsOnly = nextValue.replace(/[^\d]/g, "");
    setValue(fieldName, digitsOnly, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  };

  const handleAnalyze = () => {
    if (aiState === "loading") return;
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
    setAiState("loading");
    aiTimeoutRef.current = setTimeout(() => {
      setAiState("success");
      aiTimeoutRef.current = null;
    }, 1200);
  };

  const handleRemoveAiResult = () => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    setAiState("idle");
  };

  const previewSummary =
    nutritionMode === "manual" ? manualSummary : aiSummary;

  return {
    aiState,
    aiSummary,
    errors,
    handleAnalyze,
    handleRemoveAiResult,
    inputRows,
    manualHasAnyValidValue,
    manualHasAnyValue,
    manualIsComplete,
    manualSummary,
    nutritionMode,
    previewSummary,
    setMacroValue,
    setMode,
  };
}
