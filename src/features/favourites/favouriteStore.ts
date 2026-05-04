import { create } from "zustand";

type FavouriteState = {
  favourites: Record<string, boolean>;
  isFavourite: (id: string) => boolean;
  setFavourite: (id: string, next: boolean) => void;
  toggleFavourite: (id: string) => void;
};

export const useFavouriteStore = create<FavouriteState>((set, get) => ({
  favourites: {},
  isFavourite: (id) => Boolean(get().favourites[id]),
  setFavourite: (id, next) =>
    set((s) => ({ favourites: { ...s.favourites, [id]: next } })),
  toggleFavourite: (id) => {
    const next = !get().isFavourite(id);
    get().setFavourite(id, next);
  },
}));
