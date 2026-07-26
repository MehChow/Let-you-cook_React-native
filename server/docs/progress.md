# Backend Progress

Backend-specific handoff. The project-wide source of truth and phased roadmap is
`docs/progress.md`; the target contract/schema is `docs/api-and-data-model.md`.

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

Current task to begin: finish auth integration/account lifecycle, then migrate
the schema/contracts before implementing recipe content routes.

## Current State

- Backend lives in `server/`; mobile app code lives outside `server/`.
- API stack is Hono, Drizzle, PostgreSQL, Zod, and Node 20+.
- Local database is Docker Postgres at `postgres://postgres:postgres@localhost:5432/letyoucook`.
- `server/.env` is loaded automatically by `npm run server:dev` and `npm run server:test`.
- Auth endpoints and protected profile endpoints exist and have smoke coverage against local Postgres.
- Route groups for recipes, images, favourites, reports, and blocks exist but are still mostly stubs.
- Frontend/mobile auth integration now uses the real signup endpoint; login and refresh hydration remain pending.

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
- [ ] Wire real mobile login, refresh-on-hydration, and server logout.
- [ ] Add `EmailSender`, SMTP/Mailpit development delivery, and a test fake.
- [ ] Implement mandatory email verification, password reset, and account
  deletion.
- [ ] Add `/v1` routing in a coordinated server/mobile change.
- [ ] Apply the recipe/category/tag/review/media schema direction from
  `docs/api-and-data-model.md`.
- [ ] Add R2 upload-intent/completion support before recipe CRUD.
- [ ] Implement recipe draft/save/publish, then recipe feed/detail reads.

## Progress Log

Use local time in `YYYY-MM-DD HH:mm:ss Z` format for future entries.

### 2026-07-27 02:17:54 HKT

- Completed `BASE-06` guarded development reset and deterministic seed tooling
  on `codex/mvp-foundation`.
- TDD RED reached `devData.test.ts` and failed with `ERR_MODULE_NOT_FOUND` for
  `devData`; GREEN passed all 4 required local-database guard tests. A separate
  IPv6-loopback regression failed before URL-hostname bracket normalization and
  then passed, bringing the focused suite to 5 tests.
- Verified ignored `server/.env`, repository Compose configuration, running
  container labels, and the live database all targeted only
  `localhost:5432/letyoucook` in `letyoucook-postgres`.
- `npm.cmd run server:db:dev:reset` exited `0` and destroyed current app-table
  data in that authorized local development database before creating the
  deterministic verified and unverified accounts.
- The direct PostgreSQL query returned exactly 2 users:
  `verified@letyoucook.local` with verification present and
  `unverified@letyoucook.local` without it.
- Verification passed: server type-check; 10 server tests with 0 failures and
  0 skips; root lint/type-check; and 16 mobile suites with 67 tests.

### 2026-07-27 00:38:00 HKT

- Completed `BASE-02` local-service provisioning on `codex/mvp-foundation`.
- Validated `compose.dev.yaml`, then reset only the documented
  `letyoucook-dev` containers and named volume before starting healthy
  PostgreSQL 17 and Mailpit `v1.30.0`.
- `npm.cmd run server:db:migrate` exited `0`; Drizzle applied the existing
  migrations to the clean local database.
- `npm.cmd run server:test` exited `0`: 5 passed, 0 failed, 0 skipped. The
  PostgreSQL auth/profile smoke test ran successfully after correcting its
  invalid 21-character fixture password to the established 20-character
  maximum.
- The original `axllent/mailpit:v1` reference was not resolvable from Docker
  Hub, so the Compose definition and active Foundation plan now pin the
  manifest-verified `axllent/mailpit:v1.30.0` release.

### 2026-07-27 00:20:03 HKT

- Completed `BASE-01` dependency and automated-test baseline on
  `codex/mvp-foundation` with Node `v24.14.0` and npm `11.9.0`.
- `npm.cmd --prefix server ci` and `npm.cmd run server:check` both exited `0`.
- `npm.cmd run server:test` exited `0`: 4 passed, 0 failed, 1 skipped of 5
  tests. The PostgreSQL auth/profile smoke test skipped because local PostgreSQL
  was unavailable; this is not database-success evidence.

### 2026-07-26 00:00:00 HKT

- Audited the full server/mobile integration and corrected the project-wide
  roadmap.
- Confirmed server auth/token rotation and current-profile endpoints exist, while
  only mobile sign-up is integrated.
- Documented the target REST/Hono RPC contract, revised data model, R2 direct
  upload flow, and final-phase AI nutrition architecture.
- Dependency executables were absent at this audit, so checks could not start;
  historical verification below remains evidence of earlier runs only.

### 2026-07-10 00:00:00 HKT

- Aligned the signup password contract to 8–20 characters on the backend.
- Wired the mobile create-account flow to `POST /auth/signup`.
- Persisted the returned server user and access/refresh token pair through the existing SecureStore session boundary.
- Left forgot-password, login integration, and refresh-on-hydration out of scope.

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

### 2026-07-10 00:00:00 HKT

- Aligned the signup password contract to 8–20 characters on the backend.
- Wired the mobile create-account flow to `POST /auth/signup` and persisted its server session response.
- Added backend signup validation coverage for the 20-character password maximum.
- Verified the focused frontend signup, session, and auth screen coverage.

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
- Wired the mobile create-account flow to the backend signup endpoint and persisted its server session response.
- Aligned backend signup password validation with the frontend 8–20 character contract.
- Added automatic `server/.env` loading for backend dev and test scripts.
- Added a destructive local app-data reset guarded to localhost hosts and the
  exact `letyoucook` database name.
- Added deterministic verified and unverified development accounts with the
  shared documented password `coffee123`.
- Added root scripts:
  - `npm run server:dev`
  - `npm run server:check`
  - `npm run server:test`
  - `npm run server:db:generate`
  - `npm run server:db:migrate`
  - `npm run server:db:dev:reset`
- Moved backend planning docs into `server/docs/`.

## Verified

Current `BASE-06` evidence:

- Passed all 4 required development-database guard tests after observing the
  missing-module RED, plus the IPv6-loopback regression after its own RED.
- Confirmed the reset target was the ignored local URL
  `localhost:5432/letyoucook` and the running `letyoucook-dev` Compose
  PostgreSQL container.
- Executed the destructive reset successfully and directly verified exactly the
  2 documented seed rows.
- Passed server type-check and all 10 server tests with 0 failures and 0 skips.
- Passed root lint/type-check and all 16 mobile suites with 67 tests.

The entries below are historical successful runs. At the 2026-07-26 audit,
`node_modules` executables were absent, so rerun the standard checks after
installing dependencies before treating this as the current baseline.

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
- Passed focused frontend signup, session, and auth screen coverage (34 tests).
- Passed direct backend signup validation coverage with the Node TypeScript loader.
- Passed backend type-check after the signup contract update.
- Validated Compose and started healthy local PostgreSQL and Mailpit services.
- Applied migrations to the reset local PostgreSQL volume.
- Passed the backend suite with the PostgreSQL auth/profile smoke test running:
  5 passed, 0 failed, 0 skipped.

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

`npm run server:db:dev:reset` destroys all local app-table data and recreates
the two documented development accounts. It refuses any host other than
`localhost`, `127.0.0.1`, or `::1`, and any database name other than
`letyoucook`.

## What's Next

Start the first unchecked item in [Next Task Queue](#next-task-queue).
