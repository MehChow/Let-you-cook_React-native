# Backend Progress

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
- Passed server tests with `npm --prefix server test`.
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

## What's Next

1. Add API smoke checks for signup, login, refresh, logout, and `/profiles/me` against local Postgres.
2. Add app-side auth API wrappers under `src/features/auth/api.ts`.
3. Install and wire `expo-secure-store` for access and refresh token storage.
4. Add a shared API client wrapper that retries once after token refresh.
5. Move one frontend feature off mocks, starting with profile or auth.
6. Implement recipe read endpoints:
   - `GET /recipes`
   - `GET /recipes/:id`
7. Add image upload URL support after Cloudflare R2 and Cloudflare Images credentials are ready.
