# API-04 Stable Zod DTO Contracts SDD Ledger

Plan: `docs/superpowers/plans/2026-07-30-zod-dto-contracts.md`
Design: `docs/superpowers/specs/2026-07-30-zod-dto-contracts-design.md`
Branch: `codex/mvp-dto-contracts`
Base: `dev` at `5f6450e42b60a460e2c4c81032d967a3a73f9818`
Status: design and plan prepared; Task 1 not started

## Decisions

- Cover only currently implemented system/auth/profile contracts and shared
  response primitives.
- Keep schemas feature-owned under `server/src/contracts`.
- Infer DTO types from Zod and reject unknown response fields.
- Preserve current request stripping, response shapes, statuses, and auth
  behavior.
- Defer future feature DTOs and signup verification behavior.

## Task Status

- API-04A: pending
- API-04B: pending
- API-04C: pending
- Whole-branch review: pending
- Exit verification: pending
- Merge to `dev`: pending

## Evidence

- 2026-07-30: API-03 merged-result gates passed before creating this branch.
- 2026-07-30: delegated owner approval selected the bounded recommended design
  without a blocking question.
