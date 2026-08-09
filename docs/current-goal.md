# Current Goal: Account Lifecycle Hardening

Use this document as the complete prompt in a new Codex Goal-mode task with
Sol High.

## Outcome

Complete `AUTH-10` and `AUTH-11` on the existing Auth feature branch:

1. Implement authenticated account deletion with an explicit, documented
   retention/anonymization policy and immediate session invalidation.
2. Harden Auth with scoped rate limits, redacted logging, and adversarial
   concurrency/failure coverage.

Stop after both tasks are separately committed, relevant verification passes,
and a fresh independent Auth-track exit-review Goal is recorded. Do not begin
the exit review, `DATA-01`, or any Profile-track UI work.

## Required Product-Policy Gate

`docs/brief.md` deliberately leaves account deletion, content retention, and
moderation-evidence handling unresolved. Before changing implementation, ask
the owner to confirm one concrete policy covering at least:

- whether the identity row is retained as an opaque tombstone or erased;
- when email, password credentials, profile fields, and media references are
  erased or anonymized;
- whether and how authored public content remains visible;
- how reports and moderation evidence retain referential integrity;
- whether the deleted email may register again and when;
- whether deletion is immediate or has a reversible pending period.

Do not infer approval from this handoff. Record the confirmed policy in
`docs/brief.md`, `docs/api-and-data-model.md`, and `docs/progress.md` before
implementing it. If the owner does not decide, stop at this gate without
marking `AUTH-10` complete.

## Verified Starting State

- Workspace: `C:\Let-you-cook_React-native`
- Integration branch: `dev`
- Feature branch: `codex/mvp-auth-account`
- Worktree: `C:\Let-you-cook_React-native\.worktrees\mvp-auth-account`
- Latest Auth code checkpoint: `83dfefa` (`AUTH-09`); verify the later Goal
  handoff commit and current refs rather than assuming this code hash is HEAD.
- Completed roadmap range: `BASE-01` through `BASE-06`, `API-01` through
  `API-07`, and `AUTH-01` through `AUTH-09`.
- Signup, verification, verified login, hydration refresh, single-flight
  invalidation, logout, and password reset use `/v1` and real PostgreSQL state.
- Latest automated verification: mobile 21 suites/114 tests; backend 89/89
  tests with zero skips; root and server checks passed.
- Real SMTP/Mailpit verification passed for verification and reset delivery,
  first-session issuance, old-refresh revocation, old-password denial, and
  new-password login. The temporary QA account was removed afterward.
- No Android emulator/device was available for the exact native verification
  listed in `docs/progress.md`; preserve or resolve those pending checks.

Verify the current clean Auth branch and integrated handoff state rather than
assuming historical hashes, processes, containers, or device availability.

## Read Before Acting

Read only the context required for this bounded Goal:

1. `AGENTS.md`
2. The top `Current progress` section of `docs/progress.md`
3. `docs/mvp-roadmap.md`, especially `AUTH-10`, `AUTH-11`, and the Auth exit
4. Account/auth/privacy sections of `docs/brief.md` and
   `docs/api-and-data-model.md`
5. `docs/backend-integration/opt-setup.md`
6. `server/docs/progress.md` and `server/docs/backend-token-auth.md`
7. Current auth middleware, routes, services, schema, migrations, logging,
   request IDs, error mapping, configuration, and PostgreSQL tests
8. Current mobile Auth provider, API wrappers, session invalidation, token
   storage, and any existing profile account/logout entry points
9. `compose.dev.yaml` and local PostgreSQL/Mailpit configuration

Do not load AI nutrition, recipe/media implementation plans, Home, Search, or
later-track documents unless a concrete dependency requires them.

## Branch and Worktree

Reuse `codex/mvp-auth-account` and the existing Auth worktree. Do not create a
second Auth branch or worktree. Before writing, verify the feature branch
contains current `dev`; fast-forward it from `dev` if the refs have not
diverged. If either checkout is not clean, inspect and preserve unrelated user
changes before acting.

