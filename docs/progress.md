# Current progress

> This compact section is the canonical resume point. Keep it current and move
> historical execution detail to Git, dated handoffs, or task ledgers.

- Last audited: 2026-08-09
- Current integration branch: `dev`
- Last integrated Goal checkpoint: Authentication and account lifecycle through
  `AUTH-11`, independent exit review, and all five confirmed fixes
- Active feature track: Core Recipe Taxonomy and Database Model
- Next bounded Goal: implement `DATA-01` through `DATA-03`
- Feature branch: `codex/mvp-recipe-data`
- Standalone Goal prompt: `docs/current-goal.md`
- Confirmed account-deletion policy: immediate irreversible opaque tombstone;
  credentials/profile erased, published recipes retained as "Deleted cook,"
  resolved moderation evidence retained for 24 months, former email immediately
  reusable, and all sessions denied immediately.

## Resume now

1. Start a new Codex task in this local project.
2. Select Sol High and enable Goal mode.
3. Use `docs/current-goal.md` as the complete Goal prompt.
4. Create `codex/mvp-recipe-data` from current `dev` in its own isolated
   worktree; do not reuse or alter the preserved Auth worktree.
5. Implement only `DATA-01` through `DATA-03` with TDD and task-ID commits.
6. Stop after its verified checkpoint is fast-forwarded into `dev`; do not begin
   later Recipe Data, media, Recipe UI, or Profile UI work.

Do not resume the historical whole-MVP Goal or any completed Auth Goal.

## Completed and verified

- `BASE-01` through `BASE-06`: Foundation exit gate complete.
- `API-01` through `API-07`: API contract/mobile data foundation complete.
- `AUTH-01` through `AUTH-11`: authentication and account lifecycle complete.
- The independent Auth review and all five confirmed fixes are complete across
  `90c5a84`, `8abdcad`, `14bd4bd`, and `11d91d1`.
- Latest Auth automated verification:
  - `npm.cmd run check`: passed;
  - `npm.cmd test -- --runInBand`: 21 suites/122 tests passed;
  - `npm.cmd run server:check`: passed;
  - `npm.cmd run server:test`: 104/104 passed with zero skips;
  - `git diff --check`: passed.
- Real PostgreSQL/SMTP/Mailpit exit verification passed signup/verification,
  unverified denial, password reset and replacement, rate limiting, refresh-
  family replay isolation, deletion, old-token denial, and email reuse. Exact
  QA rows/messages were removed and verified at zero.

## Current implementation truth

- Recipe/discovery/profile content remains mostly mocked; recipe, media,
  favourite, report, and block server routes remain stubs or `501`.
- The current recipe schema is a prototype: it uses `isPublished`, string
  `categoryId`, and JSON tags instead of the approved lifecycle, curated
  category, and normalized tag model.
- Mobile Auth persists one authoritative SecureStore session through rotation
  and relaunch, performs hydration refresh/single-flight invalidation, and uses
  best-effort logout with safe error mapping.
- Account deletion, refresh-family isolation, Auth limits, lock ordering, and
  allowlisted logging are implemented and covered by automated tests.

## User-owned manual Android QA

The following checklist was not executed by Codex and is
`user-owned; not agent-verified`. Under the approved repository policy it is
non-blocking unless a future prompt explicitly makes it a gate:

1. Signup stays outside private routes until confirmation, then lands on Home.
2. Resend cooldown and replacement survive navigation and full relaunch.
3. Unverified login remains outside private routes.
4. Password-reset completion exits an already live old session.
5. The old password is denied; the new password logs in and survives relaunch.
6. After `PROFILE-06` adds the visible entry point, deletion clears local Auth,
   exits private routes, survives relaunch signed out, and both old refresh and
   still-live access tokens are denied.

No native pass is claimed. User-reported failures should become focused defect
work with regression coverage.

## Local-state snapshot and deferred debt

- `dev` is local-only. No push or pull request was created.
- Migration `0004_common_krista_starr.sql` is applied to the guarded local
  development database.
- The Auth worktree remains preserved. A historical Foundation worktree and a
  Windows-locked unregistered typed-client directory must not be cleaned
  without rechecking scope.
- Existing dependency audit output reported 30 vulnerabilities. No automatic
  audit fix was run because it may be breaking and is outside the current Goal.
- Deferred Foundation debt: non-atomic development reset/seed, independently
  unhandled rejected `pool.end()`, permissive API base URL query/hash parsing,
  and no signal-driven shared-pool shutdown.

## Delivery track status

| Order | Track | Status | Next bounded work |
| --- | --- | --- | --- |
| 0 | Foundation | Complete | Deferred debt only |
| 1 | API contracts | Complete | Do not redo |
| 2 | Auth/account | Complete | Manual Android checklist is user-owned |
| 3 | Recipe data | Pending | `DATA-01` through `DATA-03` |
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

Use `docs/mvp-roadmap.md` for task IDs and dependencies. Keep this file below
140 lines, update backend state in `server/docs/progress.md`, and integrate each
verified bounded Goal into `dev` before stopping.
