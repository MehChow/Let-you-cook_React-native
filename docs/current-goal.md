# Current Goal: Establish Recipe Lifecycle and Taxonomy

Use this document as the complete prompt in a new top-level Codex Goal-mode
task with Sol High.

## Outcome

Implement the first bounded Core Recipe Taxonomy and Database Model checkpoint:

- `DATA-01` recipe lifecycle, aggregate version, and lifecycle timestamps;
- `DATA-02` curated ordered categories and deterministic development seeds;
- `DATA-03` normalized tags and the five-tag-per-recipe limit.

Deliver schema, forward migrations, focused database/service tests, and current
documentation. Stop after this verified checkpoint is fast-forwarded into
`dev` and a fresh bounded Goal beginning at `DATA-04` is recorded. Do not
implement `DATA-04` or later tasks, media, Recipe UI/routes, or Profile UI.

## Verified Starting State

- Workspace: `C:\Let-you-cook_React-native`
- Integration branch: `dev`
- Feature branch to create: `codex/mvp-recipe-data`
- Worktree to create: `C:\Let-you-cook_React-native\.worktrees\mvp-recipe-data`
- `BASE-01` through `BASE-06`, `API-01` through `API-07`, and `AUTH-01`
  through `AUTH-11` are complete and integrated.
- The Auth independent review and all five confirmed fixes are complete. Do not
  repeat them.
- Latest Auth automated evidence passed mobile check, 21 suites/122 Jest tests,
  server check, 104/104 backend tests with zero skips, and `git diff --check`.
- Real guarded PostgreSQL/SMTP/Mailpit Auth verification passed and its exact QA
  rows/messages were removed and verified at zero.
- The manual Android Auth checklist is `user-owned; not agent-verified` and
  non-blocking under `AGENTS.md`; no native pass is claimed.
- Applied migrations currently end at
  `server/drizzle/0004_common_krista_starr.sql`.
- `server/src/db/schema.ts` still has a provisional recipe model using
  `isPublished`, string `categoryId`, and JSON `tags`.
- No `codex/mvp-recipe-data` branch or Recipe Data worktree existed at this
  handoff.
- The main checkout has unrelated `.idea` changes. Preserve them exactly.

Verify all refs, worktrees, files, dependencies, and local services rather than
assuming this snapshot is still current.

## Read Before Acting

Read only the context needed for `DATA-01` through `DATA-03`:

1. `AGENTS.md`
2. The top `Current progress` section of `docs/progress.md`
3. `DATA-01` through `DATA-03` and the Recipe Data exit in
   `docs/mvp-roadmap.md`
4. Recipe lifecycle, taxonomy, wizard, visibility, and deletion decisions in
   `docs/brief.md`
5. Contract conventions and Taxonomy/Recipes/PostgreSQL sections in
   `docs/api-and-data-model.md`
6. `server/docs/progress.md`
7. `server/src/db/schema.ts`, current Drizzle migrations/meta, database config,
   guarded reset helpers, and existing database test patterns

Do not load Recipe UI, media, Profile UI, discovery, AI nutrition, or later
Recipe Data plans unless a concrete `DATA-01` through `DATA-03` dependency
requires a narrow read.

## Branch and Scope Rules

- Start from current `dev`. Create `codex/mvp-recipe-data` and its isolated
  worktree; do not write Recipe Data changes in the main checkout or preserved
  Auth worktree.
- Verify the branch point and baseline before writing. Preserve all unrelated
  changes and historical worktrees.
- Create at most one bounded implementation plan if the migration/service
  boundary remains ambiguous after reading the approved contracts.
- Use TDD. Commit each completed task separately with its task ID prefix.
- Do not edit migrations `0000` through `0004`; generate forward migrations.
- Do not add recipe routes, mobile DTOs, screens, media storage, ingredient
  normalization, or speculative abstractions.
- A narrowly scoped tag-assignment service/transaction is allowed only to make
  the five-tag invariant enforceable and testable for `DATA-03`.
- Do not spawn subagents, push, open a pull request, use Expo web, or operate an
  Android emulator/physical device.

## Required Task Order

### `DATA-01` Recipe lifecycle and optimistic version

Start with failing tests for the confirmed lifecycle values `draft`,
`published`, `archived`, and `removed`; a default draft state; aggregate
versioning; publication/archive/removal timestamps; and the target recipe
indexes. Replace the provisional `isPublished` representation through a
forward migration that handles existing development rows deliberately. Keep
lifecycle timestamps server-controlled at future service boundaries.

Run focused tests and `npm.cmd run server:check`, then commit:

```text
DATA-01: Add recipe lifecycle and versioning
```

### `DATA-02` Curated categories

Start with failing tests for stable category IDs/slugs, unique slugs, display
names, deterministic order, and active state. Add the category table, make
recipe category references relational, and provide idempotent ordered
development seeds. Preserve one required category per recipe without building
category APIs or UI.

Run focused tests and `npm.cmd run server:check`, then commit:

```text
DATA-02: Add curated recipe categories
```

### `DATA-03` Normalized tags

Start with failing tests for normalized unique tag slugs/labels, unique
recipe-tag pairs, cascading joins, and atomic rejection of a sixth tag. Replace
the provisional JSON tag array with `tags` and `recipe_tags`. Enforce the
five-tag maximum at the transaction/service boundary; do not rely on the mobile
client or an unsafe count-then-insert race.

Run focused tests and `npm.cmd run server:check`, then commit:

```text
DATA-03: Normalize recipe tags
```

## Migration and Verification Gate

- Use the guarded local `letyoucook` development database only. Before any
  destructive cleanup, prove the host/database target is exact and local.
- Generate migrations with `npm.cmd run server:db:generate`.
- Inspect generated SQL and Drizzle metadata before applying it.
- Apply the forward migration with `npm.cmd run server:db:migrate` to the
  existing local development database.
- Do not perform `DATA-11` clean-database migration certification in this Goal.
- Required final commands:

```powershell
npm.cmd run server:check
npm.cmd run server:test
git diff --check
```

Missing dependencies, an unavailable required database, skipped required tests,
or unapplied generated migrations are not passing evidence.

## Review and Closure

After `DATA-01` through `DATA-03` pass:

1. Review the bounded diff against the roadmap and approved data contract.
2. Fix only confirmed findings within this Goal and rerun affected checks.
3. Update `docs/mvp-roadmap.md`, `docs/progress.md`, and
   `server/docs/progress.md` with verified evidence.
4. Replace this file with one fresh bounded Recipe Data Goal beginning at
   `DATA-04`; do not execute it.
5. Commit any final bounded handoff documentation with a `DATA-03` prefix.
6. Fast-forward `codex/mvp-recipe-data` into the main `dev` checkout while
   preserving unrelated changes.
7. Verify the two refs and trees are identical and the next Goal is readable
   from `dev`.
8. Preserve the Recipe Data feature branch/worktree for the next bounded Goal.

## Done When

- `DATA-01`, `DATA-02`, and `DATA-03` each have focused red/green evidence and a
  separate task-ID commit.
- PostgreSQL/Drizzle represents the approved lifecycle, curated categories, and
  normalized tags, including the concurrency-safe five-tag limit.
- Forward migration from the existing local development state succeeds.
- Final server check/tests and `git diff --check` pass with no required skips.
- Documentation matches verified truth; later roadmap tasks remain unchecked.
- The feature worktree is clean and preserved.
- The verified branch is fast-forwarded into `dev`; refs and trees are
  identical.
- A fresh bounded Goal beginning at `DATA-04` is readable from `dev` but has not
  been executed.

Stop at this boundary.
