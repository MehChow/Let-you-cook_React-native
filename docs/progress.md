# Current progress

> This compact section is the canonical resume point. Keep it current and move
> historical execution detail to Git, dated handoffs, or task ledgers.

- Last audited: 2026-08-09
- Current integration branch: `dev`
- Last integrated Goal checkpoint: `5bd56d9` (`AUTH-06` code checkpoint)
- Active feature track: Authentication and account lifecycle
- Next bounded Goal: `AUTH-07` through `AUTH-09`
- Feature branch: `codex/mvp-auth-account`
- Standalone Goal prompt: `docs/current-goal.md`

## Resume now

1. Start a new Codex task in this local project.
2. Select Sol High and enable Goal mode.
3. Use `docs/current-goal.md` as the complete Goal prompt.
4. Reuse `codex/mvp-auth-account` and its existing Auth worktree after verifying
   it contains current `dev` and has no unpreserved changes.
5. Stop that Goal after `AUTH-09`; do not begin account deletion or rate-limit
   hardening.
6. Before stopping, the Goal must fast-forward its verified checkpoint into
   `dev` so the next Goal file is visible from this main checkout.

Do not resume the historical whole-MVP Goal and do not use the obsolete
`codex/mvp-auth-integration` branch name.

## Completed and verified

- `BASE-01` through `BASE-06`: Foundation exit gate complete.
- `API-01` through `API-07`: API contract/mobile data foundation exit gate
  complete and merged into `dev`.
- `AUTH-01`: Auth/profile mobile wrappers and refresh transport now use `/v1`;
  the server's temporary unversioned auth/profile aliases are retired.
- `AUTH-02`: Real PostgreSQL coverage verifies persisted user/profile/session
  rows, duplicate isolation, and `/v1` validation; signup failures retain safe
  structured API metadata for mobile presentation.
- `AUTH-03`: Mobile login calls the real `/v1/auth/login` API and stores the
  returned session through the existing SecureStore-backed session boundary.
- `AUTH-04`: App hydration restores a valid session or makes one refresh
  attempt for expired access, persists rotated credentials, and clears a
  rejected or incomplete stored session.
- `AUTH-05`: Concurrent protected-request failures share one refresh; a
  rejected refresh clears credentials and invalidates private navigation once
  per established session, including subscription races.
- `AUTH-06`: Logout presents the stored refresh token for server revocation,
  then clears SecureStore and private session state even when revocation is
  unreachable.
- `AUTH-07`: Server email delivery is application-owned, local development uses
  SMTP/Mailpit, and automated auth tests can inject an in-memory sender.
- `AUTH-01` through `AUTH-06` are integrated into `dev`; the latest Auth code
  checkpoint is `5bd56d9`.
- Latest integrated Auth verification:
  - `npm.cmd run check`: passed;
  - `npm.cmd test -- --runInBand`: 20 suites/105 tests passed;
  - `npm.cmd run server:check`: passed;
  - `npm.cmd run server:test`: 74/74 passed with zero skips;
  - `git diff --check`: passed.

## Current implementation truth

- The mobile app is a polished Android-first Expo prototype whose recipe,
  discovery, favourite, review, and profile content is still mostly mocked or
  in memory.
- Sign-up and login reach the backend through `/v1`; successful responses are
  converted to the mobile session model and stored through SecureStore.
- Server login, refresh rotation/reuse revocation, logout, access-token auth,
  and protected current-profile routes exist.
- Auth/profile callers are canonicalized to `/v1`; unrelated legacy aliases
  remain outside the completed Goal.
- The mobile project has a typed Hono client, SecureStore-backed auth transport,
  refresh-on-hydration, single-flight refresh/replay, one invalid-session
  navigation transition, best-effort server logout, bounded query retry
  defaults, and safe API-error presentation mapping.
- Recipe, media, favourite, report, and block routes remain mostly empty or
  `501`; wizard save and AI nutrition remain simulations.

## Blockers and local-state snapshot

- Android verification passed on `Codex API 36`: real login reached Home, a
  valid SecureStore session survived relaunch, a temporary three-second local
  QA token expired and rotated once during hydration, and logout returned to
  login. The token lifetime was restored and the exact QA account was removed.
- `dev` is local-only. No push or pull request was created.
- PostgreSQL was healthy for the AUTH-06 exit suite. The Android QA session,
  Metro, and backend development listener were stopped before handoff.
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
| 2 | Auth/account | In progress | `AUTH-07`–`AUTH-09` |
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

- Latest pre-Auth handoff: `docs/mvp-handoff-2026-08-09-0400.md`
- API ledgers: `.superpowers/sdd/2026-08-09-*/progress.md`
- Designs remain under `docs/superpowers/specs/`; Git preserves detail.

## Progress maintenance rules

- Keep this file below 140 lines; record verified state and blockers, not
  command narration. Put detailed RED/GREEN evidence in Git or dated handoffs.
- Check roadmap items only when complete and update the backend supplement only
  for backend state.
- Before stopping, integrate the verified branch into `dev` and confirm the
  next Goal is readable from the main checkout.
