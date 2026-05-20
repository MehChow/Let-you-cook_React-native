import { BasicsSection } from "@/features/add-recipe/sections/BasicsSection";
import { CaloriesSection } from "@/features/add-recipe/sections/CaloriesSection";
import { CookingStepsSection } from "@/features/add-recipe/sections/CookingStepsSection";
import { ImagesSection } from "@/features/add-recipe/sections/ImagesSection";
import { IngredientsSection } from "@/features/add-recipe/sections/IngredientsSection";
import { ReminderSection } from "@/features/add-recipe/sections/ReminderSection";
import type { ComponentType } from "react";

export interface AddRecipeWizardSectionProps {
  mode: "edit" | "preview";
  bottomContentPadding?: number;
}

export interface AddRecipeWizardStepConfig {
  component: ComponentType<AddRecipeWizardSectionProps>;
  preTitleKey: string;
  title: string;
  description?: string;
  usesCustomScroll: boolean;
}

export const ADD_RECIPE_WIZARD_STEPS: AddRecipeWizardStepConfig[] = [
  {
    component: BasicsSection,
    preTitleKey: "THE BASICS",
    title: "What are you cooking today?",
    usesCustomScroll: false,
  },
  {
    component: ImagesSection,
    preTitleKey: "DISH IMAGES",
    title: "Show us your dish",
    description: "The first image is your thumbnail. Drag to reorder.",
    usesCustomScroll: false,
  },
  {
    component: IngredientsSection,
    preTitleKey: "INGREDIENTS",
    title: "What goes in the dish?",
    description: "Organize your ingredients into groups for better readability.",
    usesCustomScroll: true,
  },
  {
    component: CookingStepsSection,
    preTitleKey: "COOKING STEPS",
    title: "Walk us through it",
    description: "Drag to reorder steps. Add images for visual guidance.",
    usesCustomScroll: true,
  },
  {
    component: ReminderSection,
    preTitleKey: "REMINDER",
    title: "Any extra nodes?",
    description: "Tips, substitutions, or anything else worth noting.",
    usesCustomScroll: false,
  },
  {
    component: CaloriesSection,
    preTitleKey: "NUTRITION",
    title: "Estimate nutritional information (optional)",
    description: "Use AI to estimate calories per serving or fill them in manually.",
    usesCustomScroll: false,
  },
] as const;
