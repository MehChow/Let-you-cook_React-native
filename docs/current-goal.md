# Current Goal: Auth Verification and Recovery

Use this document as the complete prompt in a new Codex Goal-mode task with
Sol High.

## Outcome

Complete `AUTH-07` through `AUTH-09` on the existing Auth feature branch:

1. Add an application-owned `EmailSender`, local SMTP delivery to Mailpit, and
   an in-memory test fake.
2. Enforce mandatory email verification with secure OTP request/resend and
   confirmation behavior; only confirmation may issue the first full session.
3. Implement the password-reset request, OTP verification, short-lived reset
   grant, password completion, and refresh-session revocation lifecycle.

Stop after these three tasks are separately committed, relevant verification
passes, and the next exact Goal is recorded. Do not start `AUTH-10`.

## Verified Starting State

- Workspace: `C:\Let-you-cook_React-native`
- Integration branch: `dev`
- Feature branch: `codex/mvp-auth-account`
- Worktree: `C:\Let-you-cook_React-native\.worktrees\mvp-auth-account`
- Latest Auth code checkpoint: `5bd56d9` (`AUTH-06`); verify current refs and
  the later Goal-handoff commit instead of assuming that code hash is HEAD.
- Completed roadmap range: `BASE-01` through `BASE-06`, `API-01` through
  `API-07`, and `AUTH-01` through `AUTH-06`.
- Auth routes/mobile wrappers use `/v1`; real signup and login persist sessions
  through SecureStore, hydration refreshes expired access once, concurrent
  invalid refreshes leave private navigation once, and logout revokes then
  clears locally even when revocation is unreachable.
- Latest automated Auth verification: mobile 20 suites/105 tests; backend
  74/74 tests with zero skips; root and server checks passed.
- Android verification passed for real login, valid-session relaunch, expired
  access hydration with one database-confirmed refresh rotation, and logout
  navigation back to login.

Verify the current clean Auth branch and its integrated handoff state rather
than assuming historical hashes or process state.

## Read Before Acting

Read only the context required for this bounded Goal:

1. `AGENTS.md`
2. The top `Current progress` section of `docs/progress.md`
3. `docs/mvp-roadmap.md`, especially `AUTH-07` through `AUTH-09`
4. Authentication/session sections of `docs/brief.md` and
   `docs/api-and-data-model.md`
5. `docs/backend-integration/opt-setup.md`
6. `server/docs/progress.md` and `server/docs/backend-token-auth.md`
7. Current auth contracts, schema, migrations, routes, token services, config,
   and PostgreSQL smoke tests
8. Current mobile signup/login/OTP/password-reset screens, pending-reset state,
   API wrappers, provider, session, and SecureStore boundaries
9. `compose.dev.yaml` and existing Mailpit/local-service configuration

Do not load AI nutrition, media, recipe, Home, Search, or later-track documents
unless a concrete dependency requires them.

## Branch and Worktree

Reuse `codex/mvp-auth-account` and the existing Auth worktree. Do not create a
second Auth branch or worktree. Before writing, verify the feature branch
contains current `dev`; fast-forward it from `dev` if the refs have not
diverged. If either checkout is not clean, inspect and preserve unrelated user
changes before acting.

## Execution Rules

- Work inline in this task. Do not spawn subagents.
- Treat approved product/API decisions as settled; do not repeat brainstorming.
- Use TDD for every behavior change and commit each roadmap item separately:
  - `AUTH-07: Add auth email delivery`
  - `AUTH-08: Enforce email verification`
  - `AUTH-09: Implement password reset lifecycle`
- Keep email delivery behind an application-owned interface. Local development
  sends SMTP to Mailpit; automated tests inject an in-memory fake. Do not choose
  or integrate a production provider in this Goal.
- Use cryptographically secure OTP generation, keyed hashes at rest, expiry,
  attempt limits, resend cooldowns, and replacement invalidation. Never log or
  return OTPs outside the explicit in-memory test fake.
- Keep verification and reset request responses non-enumerating. Persist only
  the opaque challenge identifiers and cooldown state needed to resume mobile
  flows.
- Change signup so it creates an unverified account and sends verification but
  does not issue a session. Email confirmation issues the first access/refresh
  pair and enters Home; unverified login must not enter the private app.
- Password-reset verification must issue a short-lived, purpose-bound grant;
  completion changes the password and revokes existing refresh sessions.
- Keep the existing single-flight refresh, invalid-session navigation,
  cancellation behavior, safe error mapping, typed Hono boundary, and
  SecureStore-only token storage intact.
- Follow the migration rules for every schema change; never edit an applied
  migration.
- Do not implement account deletion, rate limits, production email-provider
  setup, recipe/media work, or later Auth tasks.
- Preserve unrelated user changes; do not push or open a pull request.
- Do not run Expo web.

## Verification

During each task, run focused RED/GREEN tests and the smallest relevant type
check. For schema changes, generate and apply a forward Drizzle migration
against the guarded local development database. Before this Goal stops, run at
least:

```powershell
npm.cmd run check
npm.cmd test -- --runInBand
npm.cmd run server:check
npm.cmd run server:test
git diff --check
```

Use Mailpit plus an Android emulator/device to verify signup verification,
resend/resume behavior, unverified-login denial, password-reset completion,
old-session revocation, and successful login with the new password. If no
device is available, record the exact pending device checks in
`docs/progress.md`; do not substitute web.

## Done When

- `AUTH-07`, `AUTH-08`, and `AUTH-09` satisfy their roadmap definitions and are
  separately committed on `codex/mvp-auth-account`.
- Relevant automated checks pass without skipped required coverage.
- Mailpit and Android verification pass or their exact pending checks are
  recorded.
- `docs/progress.md`, `server/docs/progress.md`, and `docs/mvp-roadmap.md`
  describe the verified state.
- `docs/current-goal.md` is replaced with the next bounded assignment for
  `AUTH-10` through `AUTH-11` on the same branch using Sol High.
- The Auth worktree is clean.
- The verified Auth branch is fast-forwarded into the main `dev` checkout.
- `git rev-parse dev` and `git rev-parse codex/mvp-auth-account` return the same
  commit, their trees are identical, and the updated `docs/current-goal.md` is
  readable from `C:\Let-you-cook_React-native`.

Do not mark the entire Auth track complete, remove its worktree, or continue
into the next Goal in this task. Stop only after the bounded checkpoint is
integrated into `dev`.
