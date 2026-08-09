# Current Goal: Auth Session Lifecycle

Use this document as the complete prompt in a new Codex Goal-mode task with
Sol High.

## Outcome

Complete `AUTH-04` through `AUTH-06` on the existing Auth feature branch:

1. During app hydration, refresh once when the stored access token is expired
   but a refresh token is available.
2. Coordinate concurrent expiry/refresh failures and navigate an invalid
   session back to login exactly once.
3. Revoke the refresh token during logout when reachable, then clear the local
   session even when the network call fails.

Stop after these three tasks are separately committed, relevant verification
passes, and the next exact Goal is recorded. Do not start `AUTH-07`.

## Verified Starting State

- Workspace: `C:\Let-you-cook_React-native`
- Integration branch: `dev`
- Feature branch: `codex/mvp-auth-account`
- Worktree: `C:\Let-you-cook_React-native\.worktrees\mvp-auth-account`
- Integrated checkpoint: `dbf887d` (`AUTH-03`)
- Completed roadmap range: `BASE-01` through `BASE-06`, `API-01` through
  `API-07`, and `AUTH-01` through `AUTH-03`.
- Auth routes/mobile wrappers use `/v1`; real signup and login persist the
  returned session through SecureStore.
- Latest automated Auth verification: mobile 19 suites/95 tests; backend 74/74
  tests with zero skips; root and server checks passed.
- Android login interaction is pending because no device/emulator was attached.

Verify the current clean Auth branch and its three task-ID commits rather than
assuming historical hashes or process state.

## Read Before Acting

Read only the context required for this bounded Goal:

1. `AGENTS.md`
2. The top `Current progress` section of `docs/progress.md`
3. `docs/mvp-roadmap.md`, especially `AUTH-04` through `AUTH-06`
4. Authentication/session sections of `docs/brief.md` and
   `docs/api-and-data-model.md`
5. Relevant files under `docs/backend-integration/`
6. `server/docs/progress.md` and `server/docs/backend-token-auth.md`
7. Current auth/session implementation and tests, especially:
   - `src/features/auth/AuthProvider.tsx`
   - `src/features/auth/api.ts`
   - `src/features/auth/session.ts`
   - `src/features/auth/tokenStorage.ts`
   - `src/lib/apiClientCore.ts`
   - auth routing/navigation tests
   - server auth/logout routes and PostgreSQL smoke tests

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
  - `AUTH-04: Refresh session during hydration`
  - `AUTH-05: Handle concurrent session expiry`
  - `AUTH-06: Revoke session on logout`
- Preserve the existing single-flight refresh transport, cancellation behavior,
  safe error mapping, typed Hono boundary, and SecureStore-only token storage.
- Logout must clear local state even when revocation is unreachable.
- Do not implement email delivery/verification, password reset, deletion, rate
  limits, or later Auth work.
- Preserve unrelated user changes; do not push or open a pull request.
- Do not run Expo web.

## Verification

During each task, run focused RED/GREEN tests and the smallest relevant type
check. Before this Goal stops, run at least:

```powershell
npm.cmd run check
npm.cmd test -- --runInBand
npm.cmd run server:check
npm.cmd run server:test
git diff --check
```

Use an Android emulator/device for login restore, expiry, and logout navigation.
If none is available, record the exact pending device checks in
`docs/progress.md`; do not substitute web.

## Done When

- `AUTH-04`, `AUTH-05`, and `AUTH-06` satisfy their roadmap definitions and are
  separately committed on `codex/mvp-auth-account`.
- Relevant automated checks pass without skipped required coverage.
- Android session lifecycle checks pass or their exact pending checks are
  recorded.
- `docs/progress.md`, `server/docs/progress.md`, and `docs/mvp-roadmap.md`
  describe the verified state.
- `docs/current-goal.md` is replaced with the next bounded assignment for
  `AUTH-07` through `AUTH-09` on the same branch using Sol High.
- The Auth worktree is clean.
- The verified Auth branch is fast-forwarded into the main `dev` checkout.
- `git rev-parse dev` and `git rev-parse codex/mvp-auth-account` return the same
  commit, their trees are identical, and the updated `docs/current-goal.md` is
  readable from `C:\Let-you-cook_React-native`.

Do not mark the entire Auth track complete, remove its worktree, or continue
into the next Goal in this task. Stop only after the bounded checkpoint is
integrated into `dev`.
