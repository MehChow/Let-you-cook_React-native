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

## 2026-07-03 Shared `AppScreen` blank-screen regression

- Symptom: both the auth flow and the private tabs could render as blank screens on app start, even though the router was still performing the initial push animation.
- Root cause: `src/components/layout/AppScreen.tsx` applied layout-critical `flex: 1` through `className` directly on `react-native-safe-area-context`'s `SafeAreaView` again.
- Fix: keep `SafeAreaView` layout on native `style={{ flex: 1 }}` and move the Tailwind background/layout classes onto an inner `View`.
- Debugging hint: if multiple unrelated screens go blank at once, check shared wrappers like `AppScreen` before assuming auth hydration or route guards are broken.

## 2026-07-03 Auth UI follow-up

- Restyled the auth screens to match the supplied mockup more closely without touching auth/session behavior.
- `src/components/layout/AppScreen.tsx` now also paints the `SafeAreaView` background color directly so the top safe-area/status-bar region keeps the intended sage background.
- Reworked `src/features/auth/components/AuthShell.tsx` into a simpler decorated shell and moved the page-specific composition into each auth screen.
- Used the transparent assets from `assets/images/auth/` through `src/data/images.ts` as real screen decoration:
  - `login-bg.webp` for the login hero dish.
  - `login-bg2.webp` for the login corner herb accent.
  - `forget-password.webp` for the centered envelope illustration.
  - `forget-password2.webp` for the forgot-password bottom-right herb accent.
  - `email-otp.webp` for the OTP illustration.
  - `create-new-password.webp` for the reset-password whisk decoration.
- Added `src/features/auth/components/AuthOtpField.tsx` for the 6-cell OTP UI and `src/features/auth/presentation.ts` for masked-email and password-strength presentation helpers.

## 2026-07-03 Jest-only app testing

- Standardized the mobile app repo on Jest only; removed the separate `node:test` path and migrated those checks into root `__tests__/`.
- Added the lightweight Expo 56 Jest setup:
  - `jest-expo`
  - `@testing-library/react-native`
  - `jest.setup.ts`
- Current test split:
  - `__tests__/auth-screens.test.tsx` covers focused auth screen copy/layout regression checks with local mocks for native-heavy leaves.
  - `__tests__/auth-presentation.test.ts`, `auth-api.test.ts`, `auth-session.test.ts`, `auth-token-storage.test.ts`, `api-client.test.ts`, and `convert-assets.test.ts` cover small logic/service helpers.
- If future Expo screen tests fail on native-heavy imports, prefer local `jest.mock(...)` in the test file over growing global Jest setup.
