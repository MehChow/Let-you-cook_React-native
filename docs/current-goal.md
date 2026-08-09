# Current Goal: Normalize Recipe Ingredients

Use this document as the complete prompt in a new top-level Codex Goal-mode
task with Sol High.

## Outcome

Implement the next bounded Core Recipe Taxonomy and Database Model checkpoint:

- `DATA-04` normalized ordered ingredient groups;
- `DATA-05` structured ingredient amounts, units, preparation, and ordering.

Deliver schema, forward migrations, focused database/service tests, and current
documentation. Stop after this verified checkpoint is fast-forwarded into
`dev` and a fresh bounded Goal beginning at `DATA-06` is recorded. Do not
implement `DATA-06` or later tasks, media, Recipe UI/routes, or Profile UI.

## Verified Starting State

- Workspace: `C:\Let-you-cook_React-native`
- Integration branch: `dev`
- Feature branch to reuse: `codex/mvp-recipe-data`
- Worktree to reuse: `C:\Let-you-cook_React-native\.worktrees\mvp-recipe-data`
- `BASE-01` through `BASE-06`, `API-01` through `API-07`, `AUTH-01` through
  `AUTH-11`, and `DATA-01` through `DATA-03` are complete and integrated.
- Recipe Data task commits are `cf62c49`, `6200cdf`, and `2e71d05`; do not
  rewrite or redo them.
- Recipes now have checked lifecycle/version fields and indexes, a required
  curated category foreign key, normalized tags, cascading joins, and a
  recipe-row lock that enforces at most five tags atomically.
- Seven fixed categories are seeded in this order: Breakfast, Lunch, Dinner,
  Dessert, Drinks, Vegan, and Other.
- Applied migrations end at `server/drizzle/0008_aromatic_alice.sql`.
- Latest Recipe Data evidence passed schema generation with no pending change,
  `server:check`, 120/120 backend tests with zero skips, forward migration on
  the guarded local database, and `git diff --check`.
- Recipe Data test recipe/tag/user rows were removed and verified at zero.
- `server/src/db/schema.ts` still has the provisional `ingredients` table with
  `groupTitle`, unstructured `quantity`, and one `sortOrder`.
- Recipe, media, discovery, and profile routes/UI remain outside this Goal.
- The Auth and historical Foundation worktrees remain preserved.

Verify refs, worktrees, files, dependencies, local services, and unrelated
changes rather than assuming this snapshot is still current.

## Read Before Acting

Read only the context needed for `DATA-04` and `DATA-05`:

1. `AGENTS.md`
2. The top `Current progress` section of `docs/progress.md`
3. `DATA-04`, `DATA-05`, and the Recipe Data exit in `docs/mvp-roadmap.md`
4. Recipe wizard and ingredient decisions in `docs/brief.md`
5. Contract conventions plus Recipes, `ingredient_groups`,
   `recipe_ingredients`, transactions, and migration guidance in
   `docs/api-and-data-model.md`
6. `server/docs/progress.md`
7. `server/src/db/schema.ts`, migrations/meta through `0008`, database config,
   guarded reset helpers, and focused Recipe Data database/service tests

Do not load Recipe UI, media, Profile UI, discovery, AI nutrition, or later
Recipe Data plans unless a concrete `DATA-04` or `DATA-05` dependency requires
a narrow read.

## Branch and Scope Rules

- Start from current `dev`. Reuse `codex/mvp-recipe-data` and its preserved
  worktree only after verifying the branch contains current `dev`; fast-forward
  it from `dev` when the refs have not diverged.
- Do not write Recipe Data changes in the main checkout or preserved Auth
  worktree. Preserve all unrelated changes and historical worktrees.
- Use TDD. Commit each completed task separately with its task ID prefix.
- Do not edit migrations `0000` through `0008`; generate forward migrations.
- Do not add recipe routes, mobile DTOs, screens, media storage, nutrition,
  reviews/moderation, or speculative unit taxonomies.
- A narrowly scoped ingredient aggregate service/transaction is allowed only
  to enforce group/item limits, deterministic ordering, and version updates.
- Do not spawn subagents, push, open a pull request, use Expo web, or operate an
  Android emulator/physical device.

## Required Task Order

### `DATA-04` Normalize ingredient groups

Start with failing tests for UUID group identity, required recipe ownership,
optional titles, deterministic integer positions, unique `(recipeId,
position)`, cascading deletion, and the one-to-five group boundary where a
service is needed. Add `ingredient_groups` and deliberately migrate the current
`groupTitle` representation without losing recipe ownership or group order.
Untitled ingredients belong to a real group with a nullable title; do not use a
second draft schema.

Run focused tests and `npm.cmd run server:check`, then commit:

```text
DATA-04: Normalize recipe ingredient groups
```

### `DATA-05` Structure recipe ingredients

Start with failing tests for required group and recipe references, ingredient
name, nullable numeric amount when representable, preserved display amount
text, nullable unit code and preparation note, deterministic position, unique
ordering within a group, cascading deletion, and an atomic maximum of thirty
ingredients per recipe. Replace the provisional table with
`recipe_ingredients`; migrate legacy `quantity` into display amount while
leaving numeric/unit fields null when the old text cannot be parsed safely.
Any aggregate mutation service must lock the recipe and increment its version
only after a real successful change.

Run focused tests and `npm.cmd run server:check`, then commit:

```text
DATA-05: Structure recipe ingredients
```

## Migration and Verification Gate

- Use the guarded local `letyoucook` development database only. Before any
  destructive cleanup, prove the host/database target is exact and local.
- Generate migrations with `npm.cmd run server:db:generate`.
- Inspect generated SQL and Drizzle metadata before applying it.
- Apply the forward migration with `npm.cmd run server:db:migrate` to the
  existing local development database.
- Deliberately preserve/migrate provisional ingredient rows even when the live
  development database currently contains none.
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

After `DATA-04` and `DATA-05` pass:

1. Review the bounded diff against the roadmap and approved data contract.
2. Fix only confirmed findings within this Goal and rerun affected checks.
3. Update `docs/mvp-roadmap.md`, `docs/progress.md`,
   `server/docs/progress.md`, and contract docs when implementation makes them
   stale.
4. Replace this file with one fresh bounded Recipe Data Goal beginning at
   `DATA-06`; do not execute it.
5. Commit final bounded handoff documentation with a `DATA-05` prefix.
6. Fast-forward `codex/mvp-recipe-data` into the main `dev` checkout while
   preserving unrelated changes.
7. Verify the two refs and trees are identical and the next Goal is readable
   from `dev`.
8. Preserve the Recipe Data feature branch/worktree for the next bounded Goal.

## Done When

- `DATA-04` and `DATA-05` each have focused red/green evidence and a separate
  task-ID commit.
- PostgreSQL/Drizzle represents normalized ordered ingredient groups and
  structured ingredients, including the confirmed group/item limits.
- Forward migration from the existing local development state succeeds.
- Final server check/tests and `git diff --check` pass with no required skips.
- Documentation matches verified truth; `DATA-06` and later tasks remain
  unchecked.
- The feature worktree is clean and preserved.
- The verified branch is fast-forwarded into `dev`; refs and trees are
  identical.
- A fresh bounded Goal beginning at `DATA-06` is readable from `dev` but has not
  been executed.

Stop at this boundary.
