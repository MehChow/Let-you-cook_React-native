import { mockAvatar, myRecipes, popularRecipes, todaySpecial } from "@/features/home/mockData";
import type { RecipeDetail, RecipeReview } from "@/features/recipe-detail/types";

const detailImageOne = require("../../../assets/mock_images/recipe-detail-1.jpg");
const detailImageTwo = require("../../../assets/mock_images/recipe-detail-2.jpg");
const detailImageThree = require("../../../assets/mock_images/recipe-detail-3.jpg");

const reviewAvatarOne = require("../../../assets/mock/icon.jpg");
const reviewAvatarTwo = require("../../../assets/mock/categories/dessert-thumb.jpg");
const reviewAvatarThree = require("../../../assets/mock/categories/breakfast-thumb.jpg");

const baseReviews: RecipeReview[] = [
  {
    id: "review-1",
    authorName: "Jenny C",
    authorAvatar: reviewAvatarOne,
    createdAtLabel: "26/04/2025 10:03",
    rating: 5,
  },
  {
    id: "review-2",
    authorName: "Lukeee",
    authorAvatar: reviewAvatarTwo,
    createdAtLabel: "20/04/2025 19:44",
    rating: 3,
    comment: "Great recipe. Easy to follow, yummy food. Thanks!!",
  },
  {
    id: "review-3",
    authorName: "Frogman",
    authorAvatar: reviewAvatarThree,
    createdAtLabel: "12/04/2025 13:02",
    rating: 4,
  },
];

const allSummaryRecipes = [
  todaySpecial,
  ...popularRecipes,
  ...myRecipes.filter(
    (recipe) =>
      recipe.id !== todaySpecial.id &&
      !popularRecipes.some((popularRecipe) => popularRecipe.id === recipe.id),
  ),
];

const buildDetail = (
  recipe: (typeof allSummaryRecipes)[number],
  index: number,
): RecipeDetail => ({
  id: recipe.id,
  title: recipe.title,
  description:
    recipe.description ||
    "Very yummy medium-rare steak with rosemary and butter. Nice to have one for your dinner!",
  author: {
    name: recipe.author,
    avatar: mockAvatar,
    averageRatingLabel: "Avg. rating 4.6",
  },
  images: [
    { id: `${recipe.id}-image-1`, source: detailImageOne, alt: `${recipe.title} hero` },
    { id: `${recipe.id}-image-2`, source: detailImageTwo, alt: `${recipe.title} step` },
    { id: `${recipe.id}-image-3`, source: detailImageThree, alt: `${recipe.title} plating` },
  ],
  rating: recipe.rating,
  reviewCount: 24 - index,
  cookTimeMinutes: recipe.timeMin,
  servings: recipe.serving,
  calories: recipe.calories,
  ingredientGroups: [
    {
      id: `${recipe.id}-main-ingredients`,
      title: recipe.tag,
      items: [
        { id: "steak", name: "Steak", quantity: "250 g" },
        { id: "butter", name: "Butter", quantity: "40 g" },
        { id: "rosemary", name: "Rosemary", quantity: "5 g" },
        { id: "garlic", name: "Garlic", quantity: "2 pcs" },
        { id: "salt", name: "Salt", quantity: "a bit" },
        { id: "pepper", name: "Pepper", quantity: "a bit" },
        { id: "oil", name: "Oil", quantity: "a bit" },
      ],
    },
  ],
  cookingSteps: [
    {
      id: `${recipe.id}-step-1`,
      instruction: "Season the dish with salt and pepper for both sides.",
    },
    {
      id: `${recipe.id}-step-2`,
      instruction: "Heat up the pan until you see some smoke on it.",
    },
    {
      id: `${recipe.id}-step-3`,
      instruction:
        "Add a little bit of oil, and then place the main ingredient on the pan immediately.",
      image: detailImageTwo,
    },
    {
      id: `${recipe.id}-step-4`,
      instruction: "Sear each side for 1-2 min to get the crust.",
      image: detailImageThree,
    },
    {
      id: `${recipe.id}-step-5`,
      instruction:
        "Turn down the heat, add aromatics and butter, then baste for 30s each side.",
      image: detailImageOne,
    },
    {
      id: `${recipe.id}-step-6`,
      instruction: "Take it out of the pan, rest it for 10 min and serve.",
    },
  ],
  reminder:
    "Take the dish out of the refrigerator for 30 min before cooking.\nSeason right before cooking to prevent moisture on the surface, which may affect the crust when searing.",
  nutrition: {
    source: "ai",
    totalCalories: recipe.calories,
    macros: [
      { key: "protein", label: "Protein", grams: 7, color: "#46685f" },
      { key: "carbs", label: "Carbs", grams: 48, color: "#e59b7d" },
      { key: "fat", label: "Fat", grams: 40, color: "#f4b562" },
    ],
  },
  reviews: baseReviews,
});

export const recipeDetails = allSummaryRecipes.reduce<Record<string, RecipeDetail>>(
  (acc, recipe, index) => {
    acc[recipe.id] = buildDetail(recipe, index);
    return acc;
  },
  {},
);

export const getRecipeDetailById = (
  recipeId: string,
): RecipeDetail | undefined => recipeDetails[recipeId];

export const getRecipeReviewsByRecipeId = (recipeId: string): RecipeReview[] =>
  getRecipeDetailById(recipeId)?.reviews ?? [];
