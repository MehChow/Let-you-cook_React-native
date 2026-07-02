# Backend Progress

## Start Here

This file is the backend handoff. When asked to continue backend work:

1. Read [Current State](#current-state) to know what already exists.
2. Read [Do Not Redo](#do-not-redo) to avoid repeating completed setup.
3. Start the first unchecked item in [Next Task Queue](#next-task-queue).
4. After changing code, update this file with:
   - a new [Progress Log](#progress-log) entry
   - any new completed item under [Done](#done)
   - any new verification under [Verified](#verified)
   - the next unchecked task

Current task to begin: move one frontend feature off mocks, starting with profile or auth.

## Current State

- Backend lives in `server/`; mobile app code lives outside `server/`.
- API stack is Hono, Drizzle, PostgreSQL, Zod, and Node 20+.
- Local database is Docker Postgres at `postgres://postgres:postgres@localhost:5432/letyoucook`.
- `server/.env` is loaded automatically by `npm run server:dev` and `npm run server:test`.
- Auth endpoints and protected profile endpoints exist and have smoke coverage against local Postgres.
- Route groups for recipes, images, favourites, reports, and blocks exist but are still mostly stubs.
- Frontend/mobile auth integration has started with auth API wrappers.

## Do Not Redo

- Do not recreate the backend package, schema, initial migration, or route mounting.
- Do not reinstall existing backend dependencies unless `node_modules` is missing.
- Do not replace the Docker Postgres setup unless the user asks.
- Do not add Redis, queues, GraphQL, tRPC, NestJS, or extra services.
- Do not re-enable backend watch mode unless `tsx watch` is specifically being debugged.
- Do not import mobile app code into `server/`.

## Next Task Queue

- [x] Add app-side auth API wrappers under `src/features/auth/api.ts`.
- [x] Install and wire `expo-secure-store` for access and refresh token storage.
- [x] Add a shared API client wrapper that retries once after token refresh.
- [ ] Move one frontend feature off mocks, starting with profile or auth.
- [ ] Implement recipe read endpoints:
  - `GET /recipes`
  - `GET /recipes/:id`
- [ ] Add image upload URL support after Cloudflare R2 and Cloudflare Images credentials are ready.

## Progress Log

Use local time in `YYYY-MM-DD HH:mm:ss Z` format for future entries.

### 2026-07-02 13:38:34 HKT

- Created the initial backend package, database schema, migrations, auth endpoints, profile endpoints, route stubs, backend docs, and local Postgres setup.
- Verified migrations, table creation, DBeaver connection, server type-check, server tests, and root app check.
- Added backend routing rules to the root `AGENTS.md` and backend setup notes to `server/README.md`.

### 2026-07-02 14:02:46 HKT

- Updated backend scripts so `npm run server:dev` and `npm run server:test` load `server/.env` through local `tsx`.
- Verified `npm run server:dev` starts the API and `GET /health` returns `200 OK`.
- Left backend watch mode off because `tsx watch` hung during verification.

### 2026-07-02 14:06:00 HKT

- Added local Postgres API smoke coverage for signup, login, refresh, logout, and `GET /profiles/me`.
- Tightened signup error handling so non-duplicate failures are not reported as duplicate-email conflicts.

### 2026-07-02 14:12:00 HKT

- Added app-side auth API wrappers under `src/features/auth/api.ts` for signup, login, refresh, and logout.
- Added focused auth API wrapper coverage for request shape and server error propagation.
- Verified the focused auth API test and root app check.

### 2026-07-02 14:17:16 HKT

- Installed `expo-secure-store` and added its Expo config plugin.
- Added SecureStore-backed auth token storage for saving, reading, and clearing access and refresh tokens.
- Added focused token storage coverage with a native-free storage adapter.
- Verified the focused auth storage/API tests and root app check.

### 2026-07-02 15:09:27 HKT

- Added a shared app API client wrapper with access-token auth headers, one retry after refresh, shared in-flight refresh handling, and refresh-token rejection cleanup.
- Added focused API client coverage for retry, token clearing, and concurrent expired requests.
- Verified the focused API client test.

## Done

- Created a standalone `server/` package for the backend.
- Added Hono on Node with `GET /health`.
- Added route groups for `auth`, `profiles`, `recipes`, `images`, `favourites`, `reports`, and `blocks`.
- Added PostgreSQL access through Drizzle and `pg`.
- Added the initial Drizzle schema and migration for:
  - `users`
  - `profiles`
  - `refresh_tokens`
  - `recipes`
  - `recipe_images`
  - `ingredients`
  - `steps`
  - `nutrition`
  - `favourites`
  - `reports`
  - `blocks`
- Added email/password auth primitives:
  - scrypt password hashing
  - JWT access tokens
  - opaque refresh tokens stored as hashes
  - refresh-token rotation and reuse handling
- Added these auth endpoints:
  - `POST /auth/signup`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
- Added protected profile endpoints:
  - `GET /profiles/me`
  - `PATCH /profiles/me`
- Added API smoke checks for signup, login, refresh, logout, and `/profiles/me` against local Postgres.
- Added app-side auth API wrappers under `src/features/auth/api.ts`.
- Added SecureStore-backed auth token storage under `src/features/auth`.
- Added a shared app API client wrapper under `src/lib`.
- Added automatic `server/.env` loading for backend dev and test scripts.
- Added root scripts:
  - `npm run server:dev`
  - `npm run server:check`
  - `npm run server:test`
  - `npm run server:db:generate`
  - `npm run server:db:migrate`
- Moved backend planning docs into `server/docs/`.

## Verified

- Installed server dependencies with `npm install --prefix server`.
- Generated the initial migration with `npm --prefix server run db:generate`.
- Applied migrations to local Postgres with `npm run server:db:migrate`.
- Confirmed local Postgres has the 11 app tables plus `drizzle.__drizzle_migrations`.
- Connected the database to DBeaver.
- Passed server type-check with `npm run server:check`.
- Passed server tests with `npm run server:test`.
- Verified `npm run server:dev` starts the API and `GET /health` returns `200 OK`.
- Passed root app check with `npm run check`.
- Passed focused auth API wrapper test with `./server/node_modules/.bin/tsx --test src/features/auth/api.test.ts`.
- Passed focused auth token storage test with `./server/node_modules/.bin/tsx --test src/features/auth/tokenStorage.test.ts`.
- Passed focused API client test with `./server/node_modules/.bin/tsx --test src/lib/apiClient.test.ts`.

## Local Database

Current local connection:

```text
Host: localhost
Port: 5432
User: postgres
Password: postgres
Database: letyoucook
```

The server defaults to:

```text
postgres://postgres:postgres@localhost:5432/letyoucook
```

Override it with `DATABASE_URL` when using Neon, production, or another local database.

`npm run server:dev` and `npm run server:test` load `server/.env` automatically.

## What's Next

Start the first unchecked item in [Next Task Queue](#next-task-queue).
