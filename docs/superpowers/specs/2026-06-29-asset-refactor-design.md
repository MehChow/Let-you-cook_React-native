# Asset Refactor Design

## Goal

Clean up static mock image handling in the app by:

- limiting scope to `assets/mock` and `assets/mock_images`
- removing generated and duplicate image variants
- converting retained originals to `.webp`
- consolidating static image imports into `src/data/images.ts`
- updating call sites to consume the shared image registry instead of inline `require(...)`

## Current State

The app currently references static images from two folders:

- `assets/mock`
- `assets/mock_images`

These folders contain a mix of:

- original curated source images
- derived semantic variants like `thumb` and `large`
- density variants like `@2x` and `@3x`
- prior converted assets like `.webp` and `.avif`

Image usage is spread across feature files, mainly:

- `src/features/home/mockData.ts`
- `src/features/recipe-detail/mockData.ts`

This makes it unclear which files are canonical, which are generated, and which can be safely deleted.

## Decisions

### 1. Canonical asset rule

Keep only the human-curated source images in `assets/mock` and `assets/mock_images`.

Delete all non-original variants from those folders, including:

- `*-thumb.*`
- `*-large.*`
- `*@2x.*`
- `*@3x.*`
- existing converted duplicates such as `.webp` and `.avif`

The user's selected rule is to preserve source images rather than preserve current call-site filenames.

### 2. Conversion flow

Add a repo-local Node script, wired as `npm run convert-assets`, based on the provided converter script.

The script will:

- search only `assets/mock` and `assets/mock_images`
- convert retained `.jpg` and `.jpeg` originals to `.webp`
- remove the original `.jpg` or `.jpeg` after successful conversion

This keeps the final folders webp-first and avoids leaving stale duplicate formats behind.

### 3. Shared image registry

Create `src/data/images.ts` as the single static image registry.

The module will:

- export a single `images` object
- group keys by feature meaning rather than by filename noise
- use `require("@/assets/...")` paths where possible to match the provided example style

Example categories expected in the registry:

- shared avatars
- home hero and popular recipe images
- category images
- recipe-detail carousel and step images

### 4. Call-site refactor

Replace inline static `require(...)` declarations for `assets/mock` and `assets/mock_images` with imports from `src/data/images.ts`.

Expected primary refactor targets:

- `src/features/home/mockData.ts`
- `src/features/recipe-detail/mockData.ts`

Any component using URI-based runtime images is out of scope.

### 5. Semantic variant compatibility

Some app data currently expects separate fields such as `imageThumb` and `imageLarge`.

After cleanup, those fields will remain in the data model if needed, but both may point to the same retained original asset when no distinct original source exists. This preserves UI behavior without reintroducing duplicate files.

## Implementation Outline

1. Inventory current files in `assets/mock` and `assets/mock_images`.
2. Keep only canonical source images according to filename patterns and current folder contents.
3. Add the `convert-assets` script and repo-local converter implementation.
4. Run conversion to produce final `.webp` assets.
5. Create `src/data/images.ts`.
6. Update feature data files to import from the shared image registry.
7. Verify no remaining references point to deleted asset names.

## Verification

Verification for this work should include:

- a search proving no deleted `thumb`, `large`, `@2x`, `@3x`, `.avif`, or removed `.jpg` asset paths remain in app source
- successful execution of `npm run convert-assets`
- `npm run lint`, with any unrelated pre-existing failures called out separately from refactor-introduced issues

## Scope Boundaries

Included:

- `assets/mock`
- `assets/mock_images`
- `package.json`
- repo-local conversion script
- `src/data/images.ts`
- static mock-data call sites using these folders

Excluded:

- runtime user-selected images
- unrelated asset folders
- broader visual redesign
- unrelated lint debt already present in the repo

## Risks

- Some screens may have relied on separate crop variants (`thumb` vs `large`) for composition. Mapping both to one source image may slightly change framing.
- Expo static asset resolution may require all new registry paths to exist exactly as written after conversion.
- Existing worktree changes unrelated to this task should remain untouched.
