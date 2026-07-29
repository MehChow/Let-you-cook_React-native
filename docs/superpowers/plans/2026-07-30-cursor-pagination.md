# API-03 Cursor Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development or superpowers:executing-plans to
> implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add a reusable, strict forward-cursor contract and record exact
deterministic sort keys for every planned paginated list.

**Architecture:** A pure server HTTP utility parses common page fields, encodes
versioned cursor values bound to normalized query context, safely decodes them,
and constructs `limit + 1` pages. Future features retain ownership of their
typed Drizzle seek predicates.

**Tech Stack:** Node 20+, TypeScript 6, Zod 4, Node test runner through `tsx`.

## Global Constraints

- Work only on branch `codex/mvp-pagination` in
  `C:\Let-you-cook_React-native\.worktrees\mvp-pagination`.
- Follow
  `docs/superpowers/specs/2026-07-30-cursor-pagination-design.md`.
- Do not add or change routes, mobile code, database schema, migrations, recipe
  DTOs, typed Hono clients, or TanStack Query.
- Do not implement generic Drizzle SQL or feature queries.
- Do not sign, encrypt, or treat cursors as authorization.
- Use strict TypeScript without `any`.
- Add a short intent comment above every named function and assigned arrow
  function.
- Follow RED-GREEN-REFACTOR and preserve focused failing evidence.
- Never build or test Expo web.
- Do not check `API-03` until task review, whole-branch review, and fresh exit
  verification pass.

## File Map

- Create `server/src/http/pagination.ts`: shared constants, query schema,
  cursor codec, public types, and page builder.
- Create `server/src/http/pagination.test.ts`: focused contract and mutation
  coverage.
- Modify `docs/api-and-data-model.md`: exact cursor and deterministic-order
  rules.
- Modify `docs/progress.md`: correct the merged API-02 state and record API-03
  evidence at closure.
- Modify `server/docs/progress.md`: backend-specific API-03 handoff.
- Modify `docs/mvp-roadmap.md`: check API-03 only after all gates pass.

---

### Task 1: API-03A — Add strict cursor pagination primitives

**Files:**
- Create: `server/src/http/pagination.ts`
- Create: `server/src/http/pagination.test.ts`

**Interfaces:**
- Produces: `DEFAULT_PAGE_SIZE`, `MAX_PAGE_SIZE`, `MAX_CURSOR_LENGTH`,
  `paginationQuerySchema`, cursor types, `encodeCursor`, `decodeCursor`,
  `buildCursorPage`, and page types.
- Guarantees: version 1 base64url tokens, exact context/key-count validation,
  strict page limits, and `limit + 1` page construction.
- Defers: route validators and typed feature seek predicates.

- [ ] **Step 1: Establish the isolated baseline**

Run:

```powershell
npm.cmd ci
npm.cmd --prefix server ci
if (-not (Test-Path "server/.env")) {
  Copy-Item "server/.env.example" "server/.env"
}
npm.cmd run server:check
npm.cmd run server:test
git status --short --branch
```

Expected: type-check and 50 backend tests pass with zero skips. Only the
approved design/plan are uncommitted.

- [ ] **Step 2: Write focused cursor and page tests**

Create `server/src/http/pagination.test.ts`. Cover:

- missing `limit` becomes 20;
- `"1"` and `"50"` parse, while `"0"`, `"01"`, `"1.5"`, `"+1"`, `"1e1"`,
  `" 1"`, and `"51"` fail;
- empty and oversized cursor queries fail;
- context key insertion order does not change encoded output;
- output contains only the URL-safe base64 alphabet;
- a cursor round-trips strings, finite numbers, and null;
- malformed base64/JSON, wrong version, wrong context, wrong value count,
  nested values, booleans, `NaN`, and infinity fail;
- `limit + 1` input returns `limit` items and a cursor for the last returned
  item;
- `limit` or fewer rows return all items with null cursor;
- invalid limits and more than `limit + 1` rows throw programmer errors;
- the helper does not mutate input rows.

- [ ] **Step 3: Run RED**

Run:

```powershell
npm.cmd --prefix server exec -- tsx --env-file=server/.env --test server/src/http/pagination.test.ts
```

Expected: module resolution or export failure because the pagination module
does not exist.

