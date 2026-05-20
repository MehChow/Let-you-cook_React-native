import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import {
  buildNutritionDependencyFingerprint,
  getAiNutritionDraftState,
  getManualNutritionState,
  resolvePreviewNutrition,
  type NutritionAiStatus,
  type NutritionMacroKey,
  type NutritionSummaryRowData,
} from "@/features/add-recipe/utils/nutrition";
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

export type NutritionModeValue = AddRecipeFormValues["nutritionMode"];
export type NutritionSummaryRow = NutritionSummaryRowData;

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

export function useCaloriesSection() {
  const { control, setValue } = useFormContext<AddRecipeFormValues>();
  const { errors } = useFormState({ control });
  const nutritionMode = useWatch({ control, name: "nutritionMode" });
  const servings = useWatch({ control, name: "servings" });
  const ingredientGroups = useWatch({ control, name: "ingredientGroups" });
  const cookingSteps = useWatch({ control, name: "cookingSteps" });
  const nutritionAiProteinGrams = useWatch({
    control,
    name: "nutritionAiProteinGrams",
  });
  const nutritionAiCarbsGrams = useWatch({
    control,
    name: "nutritionAiCarbsGrams",
  });
  const nutritionAiFatGrams = useWatch({
    control,
    name: "nutritionAiFatGrams",
  });
  const nutritionAiTotalCalories = useWatch({
    control,
    name: "nutritionAiTotalCalories",
  });
  const nutritionAiSourceFingerprint = useWatch({
    control,
    name: "nutritionAiSourceFingerprint",
  });
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, []);

  const dependencyValues = {
    servings: servings ?? "",
    ingredientGroups: ingredientGroups ?? [],
    cookingSteps: cookingSteps ?? [],
  };
  const manualState = getManualNutritionState({
    nutritionProteinGrams: nutritionProteinGrams ?? "",
    nutritionCarbsGrams: nutritionCarbsGrams ?? "",
    nutritionFatGrams: nutritionFatGrams ?? "",
  });
  const aiDraftState = getAiNutritionDraftState({
    nutritionAiProteinGrams,
    nutritionAiCarbsGrams,
    nutritionAiFatGrams,
    nutritionAiTotalCalories,
    nutritionAiSourceFingerprint: nutritionAiSourceFingerprint ?? "",
    ...dependencyValues,
  });
  const previewSummary = resolvePreviewNutrition({
    nutritionMode,
    nutritionProteinGrams: nutritionProteinGrams ?? "",
    nutritionCarbsGrams: nutritionCarbsGrams ?? "",
    nutritionFatGrams: nutritionFatGrams ?? "",
    nutritionAiProteinGrams,
    nutritionAiCarbsGrams,
    nutritionAiFatGrams,
    nutritionAiTotalCalories,
    nutritionAiSourceFingerprint: nutritionAiSourceFingerprint ?? "",
    ...dependencyValues,
  });

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
    if (isAnalyzing) return;
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
    setIsAnalyzing(true);
    aiTimeoutRef.current = setTimeout(() => {
      const currentFingerprint = buildNutritionDependencyFingerprint(
        dependencyValues,
      );
      const totalCalories =
        DEMO_AI_MACROS.protein * 4 +
        DEMO_AI_MACROS.carbs * 4 +
        DEMO_AI_MACROS.fat * 9;
      setValue("nutritionAiProteinGrams", DEMO_AI_MACROS.protein, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      setValue("nutritionAiCarbsGrams", DEMO_AI_MACROS.carbs, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      setValue("nutritionAiFatGrams", DEMO_AI_MACROS.fat, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      setValue("nutritionAiTotalCalories", totalCalories, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      setValue("nutritionAiSourceFingerprint", currentFingerprint, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      setIsAnalyzing(false);
      aiTimeoutRef.current = null;
    }, 1200);
  };

  const handleRemoveAiResult = () => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    setIsAnalyzing(false);
    setValue("nutritionAiProteinGrams", null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    setValue("nutritionAiCarbsGrams", null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    setValue("nutritionAiFatGrams", null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    setValue("nutritionAiTotalCalories", null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    setValue("nutritionAiSourceFingerprint", "", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  };

  const handleRemoveManualResult = () => {
    setMacroValue("nutritionProteinGrams", "");
    setMacroValue("nutritionCarbsGrams", "");
    setMacroValue("nutritionFatGrams", "");
  };

  const aiStatus: NutritionAiStatus = aiDraftState.status;
  const aiActionLabel =
    aiDraftState.status === "stale" ? "Re-analyze" : "Analyze";

  return {
    aiActionLabel,
    aiStatus,
    aiSummary: aiDraftState.summary,
    errors,
    handleAnalyze,
    handleRemoveAiResult,
    handleRemoveManualResult,
    inputRows,
    isAnalyzing,
    manualHasAnyValidValue: manualState.hasAnyValidValue,
    manualHasAnyValue: manualState.hasAnyValue,
    manualIsComplete: manualState.isComplete,
    manualSummary: manualState.summary,
    nutritionMode,
    previewSummary,
    setMacroValue,
    setMode,
  };
}
