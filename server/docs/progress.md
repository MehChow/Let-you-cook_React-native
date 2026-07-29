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

Current task: integrate completed `API-03` cursor pagination and deterministic
sorting from `codex/mvp-pagination` into `dev`. The branch started at exact base
`8375a8a`; implementation commits are `90622f1` and `ed50c48`. Task and
documentation re-reviews are clean. Exact closure head `eed6807` passed focused
11/11, server type-check, backend 61/61 with zero skips, root check, and 67/67
native-focused Jest tests. Fast-forward it and repeat merged-result verification
before API-04.

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

- [x] `API-01` Introduce `/v1` while keeping `/health` unversioned; legacy
  aliases remain until `AUTH-01`.
- [x] `API-02` Define the shared error envelope and server-generated request
  IDs.
- [x] `API-03` Define cursor pagination and deterministic sorting.
- [x] Add app-side auth API wrappers under `src/features/auth/api.ts`.
- [x] Install and wire `expo-secure-store` for access and refresh token storage.
- [x] Add a shared API client wrapper that retries once after token refresh.
- [ ] Wire real mobile login, refresh-on-hydration, and server logout.
- [ ] Add `EmailSender`, SMTP/Mailpit development delivery, and a test fake.
- [ ] Implement mandatory email verification, password reset, and account
  deletion.
- [ ] Apply the recipe/category/tag/review/media schema direction from
  `docs/api-and-data-model.md`.
- [ ] Add R2 upload-intent/completion support before recipe CRUD.
- [ ] Implement recipe draft/save/publish, then recipe feed/detail reads.

## Progress Log

Use local time in `YYYY-MM-DD HH:mm:ss Z` format for future entries.

### 2026-07-30 03:09:19 +08:00

- Created `codex/mvp-pagination` from clean, verified `dev` at `8375a8a`.
  Approved the bounded API-03 design and committed its executable plan.
- Task 1 focused RED failed with `ERR_MODULE_NOT_FOUND` for the wished-for
  pagination module. GREEN passed 10/10 after adding strict limit/cursor query
  parsing, deterministic context normalization, a versioned base64url codec,
  safe exact-context/key-count decoding, and immutable `limit + 1` page
  construction.
- Fresh Task 1 gates passed: server type-check, backend 60/60 with zero skips,
  and `git diff --check`. Exact task review then ran at `90622f1`.
- Task review found no Critical issues and four Important boundary defects plus
  one Minor limit-boundary test gap. Adversarial RED passed 8/11 and failed the
  intended Unicode-ordering, decoder-strictness, and undefined-item tests.
  GREEN passed 11/11 after the single fix wave. Re-review found no remaining
  Critical, Important, or Minor issues.
- Documentation review found and closed three Important precision gaps and two
  Minors. It now specifies the standard `validation_failed` field error,
  explicit null normalization, and a strict exclusive lexicographic seek
  predicate. Documentation re-review is clean.
- Fresh branch gates after fixes passed: focused 11/11, server type-check,
  backend 61/61 with zero skips, root lint/type-check, 16/16 native-focused
  Jest suites with 67/67 tests, and `git diff --check`.
- No routes, database queries, schema, migrations, feature DTOs, mobile code,
  Expo web, Metro, or backend listener were added or run.

### 2026-07-30 02:40:57 +08:00

- Addressed the complete final API-02 review set in one wave. Existing auth
  semantics are now explicit: only an unrevoked expired token returns
  `401 refresh_token_expired`; every already-revoked token, whether replaced
  during rotation or revoked by logout, returns
  `403 refresh_token_reuse_detected` and revokes remaining active sessions.
- Added a real-Postgres logout/replay characterization. It passed 8/8
  immediately, asserting the exact 403 envelope/header request ID, the
  database revocation of another active session, and that session's subsequent
  403 response.
- Added a real-Postgres constraint-classifier regression. RED failed because
  the wished-for export did not exist; GREEN passed 9/9 after the strict
  no-cast/no-`any` implementation accepted only `users_email_unique` and
  rejected `profiles_pkey`. The signup catch now surrounds only the user
  insert, so later profile/token uniqueness failures rethrow.
