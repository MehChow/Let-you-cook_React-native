import { images } from "@/data/images";
import type { ImageSourcePropType } from "react-native";

export const mockAvatar: ImageSourcePropType = images.avatarMock;

export type HomeCategory = {
  id: string;
  label: string;
  placeholderColorClass: string;
  imageThumb: ImageSourcePropType;
  imageLarge: ImageSourcePropType;
};

export type HomeRecipe = {
  id: string;
  title: string;
  author: string;
  description: string;
  categoryId: string;
  timeMin: number;
  calories: number;
  serving: string;
  rating: number;
  tag: string;
  imagePlaceholderClass: string;
  image: ImageSourcePropType;
};

export const homeGreeting = {
  title: "Good morning, Mehhh",
  subtitle: "Are you cooking or being cooked?",
};

export const profileUser = {
  displayName: "Mehhh",
  location: "Hong Kong",
  bio: ["Walking the tightrope~~~", "Love cooking"],
} as const;

export const todaySpecial: HomeRecipe = {
  id: "today-1",
  title: "Juicy pepper wings",
  author: "Mehhh",
  description: "",
  categoryId: "other",
  timeMin: 10,
  calories: 420,
  serving: "4-5",
  rating: 4.8,
  tag: "Wings",
  imagePlaceholderClass: "bg-accent-200",
  image: images.todaySpecial,
};

export const categories: HomeCategory[] = [
  {
    id: "breakfast",
    label: "Breakfast",
    placeholderColorClass: "bg-warning-200",
    imageThumb: images.categoryBreakfast,
    imageLarge: images.categoryBreakfast,
  },
  {
    id: "lunch",
    label: "Lunch",
    placeholderColorClass: "bg-accent-200",
    imageThumb: images.categoryLunch,
    imageLarge: images.categoryLunch,
  },
  {
    id: "dinner",
    label: "Dinner",
    placeholderColorClass: "bg-sage-200",
    imageThumb: images.categoryDinner,
    imageLarge: images.categoryDinner,
  },
  {
    id: "dessert",
    label: "Dessert",
    placeholderColorClass: "bg-neutral-200",
    imageThumb: images.categoryDessert,
    imageLarge: images.categoryDessert,
  },
  {
    id: "drinks",
    label: "Drinks",
    placeholderColorClass: "bg-neutral-200",
    imageThumb: images.categoryDrinks,
    imageLarge: images.categoryDrinks,
  },
  {
    id: "vegan",
    label: "Vegan",
    placeholderColorClass: "bg-neutral-200",
    imageThumb: images.categoryVegan,
    imageLarge: images.categoryVegan,
  },
  {
    id: "other",
    label: "Other",
    placeholderColorClass: "bg-neutral-200",
    imageThumb: images.categoryOther,
    imageLarge: images.categoryOther,
  },
];

export const popularRecipes: HomeRecipe[] = [
  {
    id: "pop-1",
    title: "Strawberry lemonade soda",
    author: "Mehhh",
    description: "Beautiful layers with refreshing taste. Sweet and sour.",
    categoryId: "drinks",
    timeMin: 10,
    calories: 300,
    serving: "1-2",
    rating: 4.5,
    tag: "Drinks",
    imagePlaceholderClass: "bg-accent-200",
    image: images.popularRecipe1,
  },
  {
    id: "pop-2",
    title: "Vanilla yogurt parfait",
    author: "Mehhh",
    description: "Creamy, light, and quick to make.",
    categoryId: "dessert",
    timeMin: 12,
    calories: 280,
    serving: "1-2",
    rating: 4.6,
    tag: "Dessert",
    imagePlaceholderClass: "bg-warning-200",
    image: images.popularRecipe2,
  },
];

/** Recipes shown on the profile grid (Mehhh); ratings chosen so average ≈ 4.6 with four items. */
export const myRecipes: HomeRecipe[] = [
  popularRecipes[0],
  popularRecipes[1],
  todaySpecial,
  {
    id: "mine-4",
    title: "Garden salad bowl",
    author: "Mehhh",
    description: "Fresh greens with a light dressing.",
    categoryId: "lunch",
    timeMin: 15,
    calories: 220,
    serving: "2",
    rating: 4.5,
    tag: "Lunch",
    imagePlaceholderClass: "bg-sage-200",
    image: images.categoryLunch,
  },
];
