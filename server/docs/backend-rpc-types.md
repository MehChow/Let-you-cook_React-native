# Backend RPC And Types

## Decision

REST + Hono RPC means the backend route tree should be available to the Expo client as a type-only contract.

The simplest way to do that is a monorepo.

Do not move the whole app into a new folder yet. Start with a `server/` package in this repo, then add workspace wiring when the Expo app first imports the Hono `AppType`.

## Hono RPC Shape

On the server, export route types:

```ts
export type AppType = typeof app;
```

On the client, import the type only:

```ts
import type { AppType } from "@letyoucook/server";
import { hc } from "hono/client";

export const api = hc<AppType>(process.env.EXPO_PUBLIC_API_URL);
```

Keep server imports type-only in the app. Runtime server code must not be bundled into React Native.

## Type Sharing Rules

- Keep `strict: true` in both TypeScript configs.
- Export feature routes separately before the full route tree becomes too large.
- Return explicit `c.json(payload, status)` responses so Hono RPC can infer status-specific response types.
- Return JSON for not-found responses instead of relying on untyped defaults.
- Keep RPC as a private client convenience, not the only API contract.

## Current Client Type Check

No broad refactor is needed before the backend exists.

Current types are mostly UI models and form models:

- `src/features/home/mockData.ts` uses `ImageSourcePropType` and Tailwind placeholder classes.
- `src/features/recipe-detail/types.ts` uses `ImageSourcePropType` for renderable images.
- `src/features/add-recipe/schema.ts` describes the local wizard form.
- `src/features/favourites/favouriteStore.ts` stores local recipe-id booleans.

Keep those as client-side models for now.

## Backend DTO Pattern

Add backend DTOs when replacing mocks, not before.

Use backend DTOs with remote URLs and plain data:

```ts
interface RecipeSummaryDto {
  id: string;
  title: string;
  authorDisplayName: string;
  description: string;
  categoryId: string;
  cookTimeMinutes: number;
  calories: number;
  servings: number;
  rating: number;
  tags: string[];
  imageUrl: string;
}
```

Map DTOs into existing UI models inside feature API files:

```text
src/features/home/api.ts
src/features/recipe-detail/api.ts
src/features/add-recipe/api.ts
src/features/favourites/api.ts
```

Do not put React Native image types, Tailwind classes, or form-only field names in backend response types.

## Add Recipe Boundary

Do not send `AddRecipeFormValues` directly as the backend contract.

Create a request DTO when implementing `POST /recipes`:

```ts
interface CreateRecipeRequest {
  title: string;
  description: string;
  cookTimeMinutes: number;
  servings: number;
  ingredientGroups: {
    title?: string;
    items: {
      name: string;
      quantity: string;
    }[];
  }[];
  steps: {
    instruction: string;
    imageId?: string;
  }[];
  nutrition?: {
    source: "manual" | "ai";
    totalCalories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
}
```

Keep the local wizard schema focused on form validation. Map it to `CreateRecipeRequest` after final submit.

## References

- Hono RPC: https://hono.dev/docs/guides/rpc
- Hono validation: https://hono.dev/docs/guides/validation
