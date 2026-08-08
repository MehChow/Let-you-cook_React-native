# API-05 Typed Mobile Client SDD Ledger

Plan: `docs/superpowers/plans/2026-08-09-typed-mobile-client.md`
Design: `docs/superpowers/specs/2026-08-09-typed-mobile-client-design.md`
Branch: `codex/mvp-typed-client`
Base: `dev` at `7b42b6740219da9bf68b4cabe89c58e904be719f`
Status: reviewed and branch-verified; local merge pending

## Decisions

- Use `hc<AppType>` as a private typed transport, not a public API contract.
- Import server `AppType` through a TypeScript-only alias so Expo bundles no
  server runtime modules.
- Keep current raw auth/refresh clients unchanged for AUTH-01 and API-06.
- Pin both Hono installations to identical 4.12.27 package identities.
- Make the validation hook's stable 400 response explicit so its generic
  environment cannot erase mounted route schemas.

## Task Status

- Design and implementation plan: committed at `4fef929`
- Isolated baseline: 16/16 Jest suites, 67/67 tests
- Focused TDD: RED and GREEN complete
- Pre-review exit gates: complete
- Exact task review: clean with no findings
- Merge to `dev`: pending

## Evidence

- 2026-08-09: focused RED failed because `@/lib/typedApiClient` did not exist.
- 2026-08-09: focused GREEN passed 1/1 against Hono's real client with an
  injected in-memory fetch.
- 2026-08-09: root type-check exposed distinct Hono 4.11.1 and 4.12.27 nominal
  types; identical 4.12.27 installations removed that incompatibility.
- 2026-08-09: type tracing isolated missing RPC paths to validator-backed
  routers. The generic validation hook response retained its environment type;
  the stable `ValidationApiError`/400 annotation restored the full `AppType`.
- 2026-08-09: focused 1/1, server type-check, backend 75/75 with zero skips,
  root lint/type-check, 17/17 native-focused Jest suites with 68/68 tests, and
  `git diff --check` passed before review.
- 2026-08-09: exact-range review of `7b42b67..cc047a2` found no Critical,
  Important, or Minor issues and assessed the task ready to merge.
- 2026-08-09: fresh committed-head verification repeated focused 1/1, server
  type-check, backend 75/75 with zero skips, root lint/type-check, 17/17 Jest
  suites with 68/68 tests, and `git diff --check`.
- Docker PostgreSQL and Mailpit were started without reset and reported healthy.
  No Expo web command or Android UI verification ran.
