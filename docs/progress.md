# Current progress

> This compact section is the canonical resume point. Keep it current and move
> historical execution detail to Git, dated handoffs, or task ledgers.

- Last audited: 2026-08-09
- Current integration branch: `dev`
- Last delivery handoff commit: `9f99a6f`
- Active feature track: Authentication and account lifecycle
- Next bounded Goal: `AUTH-01` through `AUTH-03`
- Feature branch: `codex/mvp-auth-account`
- Standalone Goal prompt: `docs/current-goal.md`

## Resume now

1. Start a new Codex task in this local project.
2. Select Sol Medium and enable Goal mode.
3. Use `docs/current-goal.md` as the complete Goal prompt.
4. Verify current `dev` and worktree state before creating or reusing
   `codex/mvp-auth-account`.
5. Stop that Goal after `AUTH-03`; the next Goal will own `AUTH-04` through
   `AUTH-06` on the same branch with Sol High.

Do not resume the historical whole-MVP Goal and do not use the obsolete
`codex/mvp-auth-integration` branch name.

## Completed and verified

- `BASE-01` through `BASE-06`: Foundation exit gate complete.
- `API-01` through `API-07`: API contract/mobile data foundation exit gate
  complete and merged into `dev`.
- Latest delivery verification at API-07 closure:
  - `npm.cmd run check`: passed;
  - `npm.cmd test -- --runInBand`: 19 suites/91 tests passed;
  - `npm.cmd run server:check`: passed;
  - `npm.cmd run server:test`: 75/75 passed with zero skips;
  - `git diff --check`: passed.
- No `AUTH-01` implementation, Auth branch, or Auth worktree existed at the
  handoff.

## Current implementation truth

- The mobile app is a polished Android-first Expo prototype whose recipe,
  discovery, favourite, review, and profile content is still mostly mocked or
  in memory.
- Sign-up reaches the backend. Mobile login is still the local demo flow.
- Server login, refresh rotation/reuse revocation, logout, access-token auth,
  and protected current-profile routes exist.
- `/v1` mounts all current application route families. Temporary unversioned
  auth/profile aliases remain until the coordinated `AUTH-01` migration.
- The mobile project has a typed Hono client, SecureStore-backed auth transport,
  single-flight refresh/replay support, bounded query retry defaults, and safe
  API-error presentation mapping.
- Recipe, media, favourite, report, and block routes remain mostly empty or
  `501`; wizard save and AI nutrition remain simulations.

## Blockers and local-state snapshot

- No code-review or automated-verification blocker remains from the API track.
- `dev` was local-only and 58 commits ahead of `origin/dev` before this workflow
  documentation change. No push or pull request was created.
- At the 04:00 HKT handoff, `letyoucook-postgres` and `letyoucook-mailpit` were
  healthy; Android, Metro, and the backend development listener were stopped.
  Recheck rather than assuming this process state is still current.
- A registered historical Foundation worktree remains at
  `.worktrees/mvp-foundation`.
- An empty Windows-locked `.worktrees/mvp-typed-client` directory was not a
  registered worktree. Recheck the exact path and locking process before any
  cleanup.
- Existing dependency audit output reported 30 vulnerabilities. No automatic
  audit fix was run because it may be breaking and is outside the current Goal.

## Deferred Foundation debt

- Development reset/seed is not atomic.
- Rejected `pool.end()` cleanup is not independently handled.
- API base URL validation still permits query/hash components.
- The long-running backend lacks signal-driven shared-pool shutdown.

These items remain scoped debt unless a current task or measured failure makes
one relevant.

## Delivery track status

| Order | Track | Status | Next bounded work |
| --- | --- | --- | --- |
| 0 | Foundation | Complete | Deferred debt only |
| 1 | API contracts | Complete | Do not redo |
| 2 | Auth/account | Next | `AUTH-01`–`AUTH-03` |
| 3 | Recipe data | Pending | After Auth exit |
| 4 | R2 media | Pending | After Recipe data |
| 5 | Profile | Pending | After Auth and Media |
| 6 | Recipe authoring | Pending | After Recipe data and Media |
| 7 | Recipe detail | Pending | After Recipe authoring |
| 8 | Home | Pending | After Recipe detail |
| 9 | Search | Pending | After Recipe detail and Home contract |
| 10 | Favourites | Pending | After Recipe detail |
| 11 | Reviews | Pending | After Recipe detail |
| 12 | Safety/moderation | Pending | After Profile, Detail, and Reviews |
| 13 | Operations/release | Pending | After core features |
| 14 | AI nutrition | Pending, last | After operations launch gate |

Use `docs/mvp-roadmap.md` for every task ID, dependency, branch, and exit gate.

## Evidence and history

- Latest exact handoff: `docs/mvp-handoff-2026-08-09-0400.md`
- API-05 through API-07 ledgers: `.superpowers/sdd/2026-08-09-*/progress.md`
- Approved MVP design: `docs/superpowers/specs/2026-07-26-mvp-delivery-design.md`
- Current workflow design:
  `docs/superpowers/specs/2026-08-09-codex-workflow-optimization-design.md`
- Git history retains the prior detailed `docs/progress.md` execution stream.

## Progress maintenance rules

After meaningful implementation:

1. Keep this top snapshot compact; target fewer than 140 lines for the whole
   file.
2. Record current branch, completed range, next Goal, fresh verification, and
   blockers—not step-by-step command narration.
3. Check `docs/mvp-roadmap.md` only when a task meets its completion definition.
4. Update `server/docs/progress.md` only for backend-specific current state.
5. Put detailed RED/GREEN evidence in the commit, bounded plan, or dated
   handoff when it materially helps later diagnosis.
6. Never use chat history as the only record of an architectural decision or
   resume point.
