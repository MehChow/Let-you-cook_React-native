# API-04 Stable Zod DTO Contracts SDD Ledger

Plan: `docs/superpowers/plans/2026-07-30-zod-dto-contracts.md`
Design: `docs/superpowers/specs/2026-07-30-zod-dto-contracts-design.md`
Branch: `codex/mvp-dto-contracts`
Base: `dev` at `5f6450e42b60a460e2c4c81032d967a3a73f9818`
Status: complete, merged, and merged-result verified

## Decisions

- Cover only currently implemented system/auth/profile contracts and shared
  response primitives.
- Keep schemas feature-owned under `server/src/contracts`.
- Infer DTO types from Zod and reject unknown response fields.
- Preserve current request stripping, response shapes, statuses, and auth
  behavior.
- Defer future feature DTOs and signup verification behavior.

## Task Status

- API-04A: complete after clean fix-wave re-review
- API-04B: complete after clean Important-finding re-review
- API-04C: complete after clean fix-wave re-review
- Whole-branch review: clean at `34e9b1f`
- Exit verification: exact closure and merged-result gates passed
- Merge to `dev`: complete at `eca1533`

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
- 2026-07-30: exact task review found no Critical issues and two Important
  contract gaps: the error registry was not constrained to the schema's closed
  code union, and the generic cursor page type duplicated its Zod schema. Two
  Minor mutation-coverage gaps accompanied those findings.
- 2026-07-30: the fix wave constrains and runtime-compares the error registry,
  infers/re-exports the generic page type from the schema factory, checks nested
  strictness, and adds a compile-time inferred-item assignment. Focused 43/43
  and server type-check pass.
- 2026-07-30: fix-wave re-review found no remaining Critical, Important, or
  Minor issues. Fresh backend verification passed 67/67 with zero skips,
  server type-check, and `git diff --check`.
- 2026-07-30: Task 2 RED failed with `ERR_MODULE_NOT_FOUND` for the wished-for
  auth contract module. GREEN passed 13/13 focused tests.
- 2026-07-30: auth requests now consume shared schemas and all current auth
  success responses parse strict inferred DTOs. Signup/login no longer expose
  internal `refreshTokenId`; access/refresh tokens, statuses, aliases, and auth
  semantics are unchanged. Backend verification passed 71/71 with zero skips,
  server type-check, and `git diff --check`.
- 2026-07-30: Task 2 review found no Critical issues, one Important explicit
  projection gap in login's database select, and one Minor route-parse mutation
  coverage gap. Login now selects only `id`, `email`, and the password hash
  needed for verification; the response still projects only `id` and `email`.
- 2026-07-30: Task 2 re-review confirmed the Important finding closed and its
  one remaining mutation-strength Minor non-blocking.
- 2026-07-30: Task 3 RED failed with `ERR_MODULE_NOT_FOUND` for the wished-for
  profile contract module. GREEN passed 13/13 focused tests.
- 2026-07-30: profile input and both current response shapes now use strict
  inferred contracts. Server type-check passed, the backend suite passed 75/75
  with zero skips, and `git diff --check` passed.
- 2026-07-30: Task 3 review found no Critical issues, one Important missing-row
  PATCH path that produced a safe but incorrect 500, and one Minor real-route
  coverage gap.
- 2026-07-30: focused RED reproduced the missing-profile PATCH as 500 instead
  of 404. GREEN returns `resource_not_found`; the real smoke also proves
  canonical PATCH preserves exact nullable editable fields and uses inferred
  contract types. Re-review found no remaining Critical, Important, or Minor
  issues.
- 2026-07-30: whole-branch review of `dev..34e9b1f` found no Critical,
  Important, or Minor issues.
- 2026-07-30: fresh branch gates passed server type-check, backend 75/75 with
  zero skips, root lint/type-check, 16/16 native-focused Jest suites with 67/67
  tests, and `git diff --check`.
- 2026-07-30: closure docs committed at `eca1533`; API-04 fast-forwarded into
  `dev`. Fresh merged-result verification repeated server type-check, backend
  75/75 with zero skips, root lint/type-check, 16/16 native-focused Jest suites
  with 67/67 tests, and `git diff --check`. The feature branch/worktree were
  removed.
