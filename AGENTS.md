# Let You Cook - Development Context

## App Summary

Let You Cook is a recipe-focused mobile app prototype built around discovering, saving, and creating recipes. The current product surface includes a home feed with featured recipes and categories, search with filters, favourites, a profile screen, and a multi-step add-recipe wizard. Most data is still mocked and some save flows are local-only, so the codebase currently reads as a polished frontend/demo build that is moving toward fuller backend integration.

## Tech Stack

- **Expo 55** with React Native Reusables
- **Styling**: Tailwind CSS v4 via `twrnc`
- **State**: Zustand
- **Forms**: react-hook-form + zod
- **API**: Tanstack Query
- **UI**: LegendList v2 (replaces FlatList when found performance issue), Uniwind, RN-primitives
- **Auth**: Clerk
- **Storage**: react-native-mmkv

## TypeScript

- Enable `strict` mode in `tsconfig.json`
- Use interfaces for props/state, avoid `any`
- Use `React.FC` for functional components

## Code Style

- Concise, type-safe TypeScript
- Functional components + hooks (no classes)
- Arrow functions (not `function` declarations)
- Modular, feature-organized files
- Import from `react` (e.g., `import { useEffect } from "react"`)

## Naming

- camelCase for variables/functions: `isFetchingData`
- PascalCase for components: `UserProfile`
- lowercase + hyphenated directories: `user-profile`

## Styling Rules

- Error messages: `text-[11px] font-medium text-danger-500`
- Input placeholders: `text-neutral-400`
- Input values: `text-black` (no explicit type needed)
- For component that not support our custom tailwind css in className, import { colors } from "@/util/twColor", and map the tailwind color like this -> color={colors.sage[600]}
- Consistent padding, responsive design
- Use `src/components/ui/alert-dialog.tsx` for alert instead of the native Alert
- Use components from React Native Reusables under `src/components/ui/` or shared components under `src/components` for building UI components
- Use separator.tsx under `src/components/ui/` for divider
- Use `expo-image` for images

## Best Practices

- DRY principle
