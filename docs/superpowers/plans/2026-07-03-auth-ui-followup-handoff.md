# Auth UI Follow-up Handoff

> **For the next agent:** Use inline execution only. Do not use sub-agents for this repo.

## Why This Handoff Exists

The auth flow is functionally wired and the blank-screen regression is fixed, but the UI implementation is not finished to the user's expectation.

The user explicitly called out three remaining problems:

1. The status bar area no longer visually carries the `bg-sage-100` screen background.
2. The auth screens do not properly use the provided assets under `assets/images/auth/` as page decoration.
3. The implemented auth pages do not faithfully match the intended UI.

The user will provide the target UI images later. Do not guess the final visual composition beyond safe incremental cleanup.

---

## Current Known Good State

- The shared blank-screen regression was fixed by restoring layout-critical `flex: 1` on native `style` in `src/components/layout/AppScreen.tsx`, with Tailwind classes moved to an inner `View`.
- Auth routing and mock auth state are wired and working.
- `docs/notes.md` already documents the `AppScreen` regression and fix.

Do not revert the `AppScreen` fix while restyling auth.

---

## Current Problem Areas

### 1. Status bar background mismatch

Likely files:

- `src/components/layout/AppScreen.tsx`
- `src/app/_layout.tsx`
- Any auth-specific shell wrapper such as `src/features/auth/components/AuthShell.tsx`

What to check:

- Whether the safe-area top region is actually painted with `bg-app-screen` / sage background after the inner `View` refactor.
- Whether `StatusBar` appearance and the top safe-area background are visually aligned on auth screens and private screens.
- Whether auth screens need a top-level background container above the scroll content instead of relying only on `AppScreen`.

Important:

- The user specifically said the status bar should have the `bg-sage-100` look again.
- Fix the visual background without reintroducing the old `SafeAreaView.className` layout bug.

### 2. Auth image usage is incomplete

Available assets:

- `assets/images/auth/login-bg.webp`
- `assets/images/auth/login-bg2.webp`
- `assets/images/auth/forget-password.webp`
- `assets/images/auth/forget-password2.webp`
- `assets/images/auth/email-otp.webp`
- `assets/images/auth/create-new-password.webp`

Current issue:

- The pages technically reference some assets, but they are not used in a way that satisfies the design intent.
- The user explicitly said the pages were not really decorated with the provided auth images.

What the next pass should do:

- Re-evaluate each auth screen individually.
- Use the provided auth images as real layout/decorative elements, not just as small or token background attachments.
- Keep direct asset references centralized in `src/data/images.ts`.

### 3. Auth pages do not follow the intended UI

Current files:

- `src/features/auth/LoginScreen.tsx`
- `src/features/auth/ForgotPasswordScreen.tsx`
- `src/features/auth/EmailOtpScreen.tsx`
- `src/features/auth/CreateNewPasswordScreen.tsx`
- `src/features/auth/components/AuthShell.tsx`
- `src/features/auth/components/AuthTextField.tsx`
- `src/features/auth/components/AuthPrimaryButton.tsx`
- `src/features/auth/components/AuthBackButton.tsx`
- `src/features/auth/components/AuthFooterLink.tsx`

What happened:

- The first implementation was functional-first and not faithful enough to the provided/expected UI.
- The user wants the later pass to follow the actual UI more closely once reference images are supplied.

Instruction for next pass:

- Treat the provided UI images as the implementation boundary.
- Do not redesign from scratch.
- Keep the route/auth logic intact and focus the next pass on auth-shell composition, spacing, image placement, and visual fidelity.

---

## Suggested Execution Order

1. Wait for the user to provide the UI reference images.
2. Compare each target screen against the current auth screen implementation.
3. Fix the shared auth shell first if the same layout pattern drives all four screens.
4. Restore the correct top safe-area/status-bar background treatment.
5. Rework each auth screen to use the provided auth assets in a way that matches the references.
6. Verify the auth screens still render without reintroducing the `AppScreen` bug.

---

## Guardrails

- Do not touch the auth/session logic unless a UI requirement forces a tiny navigation change.
- Do not move direct image imports out of `src/data/images.ts`.
- Do not reintroduce `className="flex-1 ..."` directly on `react-native-safe-area-context` `SafeAreaView`.
- Do not broaden this into a global design refresh.
- Keep the current sage visual language unless the reference UI clearly differs.

---

## Files Most Likely To Change Next

- `src/components/layout/AppScreen.tsx`
- `src/app/_layout.tsx`
- `src/data/images.ts`
- `src/features/auth/components/AuthShell.tsx`
- `src/features/auth/LoginScreen.tsx`
- `src/features/auth/ForgotPasswordScreen.tsx`
- `src/features/auth/EmailOtpScreen.tsx`
- `src/features/auth/CreateNewPasswordScreen.tsx`

---

## Verification Checklist For The Next Pass

- Auth screens render with no blank screen.
- Top safe-area/status-bar region visually matches the intended sage background.
- Auth assets are visibly and intentionally used on each auth screen.
- The final layout matches the supplied UI references closely.
- `npm run lint`
- `npx tsc --noEmit`

---

## Context Summary

- The blank-screen bug was a shared `AppScreen` layout regression, not the auth hydration logic.
- The current auth implementation is acceptable as a behavioral scaffold only.
- The next pass should be a UI fidelity pass once the user provides the actual screen references.
