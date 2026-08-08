# API-06 Query Client Policy Ledger

- Branch: `codex/mvp-query-client`
- Base: `dev` at `66244abbd2e5237c901e86f8869c46bd1df7444c`
- Design: `docs/superpowers/specs/2026-08-09-query-client-policy-design.md`
- Plan: `docs/superpowers/plans/2026-08-09-query-client-policy.md`
- Status: implementation, fix wave, clean re-review, and closure gates complete;
  local fast-forward into `dev` authorized.

## Evidence

- No Expo web command used.
- API-05 merged-result gates were green before this branch was created.
- RED: focused API client/query tests passed 4/9 and failed five expected tests;
  Request inputs crashed at `path.startsWith`, and retry policy exports were absent.
- GREEN: initial focused API client/query/typed client tests passed 11/11.
- Root lint/type-check passes after installing the worktree's locked server deps.
- Review: one Important custom-origin refresh mismatch and two Minors were fixed.
  Re-review found no remaining Critical, Important, or Minor issues.
- Fix RED: status 600 was incorrectly treated as retryable. Fix GREEN passes
  12/12 focused tests, including POST method/header/body refresh replay.
- All native-focused Jest tests pass: 18 suites, 75 tests.
- Server type-check passes; server tests pass 75/75 with zero skips.
- `git diff --check` passes.
