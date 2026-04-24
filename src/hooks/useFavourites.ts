import * as React from "react";

export function useFavourites() {
  const [favourites, setFavourites] = React.useState<Record<string, boolean>>(
    {}
  );

  const isFavourite = React.useCallback(
    (id: string) => Boolean(favourites[id]),
    [favourites]
  );

  const setFavourite = React.useCallback((id: string, next: boolean) => {
    setFavourites((prev) => ({ ...prev, [id]: next }));
  }, []);

  return { favourites, isFavourite, setFavourite };
}