- [ ] **Step 4: Implement the minimal pure utility**

Create `server/src/http/pagination.ts` with:

- a strict Zod query schema;
- a closed version-1 internal payload schema;
- stable context-key normalization;
- base64url JSON encode/decode;
- a discriminated decode result without exposed parse exceptions;
- a generic immutable page builder.

Keep the module independent of Hono, Drizzle, routes, and database tables.

- [ ] **Step 5: Run GREEN and focused mutation checks**

Run:

```powershell
npm.cmd --prefix server exec -- tsx --env-file=server/.env --test server/src/http/pagination.test.ts
npm.cmd run server:check
npm.cmd run server:test
git diff --check
```

Expected: focused tests, type-check, and the backend suite pass with zero skips.
Temporarily changing context comparison, value-count comparison, final-item
cursor selection, and maximum limit must each break a focused assertion; revert
each mutation.

- [ ] **Step 6: Commit**

```powershell
git add server/src/http/pagination.ts server/src/http/pagination.test.ts
git commit -m "API-03: Add cursor pagination primitives"
git status --short --branch
```

Write the SDD task report with RED/GREEN output and submit the exact commit for
task review.

---

### Task 2: API-03B — Publish deterministic ordering rules

**Files:**
- Modify: `docs/api-and-data-model.md`
- Modify: `docs/progress.md`
- Modify: `server/docs/progress.md`
- Modify: `docs/mvp-roadmap.md`
- Modify: `.superpowers/sdd/2026-07-30-cursor-pagination/progress.md`

**Interfaces:**
- Consumes: the reviewed Task 1 API.
- Guarantees: future features know exact context, keyset, tie-breaker, null,
  validation, and page-construction requirements.

- [ ] **Step 1: Audit the durable contract**

Confirm the documented rules specify:

- versioned base64url tokens and no security reliance on cursor opacity;
- exact normalized query-context matching;
- default 20 and maximum 50;
- `limit + 1` construction;
- every order expression in the cursor and an immutable unique final key;
- identical order/seek direction and explicit null behavior;
- exact initial sort tuples for recipe, authored, own, favourite, and review
  lists;
- live-page rather than snapshot semantics;
- invalid cursors map to `validation_failed.cursor`.

- [ ] **Step 2: Update durable and live documentation**

Move the approved contract from the design into
`docs/api-and-data-model.md`. Correct the stale API-02 pending-review wording
in both progress files, then record API-03 implementation and verification.
Check only `API-03` in the roadmap after review and exit gates pass.

- [ ] **Step 3: Run documentation and full exit gates**

Run:

```powershell
npm.cmd run server:check
npm.cmd run server:test
npm.cmd run check
npm.cmd test -- --runInBand
git diff --check
git status --short --branch
```

Expected: backend tests have zero skips, all native-focused Jest suites pass,
diff-check passes, and only intentional API-03 documentation is uncommitted.

- [ ] **Step 4: Review and commit**

Review the exact documentation diff against the design and Task 1 interface.
Then run:

```powershell
git add docs/api-and-data-model.md docs/progress.md server/docs/progress.md docs/mvp-roadmap.md
git commit -m "API-03: Define deterministic list ordering"
git status --short --branch
```

Record review evidence in the ignored SDD ledger.

---

## Whole-Branch Closure

- [ ] Review `dev..HEAD` against the approved design and plan.
- [ ] Resolve all Critical and Important findings; re-review any fix wave.
- [ ] Run focused pagination tests, server type-check, the full backend suite
  with zero skips, root check, native-focused Jest, and `git diff --check`.
- [ ] Confirm the branch is clean and API-03 contains no feature query,
  schema, migration, mobile, or API-04 work.
- [ ] Fast-forward `codex/mvp-pagination` into `dev`.
- [ ] Re-run the exit verification on the merged `dev` tree.
- [ ] Remove the merged feature branch/worktree.
- [ ] Start API-04 from the exact verified `dev` head unless the 04:00 HKT
  stop checkpoint has arrived.

## Completion Conditions

API-03 is complete only when the shared codec/page builder is reviewed and
tested, durable ordering rules are current, all broad gates pass, the roadmap
is checked, the clean feature branch is fast-forwarded into `dev`, and the
merged result is freshly verified.
