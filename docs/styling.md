# Styling Guide

Use `src/features/auth/LoginScreen.tsx` and the small auth components under `src/features/auth/components/` as the reference pattern for polished form-based UI.

## Core Direction

- Keep the existing soft sage look. Prefer semantic tokens like `text-sage-*`, `bg-app-*`, `border-neutral-*`, and `text-danger-*` over raw colors.
- Keep cards and controls rounded. The current pattern is:
  - screen card: `rounded-4xl`
  - input and secondary action shells: `rounded-2xl`
  - primary buttons and pill actions: `rounded-full`
- Prefer white or near-white surfaces on top of the sage app background.
- Use subtle borders and shadows instead of hard contrast:
  - input/button border: `border-neutral-200` or `border-sage-200`
  - elevated card: `shadow-lg shadow-black/10`

## Typography Pattern

- Main hero heading: bold, dark sage, large enough to anchor the page.
  - Current auth pattern: `text-3xl` or `text-4xl` with `font-bold` and `text-sage-800` / `text-sage-900`
- Secondary heading or supporting line: medium emphasis with lighter sage.
  - Current auth pattern: `text-base font-semibold text-sage-400` or `text-sage-700`
- Field labels: short, bold, readable.
  - Current auth pattern: `text-md font-bold text-sage-600`
- Body/helper text: neutral or mid-sage, usually `text-sm` to `text-base`
- Primary action text: semibold or bold with strong contrast
  - dark button: white text
  - inline action link: `text-sage-600`
- Error text: `text-sm text-danger-600`

## Component Mapping

This is the recurring mapping visible in the login flow:

| UI piece | Current component/pattern | Styling rule |
| --- | --- | --- |
| Screen frame | `AppScreen` via `AuthShell` | Keep the sage background, safe-area handling, centered content column, and generous horizontal padding. |
| Decorative art | `expo-image` inside `AuthShell` or local section | Use `style` props, not `className`, for image size and position. Keep decoration non-blocking and secondary to content. |
| Hero copy | plain `Text` blocks | Large bold heading, lighter supporting line, left-aligned unless the screen is explicitly centered like OTP/reset flows. |
| Main content card | `View` container | White/near-white card, large radius, soft shadow, comfortable `px`/`py`, and grouped children with consistent vertical gaps. |
| Text field | `AuthTextField` | Bold label above a rounded white field with light border, left icon, medium-weight input text, neutral placeholder, optional right affordance. |
| Primary action | `AuthPrimaryButton` | Full-width pill button, sage fill, white semibold label, darker active state. |
| Secondary action | `Pressable` or `AuthFooterLink` | Text-first treatment, no heavy chrome, sage emphasis on the actionable part. |
| Divider | simple `View` lines plus centered `Text` | Keep separators light and quiet with `neutral-200` lines and muted label text. |
| Status/error message | plain `Text` | Keep it compact and place it close to the affected form action. |

## Spacing Pattern

- Group related controls with `gap-*` instead of ad hoc margins.
- Use larger separation between major sections than between controls inside one section.
- Keep auth content in a single readable column with `max-w-[440px]`.
- Prefer padding inside surfaces over nested spacer views.

## Reuse Rule

- Reuse the existing auth primitives before creating one-off form UI:
  - `AuthShell`
  - `AuthTextField`
  - `AuthPrimaryButton`
  - `AuthFooterLink`
- Reuse shared app primitives from `src/components/ui` before adding custom base elements.
- If a new screen needs the same visual treatment, extend the existing shared component instead of cloning styles into the screen.

## Commenting Pattern For UI Files

Match `src/features/auth/LoginScreen.tsx`.

- Add short JSX block comments to separate visible page sections.
- Comment the chunks a designer or reviewer would scan:
  - `/* Header */`
  - `/* Login card */`
  - `/* Forgot password */`
  - `/* Login button */`
- Use Title Case labels and keep them literal.
- Do not comment every small element. Comment top-level sections and notable sub-sections only.
- Place the comment directly above the section it names.

## When Adding Or Editing UI

1. Start from an existing shared component or screen pattern.
2. Keep the sage palette, rounded surfaces, and soft borders unless the task explicitly asks for a new direction.
3. Use semantic tokens from `src/global.css`.
4. Add visual-section comments in the same style as `LoginScreen.tsx`.
5. If a repeated style appears in more than one screen, move it into the shared component instead of repeating the classes.
