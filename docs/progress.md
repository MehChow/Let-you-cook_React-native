# Current progress

> This compact section is the canonical resume point. Keep it current and move
> historical execution detail to Git, dated handoffs, or task ledgers.

- Last audited: 2026-08-09
- Current integration branch: `dev`
- Last integrated Goal checkpoint: `AUTH-11` implementation and independent
  exit-review fixes (`90c5a84`, `8abdcad`, `14bd4bd`, and `11d91d1`)
- Active feature track: Authentication and account lifecycle
- Next bounded Goal: complete remaining Android-native Auth exit evidence
- Feature branch: `codex/mvp-auth-account`
- Standalone Goal prompt: `docs/current-goal.md`
- Confirmed account-deletion policy: immediate irreversible opaque tombstone;
  credentials/profile erased, published recipes retained as "Deleted cook,"
  resolved moderation evidence retained for 24 months, former email immediately
  reusable, and all sessions denied immediately.

## Resume now

1. Start a new Codex task in this local project.
2. Select Sol High and enable Goal mode.
3. Use `docs/current-goal.md` as the complete Goal prompt.
4. Reuse `codex/mvp-auth-account` and its existing Auth worktree after verifying
   it contains current `dev` and has no unpreserved changes.
5. Discover an Android target and run the exact pending native Auth checks. Do
   not repeat the completed review or begin Recipe Data/Profile UI.
6. Before stopping, the Goal must fast-forward its verified checkpoint into
   `dev` so the next Goal file is visible from this main checkout.

Do not resume the historical whole-MVP Goal and do not use the obsolete
`codex/mvp-auth-integration` branch name.

## Completed and verified

- `BASE-01` through `BASE-06`: Foundation exit gate complete.
- `API-01` through `API-07`: API contract/mobile data foundation exit gate
  complete and merged into `dev`.
- `AUTH-01` through `AUTH-09`: `/v1` persistence, SecureStore sessions, refresh,
  invalidation, logout, SMTP/Mailpit verification, and password reset exist.
- `AUTH-10`: deletion tombstones identity, erases private data, immediately
  denies sessions, retains required references, and permits email reuse.
- `AUTH-11`: scoped keyed-HMAC limits, stable `429`/`Retry-After`, allowlisted
  logs, and deterministic PostgreSQL Auth races are covered.
- `AUTH-01` through `AUTH-11` are implemented. The independent Auth review and
  all five confirmed fixes are complete; only native exit evidence remains.
- Latest Auth branch verification after the exit-review fixes:
  - `npm.cmd run check`: passed;
  - `npm.cmd test -- --runInBand`: 21 suites/122 tests passed;
  - `npm.cmd run server:check`: passed;
  - `npm.cmd run server:test`: 104/104 passed with zero skips;
  - `git diff --check`: passed.

## Current implementation truth

- Recipe/discovery/profile content remains mostly mocked; recipe, media,
  favourite, report, and block server routes remain stubs or `501`.
- Mobile Auth validates successful `/v1` payloads, persists one authoritative
  SecureStore session through rotation/relaunch, performs hydration refresh and
  single-flight invalidation, and retains best-effort logout/safe error mapping.
- Account deletion is transactional; protected middleware denies deleted users,
  and the mobile boundary clears persisted state only after server success.
- Refresh locks account/token rows and scopes reuse to indexed token families;
  Auth limits are bounded but single-process; password reset/deletion share
  account-first lock ordering; logs remain strictly allowlisted.

## Blockers and local-state snapshot

- Fresh real PostgreSQL/SMTP/Mailpit exit verification passed signup and
  verification, unverified denial, reset completion, `202/202/202/429` rate
  limiting with one reset delivery, password replacement, family-scoped replay,
  deletion, immediate old-token denial, and email reuse. Exact QA rows/messages
  were removed and verified at zero.
- `agent-device` Android discovery again returned no connected emulator/device.
  Pending native checks: signup confirmation lands on Home;
  resend cooldown and challenge replacement survive relaunch; unverified login
  remains outside private routes; reset completion exits an old live session;
  the old password is denied and the new password logs in; and, once
  `PROFILE-06` supplies the visible entry point, successful deletion clears
  SecureStore/auth state, exits private routes, remains signed out after
  relaunch, and both old refresh and still-live access tokens are denied.
- `dev` is local-only. No push or pull request was created.
- Migration `0004_common_krista_starr.sql` applied successfully to the guarded
  local database; it adds refresh-token families/usage time and the required
  unique/active-family indexes while revoking legacy ungrouped active sessions.
- A historical Foundation worktree remains; a Windows-locked typed-client
  directory is not registered. Do not clean either without rechecking scope.
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
| 2 | Auth/account | Review/fixes complete; native exit pending | Android-native exit evidence |
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

## Progress maintenance rules

- Keep this file below 140 lines; keep detailed evidence in Git or handoffs.
- Check roadmap items only when complete and update the backend supplement only
  for backend state.
- Before stopping, integrate the verified branch into `dev` and confirm the
  next Goal is readable from the main checkout.
