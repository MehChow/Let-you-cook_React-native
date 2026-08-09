# Backend Progress

This is the compact backend supplement to `docs/progress.md`. The target API
and schema contract remains `docs/api-and-data-model.md`.

## Current backend resume point

- Active feature track: Core Recipe Taxonomy and Database Model
- Next bounded Goal: implement `DATA-04` and `DATA-05`
- Feature branch: `codex/mvp-recipe-data`
- Last integrated Goal checkpoint: Recipe lifecycle and taxonomy through
  `DATA-03`
- Goal prompt: `docs/current-goal.md`

The API contract, Auth/account track, and first Recipe Data checkpoint are
complete. Resume only ingredient normalization; do not redo completed work or
begin `DATA-06`, media, Recipe UI/routes, or Profile UI work.

## Current state

- Backend stack: Node 20+, Hono, Zod, Drizzle, and PostgreSQL.
- `/health` is unversioned; `/v1` mounts all current route families.
- Auth/profile routes and mobile callers use `/v1`; the old aliases are retired.
- Stable request IDs, error envelopes, pagination, and Auth/profile DTOs exist.
- Signup, verification, login, refresh rotation/reuse revocation, logout,
  password reset, protected profile access, and deletion are implemented.
- Recipe, image/media, favourite, report, and block routes remain mostly stubs
  or `501` responses.
- Recipes use a checked four-state lifecycle, version/timestamps, indexed query
  tuples, relational curated categories, and normalized tag joins.
- `addRecipeTag` locks the recipe aggregate, normalizes/reuses tags, rejects a
  sixth atomically, and increments the recipe version only for new assignments.
- The legacy ingredient table still combines `groupTitle`, quantity text, and
  item ordering. `DATA-04` and `DATA-05` replace that provisional shape.

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

## Completed Recipe Data checkpoint

- [x] `DATA-01`: lifecycle values/default, version, transition timestamps,
  target indexes, legacy publication backfill, and account-deletion adaptation.
- [x] `DATA-02`: fixed UUID/slug categories in curated order, idempotent
  development seeding, required recipe foreign key, and legacy slug mapping.
- [x] `DATA-03`: normalized tags, cascading composite joins, legacy JSON
  backfill, and concurrency-safe five-tag enforcement.
- [x] Migrations `0005` through `0008` generated, inspected, and applied to the
  guarded local database; a repeat generation reported no schema changes.
- [x] Verification: `server:check`, 120/120 backend tests with zero skips,
  `git diff --check`, and zero leftover Recipe Data test rows.

Primary implementation entry points are `server/src/db/schema.ts`,
`server/src/db/devData.ts`, `server/src/recipes/categories.ts`, and
`server/src/recipes/tagService.ts`. Focused tests live under
`server/src/recipes/*.test.ts`; recipe routes remain intentionally unimplemented.

## Next backend responsibilities

Implement only:

1. `DATA-04`: normalize ordered optional-title ingredient groups and migrate
   the provisional `groupTitle` representation deliberately.
2. `DATA-05`: store structured ingredient amount/display amount, unit,
   preparation, and deterministic item order with the thirty-item invariant.

Update `server/src/db/schema.ts`, generate forward Drizzle migrations without
editing applied migrations, add deterministic schema/service tests, and update
progress in the same task-ID commits. Do not implement `DATA-06` or later work
in the next Goal.

## Do not redo or expand

- Do not recreate the backend package, Auth, completed Recipe Data work,
  migrations `0000` through `0008`, contract primitives, or typed client.
- Do not import mobile runtime code into `server/`.
- Do not implement routes or UI for recipes, media, Profile, discovery, or
  authoring unless an exact `DATA-04` or `DATA-05` database test boundary
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
