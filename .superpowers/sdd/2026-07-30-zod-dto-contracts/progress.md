# API-04 Stable Zod DTO Contracts SDD Ledger

Plan: `docs/superpowers/plans/2026-07-30-zod-dto-contracts.md`
Design: `docs/superpowers/specs/2026-07-30-zod-dto-contracts-design.md`
Branch: `codex/mvp-dto-contracts`
Base: `dev` at `5f6450e42b60a460e2c4c81032d967a3a73f9818`
Status: Task 1 implemented; exact task review pending

## Decisions

- Cover only currently implemented system/auth/profile contracts and shared
  response primitives.
- Keep schemas feature-owned under `server/src/contracts`.
- Infer DTO types from Zod and reject unknown response fields.
- Preserve current request stripping, response shapes, statuses, and auth
  behavior.
- Defer future feature DTOs and signup verification behavior.

## Task Status

- API-04A: implementation complete; review pending
- API-04B: pending
- API-04C: pending
- Whole-branch review: pending
- Exit verification: pending
- Merge to `dev`: pending

## Evidence

- 2026-07-30: API-03 merged-result gates passed before creating this branch.
- 2026-07-30: delegated owner approval selected the bounded recommended design
  without a blocking question.
- 2026-07-30: isolated baseline passed server type-check and backend 61/61 with
  zero skips.
- 2026-07-30: Task 1 RED failed with `ERR_MODULE_NOT_FOUND` for the wished-for
  common contract module.
- 2026-07-30: focused GREEN passed 43/43. The first server type-check exposed a
  discriminated page-info construction mismatch; after preserving literal
  true/false branches, server type-check passed, the backend suite passed 67/67
  with zero skips, and `git diff --check` passed.
