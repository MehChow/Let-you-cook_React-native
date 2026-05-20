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
      items: [{ name: "", quantityAmount: "", quantityUnit: "g" }],
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
