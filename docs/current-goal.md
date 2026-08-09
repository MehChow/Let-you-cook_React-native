# Current Goal: Auth API Migration and Real Login

Use this document as the complete prompt in a new Codex Goal-mode task.

## Outcome

Complete `AUTH-01` through `AUTH-03` on the Auth feature branch:

1. Move current auth/profile server routes and mobile auth wrappers to `/v1`
   under the coordinated compatibility boundary.
2. Reverify real sign-up persistence, duplicate handling, and boundary
   validation against the current contracts.
3. Replace the hard-coded mobile login path with the real backend API and
   existing SecureStore-backed session transport.

Stop after the three tasks are committed, relevant verification passes, and
the next exact Goal is recorded. Do not start `AUTH-04`.

## Verified Starting State

- Workspace: `C:\Let-you-cook_React-native`
- Integration branch: `dev`
- Last delivery/handoff commit before workflow-only documentation changes:
  `9f99a6f0b9913a78948957aef81f81273185d9e8`
- Completed roadmap range: `BASE-01` through `BASE-06`, then `API-01` through
  `API-07`.
- Latest verified delivery tree: mobile 19 suites/91 tests; backend 75/75 tests
  with zero skips; root and server checks passed.
- No Auth implementation branch or worktree existed at the handoff.
- Local PostgreSQL and Mailpit were healthy; no Android device, Metro, or Hono
  development listener was running.

Workflow documentation commits after `9f99a6f` are expected. Verify current Git
state and use the current clean `dev` head rather than assuming that historical
hash is still `HEAD`.

## Read Before Acting

Read only the context required for this bounded Goal:

1. `AGENTS.md`
2. The top `Current progress` section of `docs/progress.md`
3. `docs/mvp-roadmap.md`, especially `AUTH-01` through `AUTH-03`
4. Authentication sections of `docs/brief.md` and
   `docs/api-and-data-model.md`
5. Relevant files under `docs/backend-integration/`
6. `server/docs/progress.md`
7. Current auth/API implementation and tests, especially:
   - `src/features/auth/api.ts`
   - `src/lib/apiClientCore.ts`
   - `src/lib/typedApiClient.ts`
   - the mobile login/session store and screens
   - `server/src/app.ts`
   - current auth/profile route modules and tests

Do not load AI nutrition, media, recipe, Home, Search, or other later-track
documents unless a concrete dependency requires them.

## Branch and Worktree

Use the roadmap-owned Auth branch for the entire Auth track:

```powershell
git worktree add -b codex/mvp-auth-account `
  C:\Let-you-cook_React-native\.worktrees\mvp-auth-account dev
```

Before running it, verify that neither the branch nor registered worktree
already exists. If it exists, inspect and reuse it rather than creating a
second Auth branch. Do not use the obsolete `codex/mvp-auth-integration` branch
name from the historical handoff.

## Execution Rules

- Work inline in this task. Do not spawn subagents.
- Treat approved product/API decisions as settled. Do not repeat general MVP
  brainstorming.
- After inspecting current code, create at most one concise executable plan for
  `AUTH-01` through `AUTH-03` if cross-layer sequencing remains ambiguous.
- Use TDD for each behavior change and commit each completed roadmap item
  separately:
  - `AUTH-01: Move auth integration to v1`
  - `AUTH-02: Reverify signup persistence and validation`
  - `AUTH-03: Wire mobile login to the real API`
- Keep route files thin, preserve the typed Hono client boundary, map DTOs at
  the feature boundary, and keep tokens only in SecureStore.
- Do not implement hydration refresh, session-expired navigation, server logout
  integration, email delivery, verification, reset, or deletion; those belong
  to `AUTH-04` and later.
- Preserve unrelated user changes and do not push or open a pull request.
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

Use the Android emulator for changed rendered/native login behavior. If no
emulator is available and interactive verification is genuinely required,
record the exact pending check in `docs/progress.md`; do not substitute web.

## Done When

- `AUTH-01`, `AUTH-02`, and `AUTH-03` satisfy their roadmap definitions and are
  separately committed on `codex/mvp-auth-account`.
- Relevant automated checks pass without skipped required coverage.
- The affected Android login flow is verified or its exact device check is
  recorded as pending.
- `docs/progress.md`, `server/docs/progress.md`, and `docs/mvp-roadmap.md`
  describe the verified state.
- `docs/current-goal.md` has been replaced with the next bounded assignment:
  `AUTH-04` through `AUTH-06` on the same branch, using Sol High.
- The worktree is clean.

Do not merge the Auth branch into `dev` yet. Do not mark the entire Auth track
complete, and do not continue into the next Goal in this task.
