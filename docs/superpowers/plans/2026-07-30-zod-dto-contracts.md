# API-04 Stable Zod DTO Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development or superpowers:executing-plans to
> implement this plan task-by-task. Steps use checkbox syntax.

**Goal:** Establish runtime Zod sources of truth for every currently
implemented request/success DTO and the shared response primitives.

**Architecture:** Feature-owned contract modules export schemas and inferred
types. Routes consume request schemas and parse explicitly projected response
objects before returning them; no database row types cross the boundary.

**Tech Stack:** Node 20+, TypeScript 6, Hono 4, Zod 4,
`@hono/zod-validator`, Node test runner through `tsx`.

## Global Constraints

- Work only on `codex/mvp-dto-contracts` in
  `C:\Let-you-cook_React-native\.worktrees\mvp-dto-contracts`.
- Follow
  `docs/superpowers/specs/2026-07-30-zod-dto-contracts-design.md`.
- Preserve all current paths, statuses, success bodies, request acceptance,
  auth semantics, error behavior, and request IDs.
- Do not create schemas for routes that are not implemented.
- Do not change mobile code, database schema, migrations, or API-05 client
  wiring.
- Infer DTO types from Zod; do not duplicate handwritten DTO interfaces.
- Keep response objects strict and explicitly projected.
- Add a short purpose comment above every named function or assigned arrow.
- Follow RED-GREEN-REFACTOR and record focused failing evidence.
- Never build or test Expo web.
- Do not check API-04 until task/whole-branch review and exit gates pass.

## File Map

- Create `server/src/contracts/common.ts` and its tests.
- Create `server/src/contracts/system.ts` and its tests.
- Create `server/src/contracts/auth.ts` and its tests.
- Create `server/src/contracts/profiles.ts` and its tests.
- Modify `server/src/http/errors.ts` to consume the shared closed error-code
  schema/types without changing responses.
- Modify `server/src/http/pagination.ts` to export/use shared page schemas where
  appropriate without changing codec behavior.
- Modify current system/auth/profile routes to consume contracts.
- Modify progress, roadmap, durable API contract, and SDD ledger at closure.

---

### Task 1: API-04A — Define shared and system response primitives

**Files:**
- Create: `server/src/contracts/common.ts`
- Create: `server/src/contracts/common.test.ts`
- Create: `server/src/contracts/system.ts`
- Modify: `server/src/http/errors.ts`
- Modify: `server/src/http/pagination.ts`
- Modify: `server/src/app.ts`

- [ ] Write focused RED tests for strict error envelopes, page info/generic
  pages, opaque IDs/timestamps, and the literal health response.
- [ ] Run the focused test and record the missing-module/export failure.
- [ ] Add minimal schemas and inferred types.
- [ ] Reuse the closed error-code source in API-02 helpers.
- [ ] Parse the health response and align page types without behavior changes.
- [ ] Run focused tests, server type-check/tests, and diff-check.
- [ ] Commit as `API-04: Add shared DTO primitives`.
- [ ] Submit the exact commit for task review.

---

### Task 2: API-04B — Define and consume authentication DTOs

**Files:**
- Create: `server/src/contracts/auth.ts`
- Create: `server/src/contracts/auth.test.ts`
- Modify: `server/src/routes/auth.ts`
- Modify: relevant auth smoke/validation tests

- [ ] Write RED schema tests for every current auth request/success shape,
  unknown output fields, invalid UUID/email/token values, and private-field
  rejection.
- [ ] Move route-local request schemas into the contract module.
- [ ] Parse explicitly projected signup/login/refresh/logout success DTOs.
- [ ] Preserve current statuses, aliases, and temporary signup session
  semantics.
- [ ] Run focused auth tests, server type-check/tests, and diff-check.
- [ ] Commit as `API-04: Add authentication DTO contracts`.
- [ ] Submit the exact commit for task review.

---

### Task 3: API-04C — Define and consume private-profile DTOs

**Files:**
- Create: `server/src/contracts/profiles.ts`
- Create: `server/src/contracts/profiles.test.ts`
- Modify: `server/src/routes/profiles.ts`
- Modify: profile smoke tests where needed
- Modify: `docs/api-and-data-model.md`
- Modify: `docs/progress.md`
- Modify: `server/docs/progress.md`
- Modify: `docs/mvp-roadmap.md`
- Modify: `.superpowers/sdd/2026-07-30-zod-dto-contracts/progress.md`

- [ ] Write RED tests for update input, editable/private DTOs, GET/PATCH
  wrappers, null fields, URLs, and private-field rejection.
- [ ] Move the request schema and parse explicit GET/PATCH success projections.
- [ ] Run focused and broad server gates.
- [ ] Review the exact task and whole `dev..HEAD` range.
- [ ] Resolve all Critical/Important findings and re-review fixes.
- [ ] Update durable/live documentation and check only API-04.
- [ ] Run server type-check/tests, root check, native-focused Jest, and
  diff-check.
- [ ] Commit as `API-04: Add profile DTO contracts`.

## Closure

- [ ] Verify the exact clean branch head and complete the tracked SDD ledger.
- [ ] Fast-forward into `dev` and repeat merged-result verification.
- [ ] Remove the merged branch/worktree.
- [ ] Start API-05 from exact verified `dev`, unless the 04:00 HKT stop
  checkpoint has arrived.

## Completion Conditions

API-04 is complete only when every currently implemented system/auth/profile
request and success DTO uses a reviewed Zod source of truth, shared error/page
schemas are strict, current runtime behavior is unchanged, all broad gates
pass, documentation is current, and the merged result is freshly verified.
