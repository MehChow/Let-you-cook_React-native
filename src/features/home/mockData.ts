import type { ImageSourcePropType } from "react-native";

export const mockAvatar: ImageSourcePropType = require("../../../assets/mock/icon.jpg");

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

export const todaySpecial: HomeRecipe = {
  id: "today-1",
  title: "Juicy pepper wings",
  author: "Mehhh",
  description: "",
  timeMin: 10,
  calories: 420,
  serving: "4-5",
  rating: 4.8,
  tag: "Wings",
  imagePlaceholderClass: "bg-accent-200",
  image: require("../../../assets/mock/todays_special.jpg"),
};

export const categories: HomeCategory[] = [
  {
    id: "breakfast",
    label: "Breakfast",
    placeholderColorClass: "bg-warning-200",
    imageThumb: require("../../../assets/mock/categories/breakfast-thumb.jpg"),
    imageLarge: require("../../../assets/mock/categories/breakfast-large.jpg"),
  },
  {
    id: "lunch",
    label: "Lunch",
    placeholderColorClass: "bg-accent-200",
    imageThumb: require("../../../assets/mock/categories/lunch-thumb.jpg"),
    imageLarge: require("../../../assets/mock/categories/lunch-large.jpg"),
  },
  {
    id: "dinner",
    label: "Dinner",
    placeholderColorClass: "bg-sage-200",
    imageThumb: require("../../../assets/mock/categories/dinner-thumb.jpg"),
    imageLarge: require("../../../assets/mock/categories/dinner-large.jpg"),
  },
  {
    id: "dessert",
    label: "Dessert",
    placeholderColorClass: "bg-neutral-200",
    imageThumb: require("../../../assets/mock/categories/dessert-thumb.jpg"),
    imageLarge: require("../../../assets/mock/categories/dessert-large.jpg"),
  },
  {
    id: "drinks",
    label: "Drinks",
    placeholderColorClass: "bg-neutral-200",
    imageThumb: require("../../../assets/mock/categories/drinks-thumb.jpg"),
    imageLarge: require("../../../assets/mock/categories/drinks-large.jpg"),
  },
  {
    id: "vegan",
    label: "Vegan",
    placeholderColorClass: "bg-neutral-200",
    imageThumb: require("../../../assets/mock/categories/vegan-thumb.jpg"),
    imageLarge: require("../../../assets/mock/categories/vegan-large.jpg"),
  },
  {
    id: "other",
    label: "Other",
    placeholderColorClass: "bg-neutral-200",
    imageThumb: require("../../../assets/mock/categories/other-thumb.jpg"),
    imageLarge: require("../../../assets/mock/categories/other-large.jpg"),
  },
];

export const popularRecipes: HomeRecipe[] = [
  {
    id: "pop-1",
    title: "Strawberry lemonade soda",
    author: "Mehhh",
    description: "Beautiful layers with refreshing taste. Sweet and sour.",
    timeMin: 10,
    calories: 300,
    serving: "1-2",
    rating: 4.5,
    tag: "Drinks",
    imagePlaceholderClass: "bg-accent-200",
    image: require("../../../assets/mock/popular_recipe_1.jpg"),
  },
  {
    id: "pop-2",
    title: "Vanilla yogurt parfait",
    author: "Mehhh",
    description: "Creamy, light, and quick to make.",
    timeMin: 12,
    calories: 280,
    serving: "1-2",
    rating: 4.6,
    tag: "Dessert",
    imagePlaceholderClass: "bg-warning-200",
    image: require("../../../assets/mock/popular_recipe_2.webp"),
  },
];
