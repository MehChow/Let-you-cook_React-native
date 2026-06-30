import { useFavouriteStore } from "@/features/favourites/favouriteStore";

export function useFavourites() {
  const setFavourite = useFavouriteStore((s) => s.setFavourite);
  const favourites = useFavouriteStore((s) => s.favourites);
  const isFavourite = (id: string) => Boolean(favourites[id]);

  return { favourites, isFavourite, setFavourite };
}
