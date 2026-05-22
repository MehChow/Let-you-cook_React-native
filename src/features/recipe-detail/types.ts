import type { ImageSourcePropType } from "react-native";

export interface RecipeDetailImage {
  id: string;
  source: ImageSourcePropType;
  alt: string;
}

export interface RecipeDetailAuthor {
  name: string;
  avatar: ImageSourcePropType;
  averageRatingLabel: string;
}

export interface RecipeDetailIngredient {
  id: string;
  name: string;
  quantity: string;
}

export interface RecipeDetailIngredientGroup {
  id: string;
  title?: string;
  items: RecipeDetailIngredient[];
}

export interface RecipeDetailCookingStep {
  id: string;
  instruction: string;
  image?: ImageSourcePropType;
}

export interface RecipeDetailNutritionMacro {
  key: "protein" | "carbs" | "fat";
  label: string;
  grams: number;
  color: string;
}

export interface RecipeDetailNutrition {
  source: "ai" | "manual";
  totalCalories: number;
  macros: RecipeDetailNutritionMacro[];
}

export interface RecipeReview {
  id: string;
  authorName: string;
  authorAvatar: ImageSourcePropType;
  createdAtLabel: string;
  rating: number;
  comment?: string;
}

export interface RecipeDetail {
  id: string;
  title: string;
  description: string;
  author: RecipeDetailAuthor;
  images: RecipeDetailImage[];
  rating: number;
  reviewCount: number;
  cookTimeMinutes: number;
  servings: string;
  calories: number;
  ingredientGroups: RecipeDetailIngredientGroup[];
  cookingSteps: RecipeDetailCookingStep[];
  reminder?: string;
  nutrition: RecipeDetailNutrition;
  reviews: RecipeReview[];
}
