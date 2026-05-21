import { addRecipeFormDefaults } from "@/features/add-recipe/addRecipeFormDefaults";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";

export const addRecipePreviewDebugDefaults: AddRecipeFormValues = {
  ...addRecipeFormDefaults,
  recipeName: "Caramel pudding",
  description: "Easy to make, yummy",
  cookTimeMinutes: "30",
  servings: "2",
  recipeImageUris: [],
  ingredientGroups: [
    {
      groupName: "Egg pudding",
      items: [
        { name: "Sugar", quantityAmount: "30", quantityUnit: "g" },
        { name: "Egg", quantityAmount: "2", quantityUnit: "g" },
        {
          name: "Whipping cream",
          quantityAmount: "150",
          quantityUnit: "ml",
        },
        {
          name: "Vanilla extract",
          quantityAmount: "5",
          quantityUnit: "g",
        },
      ],
    },
    {
      groupName: "Caramel topping",
      items: [
        { name: "Sugar", quantityAmount: "60", quantityUnit: "g" },
        { name: "Water", quantityAmount: "20", quantityUnit: "ml" },
      ],
    },
  ],
  cookingSteps: [
    {
      instruction:
        "Mix the sugar, egg, whippping cream and vanilla extract together",
      imageUri: "",
    },
    {
      instruction: "Make caramel",
      imageUri: "",
    },
  ],
  chefNotes: "Be careful about the hot sugar",
};
