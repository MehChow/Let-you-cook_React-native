# Backend integration notes (Favourites) - Option A: favourite IDs

## Goal
Move “favourite status” from local UI state to the backend, **per user**:

- When the user opens the app, the backend returns the set of recipe IDs the user has favorited.
- The app hydrates a **global Zustand store** with these IDs.
- When the user toggles a favourite, the UI updates **optimistically**, then syncs the change to the backend.
- Other screens (Home/Search/Favourites) simply read from Zustand and re-render automatically.

This approach minimizes UI/code changes because your existing UI already consumes `useFavourites()` and relies on `recipeId` as the stable key.

---

## Current client “source of truth”
In this repo, favourites currently live in an in-memory Zustand store:

- `src/features/favourites/favouriteStore.ts`
- `src/hooks/useFavourites.ts`

The store shape is a map: `Record<string, boolean>` keyed by `recipeId`.

For backend migration, the recommended strategy is:
- Keep the same store shape and API (`isFavourite(id)`, `setFavourite(id, next)`).
- Replace the store implementation so it hydrates from backend and persists changes to backend.

---

## Backend contract (recommended)
### 1) Hydration endpoint
Return the user’s favourite recipe IDs.

**Example**
- `GET /me/favourites`

**Response**
- Option A (IDs only):
  - `string[]` (array of recipe IDs)
  - or `{ ids: string[] }`

### 2) Toggle endpoints
Two explicit actions are easiest to implement and reason about.

**Examples**
- `POST /me/favourites/:recipeId` (add)
- `DELETE /me/favourites/:recipeId` (remove)

**Response**
- `200` on success (optionally return the updated ID set or `{ favourited: boolean }`)

---

## Suggested client flow (recommended)
### App start / user load
1. User authenticates (Clerk or your future auth).
2. Immediately after auth success:
   - call `GET /me/favourites`
   - convert returned IDs into store state (e.g. mark `favourites[id] = true`)
3. The rest of the app can mount normally; screens already use the store.

### When user toggles a favourite
1. Identify `recipeId` (must match backend’s ID).
2. **Optimistic update**:
   - Update Zustand immediately so the UI feels instant.
3. Sync to backend:
   - If adding: call `POST /me/favourites/:recipeId`
   - If removing: call `DELETE /me/favourites/:recipeId`
4. If the request succeeds:
   - keep the optimistic state (nothing else needed), OR optionally reconcile from backend.
5. If the request fails:
   - revert the optimistic state, or trigger a refetch of `GET /me/favourites`.

---

## Optimistic update concern (important)
Optimistic updates improve perceived performance, but they introduce two failure modes:

1. **Network/API failure**
   - The UI flips to “favourited” but backend rejects the change.
   - Mitigation:
     - keep previous state so you can revert
     - or on error, call `GET /me/favourites` and reconcile.

2. **Race conditions / rapid toggling**
   - User taps favourite multiple times quickly.
   - Without safeguards, responses can arrive out-of-order and revert the “wrong” final state.
   - Mitigation:
     - track an in-flight request per `recipeId` (incrementing version / timestamp)
     - only apply the latest response to the store
     - or debounce toggles.

Practical recommendation:
- Use a per-`recipeId` “mutation version”:
  - before calling backend, increment `mutationVersion[recipeId]`
  - capture the version locally
  - when the response returns, only apply success/failure if the version still matches

---

## Sync strategy with Zustand
To keep UI changes minimal, implement favourites store actions like:

- `hydrateFavouritesFromServer(ids: string[])`
  - sets the internal `favourites` map
  - called on app/user load
- `setFavourite(id: string, next: boolean)`
  - still performs the UI update immediately (optimistic)
  - then calls backend and reconciles on error

Optional enhancements:
- Expose `isHydrated` so screens can avoid flicker (if needed).
- Consider storing `favourites` internally as `Set<string>` for ergonomics, but keep outward API the same.

---

## Migration checklist (what might change later)
### Stable recipe identity
Make sure your real backend recipe `id` is:
- stable (does not change between requests)
- unique across the entire user’s dataset (no collisions)

### Replace mock data with API data
No UI refactors should be required if you keep:
- `RecipeCard` and `RecipeFavouriteRowCard` using the same `recipeId`
- `setFavourite(r.id, next)` where `r.id` matches backend IDs

---

## Implementation note
This document focuses on **Option A** (IDs only). If you later switch to “recipes + favourited status embedded”, the UI can still remain mostly the same, but you’d move the hydration/update logic to where recipe lists are fetched.

