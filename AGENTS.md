# Repo Routing

If you are handling backend-related work, skip to [Backend Rules](#backend-rules) at line 64. Do not read Expo docs unless the backend change touches the mobile app.

If you are handling frontend/mobile work, follow the Expo section first.

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

- Before modifying UI, read `docs/styling.md` and follow its styling and JSX comment conventions.
- Use `expo-image` for images
- When styling `expo-image`'s `Image`, do not use Tailwind classes in `className`; use native `style` props instead
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
- Use `npm test` for the Expo/Jest suite in root `__tests__/`; keep screen tests focused and mock native-heavy leaves locally

## Notes

- If anything goes wrong while debugging/implementing, try to checkout `docs/notes.md` for solutions

## Backend Rules

- Backend code lives in `server/`; backend docs live in `server/docs/`.
- When designing backend APIs for frontend integration, read the relevant guidance in `docs/backend-integration/` first.
- Use Hono for HTTP routing, Drizzle for PostgreSQL schema/migrations, Zod for boundary validation, and Node 20+.
- Keep `server/src/app.ts` responsible for app creation and route mounting; keep `server/src/index.ts` limited to starting the server.
- Keep route files small and REST-shaped under `server/src/routes`.
- Validate params, query strings, and JSON bodies with Zod at the route boundary.
- Do not import mobile app code into `server/`.
- Do not add Redis, queues, GraphQL, tRPC, NestJS, or extra services until a real backend bottleneck requires it.
- Prefer plain Node/Web APIs and existing dependencies before adding backend packages.
- Current backend development uses Docker with a local Postgres container named `letyoucook-postgres`; default DB URL is `postgres://postgres:postgres@localhost:5432/letyoucook`.
- Database changes must update `server/src/db/schema.ts`, generate a Drizzle migration, and pass `npm run server:check`.
- For auth, keep access tokens short-lived, refresh tokens opaque and hashed, and refresh rotation server-side.
- Use `npm run server:dev`, `npm run server:check`, `npm run server:test`, `npm run server:db:generate`, and `npm run server:db:migrate`.
- Before backend work, skim `server/docs/progress.md` and the relevant doc in `server/docs/`.
