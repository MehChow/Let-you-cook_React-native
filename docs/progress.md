# Current progress

> This compact section is the canonical resume point. Keep it current and move
> historical execution detail to Git, dated handoffs, or task ledgers.

- Last audited: 2026-08-09
- Current integration branch: `dev`
- Last integrated Goal checkpoint: `83dfefa` (`AUTH-09` code checkpoint; the
  later docs handoff commit is the current branch tip)
- Active feature track: Authentication and account lifecycle
- Next bounded Goal: `AUTH-10` through `AUTH-11`
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
5. Resolve the documented account-deletion policy gate, then stop after
   `AUTH-11`; do not begin the independent Auth exit review.
6. Before stopping, the Goal must fast-forward its verified checkpoint into
   `dev` so the next Goal file is visible from this main checkout.

Do not resume the historical whole-MVP Goal and do not use the obsolete
`codex/mvp-auth-integration` branch name.

## Completed and verified

- `BASE-01` through `BASE-06`: Foundation exit gate complete.
- `API-01` through `API-07`: API contract/mobile data foundation exit gate
  complete and merged into `dev`.
- `AUTH-01` through `AUTH-06`: `/v1` auth/profile contracts, real PostgreSQL
  persistence, SecureStore login/restore, single-flight refresh and invalidation,
  and best-effort server logout are implemented and integrated.
- `AUTH-07`: Server email delivery is application-owned, local development uses
  SMTP/Mailpit, and automated auth tests can inject an in-memory sender.
- `AUTH-08`: Signup creates an unverified account and resumable email challenge;
  login blocks unverified users, resend rotates after the server cooldown, and
  confirmation issues and persists the first full session.
- `AUTH-09`: Password recovery uses a generic request, purpose-bound OTP,
  in-memory short-lived reset grant, atomic password completion, and refresh
  session revocation.
- `AUTH-10`: Account deletion immediately and irreversibly tombstones identity,
  erases credentials/profile/private media references, revokes sessions, keeps
  published recipe and moderation references, and allows immediate email reuse.
- `AUTH-11`: Versioned Auth operations have isolated keyed-HMAC process-memory
  limits with stable `429`/`Retry-After`; logs are allowlisted and redacted; and
  deterministic PostgreSQL races cover signup, OTP, refresh, reset, and deletion.
- `AUTH-01` through `AUTH-09` are integrated into `dev`; `AUTH-10` and `AUTH-11`
  are verified on the Auth feature branch pending this Goal's final integration.
- Latest Auth branch verification:
  - `npm.cmd run check`: passed;
  - `npm.cmd test -- --runInBand`: 21 suites/115 tests passed;
  - `npm.cmd run server:check`: passed;
  - `npm.cmd run server:test`: 102/102 passed with zero skips;
  - `git diff --check`: passed.

## Current implementation truth

- The mobile app is a polished Android-first Expo prototype whose recipe,
  discovery, favourite, review, and profile content is still mostly mocked or
  in memory.
- Sign-up reaches `/v1`, persists only resumable verification state, and issues
  no tokens; confirmed verification and verified login persist sessions through
  the SecureStore boundary.
- Server login, refresh rotation/reuse revocation, logout, access-token auth,
  protected current-profile routes, verified signup, and password reset exist.
- Authenticated `DELETE /v1/users/me` enforces the confirmed tombstone policy in
  one transaction; protected middleware denies still-live access tokens for a
  deleted account, and the mobile boundary clears persisted session state after
  a successful deletion response.
- Refresh rotation now locks account and token state transactionally, so
  concurrent reuse revokes the newly rotated session. Auth limits use injectable
  clocks/keys in tests and remain intentionally single-process pending the
  operations track.
- Unexpected Auth failures log only level, safe classification, request ID,
  method, coarse route scope, and status; request bodies and sensitive exception
  data never cross the logging boundary.
- Auth/profile callers are canonicalized to `/v1`; unrelated legacy aliases
  remain outside the completed Goal.
- The mobile project has a typed Hono client, SecureStore-backed auth transport,
  refresh-on-hydration, single-flight refresh/replay, one invalid-session
  navigation transition, best-effort server logout, bounded query retry
  defaults, and safe API-error presentation mapping.
- Recipe, media, favourite, report, and block routes remain mostly empty or
  `501`; wizard save and AI nutrition remain simulations.

## Blockers and local-state snapshot

- Real SMTP/Mailpit verification passed for verification and reset delivery;
  confirmation issued the first session, reset revoked the old refresh token,
  the old password failed, and the new password logged in. The QA user was
  removed afterward.
- No Android emulator/device is installed or connected in this environment.
  Pending native checks: signup confirmation to Home; resend/cooldown and
  relaunch resume; unverified-login denial; reset completion; old-session exit;
  old-password denial; and new-password login.
- `dev` is local-only. No push or pull request was created.
- PostgreSQL and Mailpit were healthy for AUTH-09 verification; the temporary
  backend development listener was stopped afterward.
- AUTH-11 real SMTP/Mailpit verification returned `202`, `202`, `202`, then
  `429` with a positive delta-seconds `Retry-After`; exactly one reset message
  was delivered. The temporary QA database row and uniquely prefixed Mailpit
  message were removed afterward.
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
| 2 | Auth/account | In progress | `AUTH-10` through `AUTH-11` |
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
