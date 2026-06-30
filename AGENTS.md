# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## App Brief

Let You Cook is a recipe-focused mobile app prototype built around discovering, saving, and creating recipes. The current product surface includes a home feed with featured recipes and categories, search with filters, favourites, a profile screen, and a multi-step add-recipe wizard. Most data is still mocked and some save flows are local-only, so the codebase currently reads as a polished frontend/demo build that is moving toward fuller backend integration.

## Tech Stack

- **Expo 56** with React Native Reusables (RNR)
- **Styling**: Tailwind CSS v4 (Uniwind)
- **State**: Zustand
- **Forms**: react-hook-form + zod
- **API**: Tanstack Query
- **UI**: LegendList v2 (replaces FlatList when found performance issue), RN-primitives
- **Local storage**: react-native-mmkv

## TypeScript

- Use interfaces for props/state, avoid `any`

## Code Style

- Concise, type-safe TypeScript
- Modular, feature-organized files
- Prevent using useMemo, useCallback, React.memo as it is handled by React Complier (except RNR components under src/components/ui)

## Naming

- camelCase for variables/functions: `isFetchingData`
- PascalCase for components: `UserProfile`
- lowercase + hyphenated directories: `user-profile`

## Styling Rules

- Consistent padding, responsive design
- Use `expo-image` for images
- Utilize components from RNR under src/components/ui for base component (install if needed)

## Best Practices

- DRY principle
- Extract business logic into custom hook
- Keep files small, each file under 150 lines of code

## Testing Notes

- Keep tests secondary and lightweight; prioritize high-value coverage over broad test volume
- Prefer tests for store/state transitions, persistence restore/save behavior, native failure branches, and critical error/fallback UI states
