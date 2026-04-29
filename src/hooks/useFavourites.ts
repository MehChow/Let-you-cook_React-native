import { useFavouriteStore } from "@/features/favourites/favouriteStore";
import * as React from "react";

export function useFavourites() {
  const setFavourite = useFavouriteStore((s) => s.setFavourite);

  // Subscribe to the actual map so changes propagate to every consumer.
  const favourites = useFavouriteStore((s) => s.favourites);

  const isFavourite = React.useCallback(
    (id: string) => Boolean(favourites[id]),
    [favourites]
  );

  return { favourites, isFavourite, setFavourite };
}
