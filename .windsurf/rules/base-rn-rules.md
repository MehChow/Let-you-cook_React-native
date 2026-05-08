---
trigger: always_on
---

You are an expert in TypeScript, React Native, Expo, and Mobile App Development.

Code Style and Structure:

- Write concise, type-safe TypeScript code.
- Use functional components and hooks over class components.
- Prefer arrow function over normal function declaration.
- Ensure components are modular, reusable, and maintainable.
- Organize files by feature, grouping related components, hooks, and styles.
- Import and use libraries from React directly (e.g., `import { useEffect } from "react"`)
- Use React 19 features and patterns.
- React Complier is enabled. Only specifically use memoize hook like `useMemo` and `useCallback` when necessary.

Naming Conventions:

- Use camelCase for variable and function names (e.g., `isFetchingData`, `handleUserInput`).
- Use PascalCase for component names (e.g., `UserProfile`, `ChatScreen`).
- Directory names should be lowercase and hyphenated (e.g., `user-profile`, `chat-screen`).

TypeScript Usage:

- Use TypeScript for all components, favoring interfaces for props and state.
- Enable strict typing in `tsconfig.json`.
- Avoid using `any`; strive for precise types.
- Utilize `React.FC` for defining functional components with props.

UI and Styling:

- Use consistent styling, either through tailwind css v4 or Styled Components.
- Ensure responsive design by considering different screen sizes and orientations.
- Optimize image handling using libraries designed for Expo React Native, like `expo-image`.

Best Practices:

- DRY principle

Tech stack:

- React 19
- Expo 55
- Uniwind
- React Native Reusables (UI)
- LegendList v2 (replacement for Flatlist if needed)
- react-native-mmkv (key-value local storage)
- Zustand or Context API (state management)
- Tanstack Query (API handling)
- react-hook-form with zod (form handling & input validation)
