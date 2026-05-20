import { DEFAULT_INGREDIENT_UNIT } from "@/features/add-recipe/constants";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";

export const addRecipeFormDefaults: AddRecipeFormValues = {
  recipeName: "",
  description: "",
  cookTimeMinutes: "",
  servings: "",
  recipeImageUris: [],
  ingredientGroups: [
    {
      groupName: "Group name",
      items: [{ name: "", quantityAmount: "", quantityUnit: DEFAULT_INGREDIENT_UNIT }],
    },
  ],
  cookingSteps: [{ instruction: "", imageUri: "" }],
  chefNotes: "",
  nutritionMode: "ai",
  nutritionAiProteinGrams: null,
  nutritionAiCarbsGrams: null,
  nutritionAiFatGrams: null,
  nutritionAiTotalCalories: null,
  nutritionAiSourceFingerprint: "",
  nutritionProteinGrams: "",
  nutritionCarbsGrams: "",
  nutritionFatGrams: "",
};
