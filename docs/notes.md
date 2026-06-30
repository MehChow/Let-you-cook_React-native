# Notes

These are the problems/issues encountered before. It might help debugging in the future.

## 2026-06-30 Asset cleanup

- Cleaned up `assets/mock` and `assets/mock_images` to keep only canonical source assets.
- Removed generated duplicates such as `thumb`, `large`, `@2x`, and `@3x`.
- Added `npm run convert-assets` in `package.json`.
- Centralized static asset imports in `src/data/images.ts` so feature files no longer hardcode asset paths.
- Moved the placeholder recipe-detail images from `assets/mock_images` into `assets/mock` so all static placeholders live in one folder.

## 2026-06-30 Asset sizing rule

- Updated `scripts/convert-assets.cjs` to do conversion and downscaling in one pass.
- All supported static asset formats under `assets/mock` are normalized to `.webp`.
- Oversized images are resized with aspect ratio preserved and no upscaling.

Current long-edge caps:

- Avatar assets: `256`
- Category assets: `640`
- Recipe-detail gallery assets: `1440`
- Hero and popular recipe assets: `1440`

Reason:

- Some original images were far larger than their on-screen render size, which caused avoidable decode and render cost on mobile.

## 2026-06-30 Uniwind semantic color token rule

- `text-muted-foreground` and the other semantic `text-*` / `bg-*` / `border-*` color utilities only work when their `--color-*` tokens are declared inside `@theme` in `src/global.css`.
- Defining a semantic token only under `@layer theme { :root { ... } }` keeps the runtime CSS variable, but Uniwind does not generate the utility class from that alone.
- Keep shared semantic tokens duplicated in both places when needed:
  - `@theme` for utility generation.
  - `:root` for runtime values and theming.
