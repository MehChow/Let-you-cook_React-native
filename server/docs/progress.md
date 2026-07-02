# Backend Progress

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

1. Add app-side auth API wrappers under `src/features/auth/api.ts`.
2. Install and wire `expo-secure-store` for access and refresh token storage.
3. Add a shared API client wrapper that retries once after token refresh.
4. Move one frontend feature off mocks, starting with profile or auth.
5. Implement recipe read endpoints:
   - `GET /recipes`
   - `GET /recipes/:id`
6. Add image upload URL support after Cloudflare R2 and Cloudflare Images credentials are ready.
