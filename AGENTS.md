# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## App Brief

Let You Cook is a recipe-focused mobile app prototype: think Instagram for recipes. Users can discover recipe cards, search and filter recipes, favourite them, view profile/author context, read recipe details with ingredients/steps/nutrition/reviews, and create recipes through a multi-step wizard. The app has been revamped into a feature-oriented Expo Router structure: route files stay thin, shared app UI lives in `src/components`, RNR primitives stay under `src/components/ui`, feature logic/components live under `src/features/*`, and mock image imports are centralized in `src/data/images.ts`. Most data is still mocked and save flows are local-only, so treat it as a polished frontend/demo moving toward backend integration.

## Stack

- Expo 56 with Expo Router and React Compiler enabled
- React Native Reusables (RNR) and RN primitives
- Tailwind CSS v4 (Uniwind)
- Zustand, react-hook-form, zod, TanStack Query, react-native-mmkv
- Use LegendList v2 only after reproducing a real list performance issue

## Code Rules

- Write concise, modular, type-safe TypeScript
- Use interfaces for props and shared state shapes; avoid `any`
- Do not use `useMemo`, `useCallback`, or `React.memo` outside `src/components/ui`
- Extract business logic into hooks or stores when it keeps UI files small and clear
- Keep files under 150 lines when practical; split by responsibility, not abstraction

## Structure

- Keep route files thin and composition-focused
- Keep shared app UI in `src/components`
- Keep RNR primitives in `src/components/ui`
- Keep feature logic and feature-only UI in `src/features/<feature>`
- Keep direct mock asset imports in `src/data/images.ts` only

## UI Rules

- Use `expo-image` for images
- Use RNR base components from `src/components/ui` where applicable
- Use `AppScreen` for shared screen background and safe-area handling
- Reuse shared app components before adding one-off markup
- Prefer semantic color tokens from `src/global.css` over raw hex values
- Keep the current sage, rounded-card visual style unless a task explicitly asks for a redesign
- Maintain consistent padding and responsive layouts

## Naming

- camelCase for variables and functions: `isFetchingData`
- PascalCase for components: `UserProfile`
- lowercase, hyphenated directories: `user-profile`

## Testing

- Keep tests lightweight and high-value
- Prefer coverage for state transitions, persistence restore/save behavior, native failure branches, and critical error or fallback UI states

## Notes

- If anything goes wrong while debugging/implementing, try to checkout `docs/notes.md` for solutions
