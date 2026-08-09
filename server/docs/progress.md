# Backend Progress

This is the compact backend supplement to `docs/progress.md`. The target API
and schema contract remains `docs/api-and-data-model.md`.

## Current backend resume point

- Active feature track: Core Recipe Taxonomy and Database Model
- Next bounded Goal: implement `DATA-01` through `DATA-03`
- Feature branch: `codex/mvp-recipe-data`
- Last integrated Goal checkpoint: Authentication and account lifecycle through
  `AUTH-11`, independent exit review, and all five confirmed fixes
- Goal prompt: `docs/current-goal.md`

The API contract and Auth/account tracks are complete. Begin only the first
bounded Recipe Data Goal; do not redo Auth or begin later Recipe Data, media,
Recipe UI, or Profile UI work.

## Current state

- Backend stack: Node 20+, Hono, Zod, Drizzle, and PostgreSQL.
- `/health` is unversioned; `/v1` mounts all current route families.
- Auth/profile routes and mobile callers use `/v1`; the old aliases are retired.
- Stable request IDs, error envelopes, pagination, and Auth/profile DTOs exist.
- Signup, verification, login, refresh rotation/reuse revocation, logout,
  password reset, protected profile access, and deletion are implemented.
- Recipe, image/media, favourite, report, and block routes remain mostly stubs
  or `501` responses.
- The prototype recipe schema still uses `isPublished`, string `categoryId`,
  and JSON tags. `DATA-01` through `DATA-03` replace those provisional shapes.

## Completed Auth work

- [x] `AUTH-01` through `AUTH-11` implementation.
- [x] Independent exit review and all five confirmed fixes.
- [x] Server typecheck and backend tests: 104/104 with zero skips.
- [x] Mobile/root checks and native-focused Jest tests: 21 suites/122 tests.
- [x] Real SMTP/PostgreSQL exit verification, including delivery, generic
  denial, reset/rate limiting, password replacement, family-scoped refresh
  replay handling, deletion, old-token denial, and email reuse.
- [x] Exact Auth QA database rows and Mailpit messages removed and verified at
  zero; migration `0004` applied successfully.

The manual Android Auth checklist was not run by Codex and is
`user-owned; not agent-verified`. It is non-blocking under the durable policy in
`AGENTS.md`; `docs/progress.md` retains the exact checklist. No native pass is
claimed.

## Next backend responsibilities

Implement only:

1. `DATA-01`: replace the provisional publication boolean with the confirmed
   `draft`, `published`, `archived`, and `removed` lifecycle; add aggregate
   version and publication/lifecycle timestamps plus contract indexes.
2. `DATA-02`: add curated category rows with stable IDs/slugs, display names,
   order, active state, and deterministic development seeds.
3. `DATA-03`: add normalized tag and recipe-tag tables with uniqueness and a
   transaction/service boundary that enforces at most five tags per recipe.

Update `server/src/db/schema.ts`, generate one or more forward Drizzle
migrations without editing applied migrations, add deterministic schema/service
tests, and update progress in the same task-ID commits. Do not implement
`DATA-04` or later work in this Goal.

## Do not redo or expand

- Do not recreate the backend package, Auth, migrations `0000` through `0004`,
  contract primitives, or typed client.
- Do not import mobile runtime code into `server/`.
- Do not implement routes or UI for recipes, media, Profile, discovery, or
  authoring unless an exact `DATA-01` through `DATA-03` database test boundary
  requires a small service utility.
- Do not expose secrets, tokens, signed URLs, or personal data in logs.

## Local database and verification

Development default:

```text
postgres://postgres:postgres@localhost:5432/letyoucook
```

Docker project `letyoucook-dev` owns PostgreSQL and Mailpit. Destructive reset
commands must pass the documented localhost and exact-database guards.

For the next bounded Goal, run focused tests during each task and finish with:

```powershell
npm.cmd run server:db:generate
npm.cmd run server:check
npm.cmd run server:test
npm.cmd run server:db:migrate
git diff --check
```

Apply the new forward migration to the existing guarded development database.
Clean-database migration certification remains `DATA-11`. Missing PostgreSQL,
skipped required tests, or absent dependencies are not passing evidence.
