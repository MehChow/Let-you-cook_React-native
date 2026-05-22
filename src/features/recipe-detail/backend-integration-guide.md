# Recipe Detail backend integration guide

The current recipe detail page is a frontend-only UI fed by
`src/features/recipe-detail/mockData.ts`. The UI should keep using the
`RecipeDetail` contract from `types.ts`; backend work can replace the mock
loader without coupling the screen to list-card data or add-recipe form state.

## Mapping from add-recipe wizard

When the add-recipe wizard persists a recipe, map the validated
`AddRecipeFormValues` into a detail record:

- `recipeName` -> `RecipeDetail.title`
- `description` -> `RecipeDetail.description`
- `cookTimeMinutes` -> `RecipeDetail.cookTimeMinutes`
- `servings` -> `RecipeDetail.servings`
- `recipeImageUris` -> `RecipeDetail.images`
- `ingredientGroups` -> sanitize with `sanitizeIngredientGroups(...)`, then map
  complete rows into `RecipeDetail.ingredientGroups`
- `cookingSteps` -> filter with `prepareCookingStepsForPreview(...)`, preserving
  optional `imageUri` values for step images
- `chefNotes` -> `RecipeDetail.reminder`
- nutrition fields -> resolve with `resolveNutritionSaveDecision(...)`, then
  map saved macros into `RecipeDetail.nutrition`

The detail UI expects image sources that React Native can render. For backend
data this will usually mean remote URLs after upload, while local wizard drafts
may still use device-local URIs before persistence.

## Expected API surfaces

- `GET /recipes/:recipeId` returns the full `RecipeDetail` payload.
- `POST /recipes` saves a wizard-created recipe, uploads/links images, and
  returns the new stable recipe ID.
- `GET /recipes/:recipeId/reviews` returns review rows, ideally paginated.
- `POST /recipes/:recipeId/reviews` creates or updates the current user's
  review and returns the updated review plus aggregate rating data.
- Favourites can continue to use the existing recipe-ID-based flow described in
  the favourites integration guide.

## Missing feature states in the current design

- Loading, error, deleted/private recipe, and offline states for detail fetches.
- Empty or failed image states for the carousel and step images.
- Empty reviews state, review submission failure, and duplicate-review rules.
- Review pagination, moderation/reporting, and edit/delete ownership controls.
- Share, report, creator edit, and recipe delete actions.
- Nutrition provenance details, especially stale AI estimates after recipe edits.