- Copied the server-owned `X-Request-Id`, client-overwrite, header/body equality,
  and validation-only `fieldErrors` guarantees into
  `docs/api-and-data-model.md`; aligned the approved design/plan; and checked
  only `API-02`.
- Fresh pre-commit closure gates passed: focused 36/36; server type-check;
  backend 50/50 with zero skips; root lint/type-check; 16/16 native-focused
  Jest suites with 67/67 tests; and `git diff --check`.
- Scoped closure re-review and fresh verification on the exact committed
  closure head are pending. `API-03`, `AUTH-01`, and later work remain
  unchecked and unstarted.

### 2026-07-30 02:12:17 +08:00

- Implemented the Task 3 route closure for `API-02`: every current auth and
  profile validator uses the shared validation hook; missing/invalid access
  tokens, auth failures, missing profiles, and all current recipe, image,
  report, and block placeholders use their approved stable codes. Success
  payloads and all statuses, including `501`, are unchanged.
- `AuthVariables` now extends `RequestIdVariables` without casts or `any`.
  Database-backed coverage uses one unique email per fixture, deletes only that
  user afterward, expires only its stored refresh token, reaches reuse by
  rotate-then-replay, and proves the access token works before deleting only
  its profile.
- Initial focused RED passed 6/14 and failed 8/14 with zero skips against raw
  Zod and `{ message }` bodies. It also revealed that Drizzle wraps PostgreSQL
  code `23505`, making the intended duplicate-email `409` branch unreachable;
  the minimal cause inspection restored that existing branch. A follow-up
  mutation RED passed 15/20 and failed 5/20 with zero skips for invalid bearer
  and missing refresh/logout/profile validator mappings. Focused GREEN passed
  34/34 with zero skips.
- Fresh gates passed: server type-check; 48/48 backend tests with zero
  failures/skips; root lint/type-check; 16/16 native-focused Jest suites with
  67/67 tests; and `git diff --check`.
- Exact Task 3 review and mandatory whole-branch review are pending. `API-02`
  remains unchecked, and the next action is review rather than `API-03`.

### 2026-07-30 00:47:52 +08:00

- Implemented the canonical `v1Routes` composition for auth, profiles,
  recipes, images, favourites, reports, and blocks. The root app mounts it at
  `/v1` after unversioned `/health`, before unchanged unversioned aliases.
  `/v1/health` deliberately has no handler.
- Focused TDD RED used the Windows root-resolved equivalent
  `npm.cmd --prefix server exec -- tsx --env-file=server/.env --test
  server/src/app.test.ts`: 2/3 assertions passed and the versioned family test
  failed because `POST /v1/auth/login` was `404`, not its existing `400`.
  The minimal mount produced GREEN at 3/3. The literal brief command resolves
  `.env` and `src/app.test.ts` from the repository root under this npm
  invocation, producing setup-path failures instead of a routing result.
- Fresh verification: `npm.cmd run server:check` passed; `npm.cmd run
  server:test` passed 19/19 with 0 failures and 0 skips; `npm.cmd run check`
  passed; and `npm.cmd test -- --runInBand` passed 16/16 suites and 67/67
  tests. Only the documented `letyoucook-dev` PostgreSQL and Mailpit services
  were started; no listener, Metro, or Expo web process ran.
- Task and broad reviews passed with no Critical or Important findings. The
  closure-documentation re-review remains pending; `API-01` is checked and
  `API-02` must not begin until that re-review passes.

### 2026-07-27 03:31:00 HKT

- Resolved all three Important findings from the broad Foundation review in one
  fix wave. The development reset guard now accepts only `postgres:` and
  `postgresql:` URLs and rejects query-string host, port, `db`, and `database`
  addressing overrides.
- TDD RED passed 15/17 tests and failed specifically because
  `socket://localhost/letyoucook?db=production` and PostgreSQL database query
  overrides were still accepted. GREEN passed 17/17 backend tests with no
  failures or skips.
- Postgres `5432` and Mailpit `1025`/`8025` are published only on
  `127.0.0.1`. Every root Compose script explicitly selects project
  `letyoucook-dev`.
