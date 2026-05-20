import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { create } from "zustand";

type AddRecipePreviewState = {
  snapshot: AddRecipeFormValues | null;
  targetStep: number | null;
  setSnapshot: (snapshot: AddRecipeFormValues) => void;
  setTargetStep: (step: number | null) => void;
};

export const useAddRecipePreviewStore = create<AddRecipePreviewState>((set) => ({
  snapshot: null,
  targetStep: null,
  setSnapshot: (snapshot) => set({ snapshot }),
  setTargetStep: (targetStep) => set({ targetStep }),
}));
