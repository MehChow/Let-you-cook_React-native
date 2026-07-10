# UI Theme Guide

## Theme

Let You Cook uses a **soft sage kitchen** aesthetic: calm, nourishing, and modern, with food imagery and gentle decorative illustrations that make practical recipe tasks feel warm and approachable. The visual language balances generous whitespace, rounded white surfaces, dark sage typography, and restrained peach accents.

Use this as the baseline for future screens. Extend the current system before introducing a new visual direction.

## Foundations

### Color

- **Screen background:** `bg-app-screen` / `bg-sage-100`.
- **Primary text:** `text-sage-900`; use `text-sage-800` when the contrast can be softer.
- **Supporting text:** `text-sage-700`; use `text-sage-400` for quieter secondary copy.
- **Primary action:** `bg-sage-600` with `active:bg-sage-700` and white text.
- **Surfaces:** `bg-white` or `bg-app-card`; use `border-neutral-200` or `border-sage-200` for soft definition.
- **Accent:** `text-accent-500` for limited emphasis, such as a resend countdown.
- **Errors:** report form errors through the app-wide Sonner toast (`toast.error`), not inline text. The root `Toaster` is positioned at `top-center`.

Use semantic color utilities from `src/global.css`; do not add raw hex colors in screen components.

### Typography

The app uses Outfit. Keep type direct, readable, and high contrast.

| Use | Classes |
| --- | --- |
| Screen title | `text-3xl font-bold text-sage-900` |
| Login hero title | `text-3xl font-bold text-sage-800` |
| Auth subtitle | `text-base leading-5 text-sage-700` |
| Field label | `text-md font-bold text-sage-600` |
| Primary button label | `text-base font-semibold text-white` |
| Supporting/footer text | `text-sm text-sage-700` or `text-neutral-600` |
| Inline action | `text-sm font-bold text-sage-600` |

For multi-line auth subtitles, use `leading-5` to keep the copy compact. Do not reintroduce the older, looser `leading-7` treatment.

### Shape, spacing, and elevation

- Prefer a readable single column with `max-w-[440px]` and `px-6` screen padding.
- Auth sections use `gap-8`; closely related controls use `gap-4`; labels and inputs use `gap-2`.
- Use `rounded-2xl` for input shells and smaller surfaces, `rounded-full` for primary actions, and `rounded-4xl` for prominent cards.
- Use subtle borders and `shadow-lg shadow-black/10` for elevated cards. Avoid hard shadows and heavy contrast.
- Preserve comfortable bottom padding and scrolling through `AuthShell`; do not force a full screen to fit by shrinking touch targets or text.

## Component Recipes

### Screen shell

Build standard mobile screens with `AppScreen`; use `AuthShell` for auth flows. `AuthShell` provides the sage safe-area background, keyboard avoidance, scrolling, and the centered content width. Keep decorative art inside its `decoration` prop so it stays non-interactive and behind content.

### Headings and decoration

- Auth recovery screens use a back button, centered title/subtitle, and a single meaningful illustration.
- Use `expo-image` with native `style` props for size and placement. Do not apply Tailwind classes to `expo-image`.
- Treat art as supporting atmosphere, never as a substitute for hierarchy or readable copy.

### Inputs

Use `AuthTextField` for auth text inputs. Its standard form is a bold sage label above a white, `rounded-2xl`, lightly bordered field with a left icon. Password fields keep the eye-toggle affordance.

Use `AuthOtpField` for one-time codes; retain its six equal, rounded boxes and numeric-only input behavior.

### Actions and navigation

- Use `AuthPrimaryButton` for the primary task on a screen: 48px-high, full-width, sage pill, white semibold text.
- Use `AuthBackButton` for a compact circular return affordance near the top of recovery screens.
- Use `AuthFooterLink` for low-emphasis navigation such as “Back to login.” Keep it visible in the natural scroll flow rather than positioning it absolutely.
- Use text-first sage actions for secondary links such as “Forgot password?”

### Feedback and states

- Disable the primary action while a form is submitting and replace its label with the active verb, such as `Sending...` or `Verifying...`.
- Send validation and request failures to `toast.error(...)`. This prevents temporary feedback from shifting the screen layout.
- Keep success, info, and warning states consistent with the existing Sonner usage; do not introduce per-screen alert banners unless the state must persist in context.

## Implementation Rules

1. Reuse the auth and shared UI primitives before adding custom markup.
2. Use semantic tokens from `src/global.css` and the existing sage, neutral, danger, and accent palettes.
3. Keep route files thin; put reusable screen UI under `src/components` or feature-specific UI under `src/features`.
4. Add short JSX comments only for major visible sections, such as `/* Header */` or `/* Login card */`.
5. Preserve the top safe-area background treatment provided by `AppScreen`.
6. Keep future UI responsive by using the established scroll container and flexible layouts rather than fixed device dimensions.
