# Home Feature Backend Integration Suggestions

## Current local setup

- Home category selection is stored in `useCategoryStore`.
- Home `Popular recipes` filters local `popularRecipes` mock data by `categoryId`.
- Search reuses the same selected category state, so home and search stay in sync.
- All recipes and categories are currently local mocks in `mockData.ts`.

## Suggested backend data shape

Use separate category and recipe resources so the client can fetch category metadata independently from recipe lists.

```ts
type Category = {
  id: string;
  label: string;
  imageThumbUrl: string;
  imageLargeUrl: string;
};

type Recipe = {
  id: string;
  title: string;
  author: string;
  description: string;
  categoryId: string;
  categoryLabel?: string;
  tags: string[];
  timeMin: number;
  calories: number;
  serving: string;
  rating: number;
  imageUrl: string;
};
```

## Suggested endpoints

- `GET /categories`
- `GET /recipes/popular?categoryId=drinks&limit=2`
- `GET /recipes/search?query=&categoryId=&sortBy=&maxTime=&caloriesMin=&caloriesMax=&servingsMin=&servingsMax=`

## Frontend migration notes

- Keep category selection in a shared UI store if the product should preserve the selected category between Home and Search.
- If that cross-screen persistence should become linkable or restorable, move the selected category into route params instead of only local store state.
- Replace in-screen filtering of `mockData` with query-driven results once backend data is connected.
- Keep `categoryId` as the filtering key and treat display labels as presentation data only.

## Edge cases to plan for

- Selected category returns no popular recipes.
- Category list changes and the stored `selectedCategoryId` no longer exists.
- Home and Search eventually need different category-selection scopes.