- Rendered Compose configuration under hostile
  `COMPOSE_PROJECT_NAME=hostile-project` still named `letyoucook-dev` and
  rendered every published port with host IP `127.0.0.1`. The authorized
  clean-volume wrapper reset under the same hostile environment removed and
  recreated only `letyoucook-dev` resources; runtime inspection confirmed both
  services healthy and their actual bindings loopback-only.
- Migrations and deterministic reset/seed succeeded on the clean volume.
  Direct queries returned exactly 2 users and 2 profiles with the intended
  verified/unverified states.
- Fresh verification passed server type-check, 17 backend tests, root
  lint/type-check, and 16 mobile suites / 67 tests.
- Four Minor findings remain deferred: reset/seed is not atomic; rejected
  `pool.end()` cleanup is not separately handled; the API base URL accepts
  query/hash components; and the long-running server has no signal-driven
  shared-pool shutdown.

### 2026-07-27 03:02:00 HKT

- Completed the fresh Foundation backend exit gate from application checkout
  `34695fcd92ee2fec6587b6945de5a52c658ecee8` on
  `codex/mvp-foundation`.
- Revalidated ignored `server/.env` as `localhost:5432/letyoucook` with no
  query-string address overrides, Compose project `letyoucook-dev`, containers
  `letyoucook-postgres` and `letyoucook-mailpit`, named volume
  `letyoucook-dev_letyoucook-postgres-data`, and live database identity
  `letyoucook|postgres`.
- The owner-authorized clean-volume reset removed only those documented local
  development resources. The documented up command recreated them, and runtime
  inspection reported PostgreSQL and Mailpit `running|healthy`; PostgreSQL
  accepted connections, Mailpit HTTP returned `200`, and SMTP port `1025` was
  reachable.
- Applied migrations to the empty volume, ran the guarded reset/seed, and
  directly verified exactly 2 users and 2 profiles. The verified seed had
  `email_verified_at` present; the unverified seed did not.
- Fresh exit verification passed: root check; 16 mobile suites / 67 tests;
  server type-check; and 14 backend tests with 0 failures and 0 skips both
  before and after the clean-volume reproduction.
- Next action is current: create the `API-01` plan before beginning `/v1`
  implementation. Deferred broad-review minors remain reset/seed atomicity and
  graceful shared-pool shutdown; no code change was made for either here.

### 2026-07-27 02:36:44 HKT

- Hardened `BASE-06` after security review with separate RED/GREEN regressions
  for query-string host redirection, malformed URL sanitization, password-free
  success output, and fixed sanitized CLI failure output.
- The database guard now refuses query-string `host` and `port` overrides
  before validating the exact local host and `letyoucook` database name.
- `DevelopmentSeedResult` and reset success output now contain only the two
  seed emails. CLI failures print only `Development database reset failed.`
  without a raw error, stack, URL, or credential.
- Revalidated ignored `server/.env` with no query override, Compose/container
  identity, and the live `letyoucook|postgres` target before rerunning the
  destructive local reset.
- Captured wrapper output contained both seed emails and no `coffee123` or
  password field; the direct query returned exactly the expected 2 rows.
- Verification passed: 9 focused tests, server type-check, 14 server tests with
  0 failures and 0 skips, root lint/type-check, and 16 mobile suites with 67
  tests.

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

Current API-02 closure evidence:

- Logout/replay real-Postgres characterization: 8/8 passed with zero skips.
- Constraint-classifier RED failed on the missing export; focused GREEN passed
  9/9 with zero skips.
- Focused contract suite passed 36/36; server type-check passed; backend suite
  passed 50/50 with zero skips.
- Root lint/type-check passed; all 16 native-focused Jest suites and 67 tests
  passed; `git diff --check` passed.
- Scoped closure re-review and exact committed-head verification remain
  pending.

Current Foundation exit evidence:

- Reproduced the documented services from an empty
  `letyoucook-dev_letyoucook-postgres-data` volume after revalidating the exact
  local development target.
- Runtime reported both PostgreSQL and Mailpit healthy; migrations applied to
  the empty database.
- The guarded reset/seed produced exactly the two documented users and two
  profiles with the expected verification states.
- Passed server type-check; all 14 server tests passed with 0 failures and 0
  skips both before and after clean-volume reproduction.
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