## Execution Rules

- Work inline in this task. Do not spawn subagents.
- Treat approved product/API decisions as settled; only the deletion-policy
  gate above requires a new product decision.
- Use TDD for every behavior change and commit each roadmap item separately:
  - `AUTH-10: Implement account deletion policy`
  - `AUTH-11: Harden authentication operations`
- Keep `DELETE /v1/users/me` authenticated and service-backed. Derive identity
  only from the access token and enforce the confirmed deletion policy in one
  transaction.
- Ensure deletion immediately revokes refresh sessions and prevents still-live
  access tokens from using protected routes. Preserve current error envelopes,
  request IDs, `/v1` contracts, and non-enumerating auth behavior.
- Evolve the schema only through forward Drizzle migrations. Preserve future
  recipe/profile/moderation relationships according to the confirmed policy;
  do not make unrelated recipe-data migrations.
- Add only Auth-scoped rate limiting here. Return stable `429` errors with a
  safe delta-seconds `Retry-After`; keep known and unknown account responses
  indistinguishable where enumeration resistance requires it.
- Keep limiter/time/key behavior injectable and deterministic in tests. Do not
  add Redis or another service; document any single-process limitation for the
  later operations track.
- Never log request bodies, raw emails, passwords, OTPs, challenge IDs, tokens,
  reset grants, signed URLs, or secrets. Test the redaction boundary and retain
  safe request IDs and operational error classification.
- Add deterministic concurrency/failure tests for at least duplicate signup,
  OTP single consumption/replacement, refresh rotation/reuse, password-reset
  grant single consumption, deletion versus session use, limiter boundaries,
  and injected email/database failures. Do not call a skipped database test a
  pass.
- Keep SecureStore-only token storage, cancellation, bounded retries, typed
  Hono client boundaries, and invalid-session navigation intact.
- `PROFILE-06` owns the eventual visible Profile deletion/logout entry points.
  Add the typed mobile deletion operation and session cleanup boundary needed
  by that task, but do not redesign or expand Profile UI in this Goal.
- Preserve unrelated user changes; do not push or open a pull request.
- Do not run Expo web.

## Verification

During each task, run focused RED/GREEN tests and the smallest relevant type
check. Generate and apply every forward migration against only the guarded
local development database. Before this Goal stops, run at least:

```powershell
npm.cmd run check
npm.cmd test -- --runInBand
npm.cmd run server:check
npm.cmd run server:test
git diff --check
```

Use real local PostgreSQL to verify deletion, immediate refresh revocation,
still-live access-token denial, and policy-prescribed anonymization/retention.
Use Mailpit for rate-limit and failure regressions where delivery matters. Use
an Android emulator/device for the affected Auth session-clear and pending
verification flows; if no device is available, record every exact pending
native check in `docs/progress.md` and never substitute web.

## Done When

- The deletion policy is owner-confirmed and documented consistently.
- `AUTH-10` and `AUTH-11` satisfy their roadmap definitions and are separately
  committed on `codex/mvp-auth-account`.
- Relevant automated checks pass without skipped required coverage, and exact
  unavailable native checks are recorded.
- `docs/progress.md`, `server/docs/progress.md`, `docs/mvp-roadmap.md`, and all
  policy/contract docs describe the verified state.
- `docs/current-goal.md` is replaced with a fresh independent Auth-track exit
  review assignment. Its first pass must be read-only; do not perform that
  review in the implementation task.
- The Auth worktree is clean and preserved.
- The verified Auth branch is fast-forwarded into the main `dev` checkout.
- `git rev-parse dev` and `git rev-parse codex/mvp-auth-account` return the same
  commit, their trees are identical, and the next Goal is readable from the
  main checkout.

Do not mark the Auth track complete, delete its feature branch/worktree, or
start Recipe Data. Stop only after this bounded checkpoint is integrated into
`dev`.
