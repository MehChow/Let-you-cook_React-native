import { create } from "zustand";

type CategoryState = {
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
};

export const useCategoryStore = create<CategoryState>((set) => ({
  selectedCategoryId: null,
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
}));

