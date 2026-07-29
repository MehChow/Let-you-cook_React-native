# Current progress

> Keep this section at the top of the file. Update it after every meaningful
> feature handoff so a new agent can establish the real state without trusting
> old task lists or screenshots.

Last audited: 2026-07-30
Current branch at audit: `codex/mvp-pagination`
Overall state: polished mocked Expo prototype plus an early local backend.

- Planning milestone: `PLAN-03` — Goal-mode MVP handoff ready.
- Completed delivery track: `BASE-01` through `BASE-06` passed the Foundation
  exit gate and are checked in `docs/mvp-roadmap.md`.
- `04:00 HKT` stop checkpoint: implementation was paused at the owner's required
  cutoff. At that checkpoint, the standalone continuation record was
  `docs/mvp-handoff-2026-07-27-0400.md`. `dev` and
  `codex/mvp-foundation` are at `9695294`; `codex/mvp-api-contract` was at
  planning commit `803a619` before the handoff commit. No API implementation,
  merge, push, or pull request occurred. The Goal remains active because pause
  is user-controlled.
- `API-01` Task 1 implementation and task/broad reviews passed with no Critical
  or Important findings on `codex/mvp-api-contract`. The composed `v1Routes`
  mounts all seven current
  application route families at `/v1`; `/health` remains unversioned and
  `/v1/health` remains `404`. Existing unversioned routes are temporary
  compatibility aliases for current callers until `AUTH-01`.
- TDD evidence: the Windows root-resolved equivalent focused command
  `npm.cmd --prefix server exec -- tsx --env-file=server/.env --test
  server/src/app.test.ts` was RED with 2/3 tests passing because
  `POST /v1/auth/login` returned `404` instead of `400`; after the minimal
  router mount it was GREEN at 3/3. The literal brief command resolves `.env`
  and `src/app.test.ts` from the repository root under this npm invocation, so
  it first failed on missing `.env` and then on the missing root-relative test
  path rather than exercising routing.
- Fresh API-01 Task 1 verification: `npm.cmd run server:check` passed;
  `npm.cmd run server:test` passed 19/19 with 0 failures and 0 skips;
  `npm.cmd run check` passed; and `npm.cmd test -- --runInBand` passed 16/16
  suites and 67/67 tests. Only documented `letyoucook-dev` PostgreSQL and
  Mailpit services were started; no Expo web, Metro, or backend listener ran.
- `API-01` passed its closure re-review and fresh merged-result verification,
  then fast-forwarded into `dev` at `7d21b95`; its feature branch and worktree
  were removed after the merged tree passed focused 3/3, backend 19/19 with
  zero skips, root check, and 16/16 Jest suites with 67/67 tests.
- Completed delivery item: `API-02`, Define the shared error envelope and
  request IDs, is checked in `docs/mvp-roadmap.md`. Its three tasks assign a
  server-owned request ID, provide the typed shared error helpers/root
  boundaries, and convert every current validator, auth/profile failure, and
  recipe/image/report/block placeholder without changing success bodies or
  statuses. The approved design is
  `docs/superpowers/specs/2026-07-30-api-error-contract-design.md`; the completed
  plan is `docs/superpowers/plans/2026-07-30-api-error-contract.md`.
- `API-02` Task 3 TDD evidence: the initial focused command passed 6/14 and
  failed 8/14 with zero skips against the raw Zod and `{ message }` responses.
  It also exposed that Drizzle wraps PostgreSQL code `23505`, so the intended
  duplicate-email `409` branch was unreachable until the wrapped cause was
  recognized. A follow-up mutation RED passed 15/20 and failed 5/20 with zero
  skips, proving the invalid-access-token branch and refresh, logout, and
  profile validator hooks were independently protected. The final focused
  suite passed 34/34 with zero skips.
- Fresh `API-02` Task 3 gates: `npm.cmd run server:check` passed;
  `npm.cmd run server:test` passed 48/48 with zero failures/skips;
  `npm.cmd run check` passed; `npm.cmd test -- --runInBand` passed 16/16 suites
  and 67/67 tests; and `git diff --check` passed. No backend listener, Metro,
  Expo web, schema, migration, DTO, mobile, or logging work occurred.
- Final review found one Important contract mismatch for logout-revoked refresh
  tokens and two Minors for broad signup `23505` classification and missing
  durable request-ID guarantees. The single authorized fix wave preserves the
  existing `403` plus revoke-all behavior for every already-revoked token,
  narrows duplicate email to the user insert's exact `users_email_unique`
  constraint, and updates the durable API contract.
- Closure-wave TDD evidence: the new real-Postgres logout/replay
  characterization passed 8/8 immediately, proving runtime semantics already
  matched the required behavior. The wished-for constraint classifier was RED
  because its export did not exist; after the minimal strict implementation,
  auth smoke passed 9/9 with zero skips against real `users_email_unique` and
  `profiles_pkey` violations.
- Fresh closure-wave gates: the focused contract suite passed 36/36; server
  type-check passed; the backend suite passed 50/50 with zero skips; root
  lint/type-check passed; all 16 native-focused Jest suites and 67 tests passed;
  and `git diff --check` passed.
- `API-02` passed its closure re-review and fresh merged-result verification,
  then fast-forwarded into `dev` at `8375a8a`. Its feature branch and worktree
  were removed after the merged tree passed focused 36/36, backend 50/50 with
  zero skips, root check, and 16/16 native-focused Jest suites with 67/67
  tests.
- Completed delivery item: `API-03`, Define cursor pagination and deterministic
  sorting, is checked on `codex/mvp-pagination` from exact base `8375a8a`.
  Its approved design is
  `docs/superpowers/specs/2026-07-30-cursor-pagination-design.md`; its completed
  plan is `docs/superpowers/plans/2026-07-30-cursor-pagination.md`.
- `API-03` Task 1 added strict page-size parsing, a versioned base64url cursor
  codec bound to normalized query context, safe exact-version/context
  decoding, and a generic immutable `limit + 1` page builder. Focused RED
  failed because the module did not exist. Initial GREEN passed 10/10; server
  type-check passed; and the backend suite passed 60/60 with zero skips.
- Task review found no Critical issues and four Important cursor-boundary
  defects plus one Minor literal-limit test gap. The fix wave added
  locale-independent context ordering, canonical base64url and fatal UTF-8
  decoding, runtime expected-context validation, correct `undefined` generic
  item handling, and fixed 2048/2049 coverage. Adversarial RED passed 8/11 and
  failed the intended three tests; GREEN passed 11/11. Re-review found no
  remaining Critical, Important, or Minor issues.
- Documentation review found and closed three Important contract precision
  gaps and two Minors. The durable contract now specifies the API-02 validation
  envelope, explicit null normalization, and strict exclusive lexicographic
  seek predicates. Documentation re-review is clean.
- Fresh API-03 branch gates after the fix wave: focused 11/11; server
  type-check; backend 61/61 with zero skips; root lint/type-check; 16/16
  native-focused Jest suites with 67/67 tests; and `git diff --check`.
- Next action: commit the reviewed documentation, run exact-head verification,
  fast-forward API-03 into `dev`, and repeat merged-result verification. Then
  start `API-04` from the exact verified `dev` head if before the 04:00 HKT
  stop checkpoint.
- Detailed task index: `docs/mvp-roadmap.md`.
- Goal-mode execution brief: `docs/mvp-goal-prompt.md`.
- Completed Foundation execution plan:
  `docs/superpowers/plans/2026-07-26-foundation.md`.
- Completed API-01 implementation plan:
  `docs/superpowers/plans/2026-07-27-api-contract-versioning.md`.
- Completed API-02 implementation plan:
  `docs/superpowers/plans/2026-07-30-api-error-contract.md`.
- Completed API-03 implementation plan:
  `docs/superpowers/plans/2026-07-30-cursor-pagination.md`.
- API-03 design baseline commit: `2efdf1c`; its reviewed ordering clarification
  is part of the API-03 closure documentation.
- Foundation branch at exit: `codex/mvp-foundation`. The final application checkout
  tested before the evidence-only documentation commit was
  `34695fcd92ee2fec6587b6945de5a52c658ecee8`.
- Fresh Foundation history/status gate: the worktree started clean, `dev`
  resolved to `2dd839cff374b79794a27706e013db99e2841528`, and
  `git log --oneline dev..HEAD` contained task-prefixed commits for every
  `BASE-01` through `BASE-06` item.
- Fresh Foundation automated exit gates at `34695fc`: `npm.cmd run check`
  exited `0`; `npm.cmd test -- --runInBand` passed 16/16 suites and 67/67
  tests; `npm.cmd run server:check` exited `0`; and
  `npm.cmd run server:test` passed 14/14 tests with 0 failures and 0 skips.
- Clean-volume reproduction removed only the revalidated
  `letyoucook-dev_letyoucook-postgres-data` development volume plus its
  `letyoucook-dev` containers/network. The documented up command recreated
  those resources; runtime inspection reported both PostgreSQL and Mailpit
  `running|healthy`, PostgreSQL accepted connections, Mailpit HTTP returned
  `200`, and SMTP port `1025` was reachable.
- Migrations applied successfully to the empty PostgreSQL volume. The guarded
  development reset then recreated exactly two users and two profiles:
  `verified@letyoucook.local` had verification present and
  `unverified@letyoucook.local` did not. The post-seed backend suite again
  passed 14/14 with 0 skips.
- The final native subset passed on the existing additive `Codex_API_36`
  emulator using `agent-device` `0.20.0`: Login, demo Login to Home, Home to
  Recipe Detail to Reviews with both reverse routes, Add Recipe Basics through
  Step 2 Images, Profile, and logout back to Login. The exact boundary between
  the complete `1aededb` matrix and final `34695fc` subset is recorded in
  `docs/verification/foundation-android-smoke.md`.
- Broad Foundation review hardening now restricts destructive reset URLs to
  `postgres:`/`postgresql:`, rejects query-string host, port, database, and
  `db` addressing overrides, binds all local Postgres/Mailpit host ports to
  `127.0.0.1`, and pins every Compose wrapper to project `letyoucook-dev`.
  Under hostile `COMPOSE_PROJECT_NAME=hostile-project`, the reset removed and
  recreated only the verified `letyoucook-dev` resources. Fresh verification
  passed server type-check, 17/17 backend tests with no skips, root
  lint/type-check, and 16/16 mobile suites with 67/67 tests.
- Four broad-review minors remain deferred: reset plus seed is not atomic;
  rejected `pool.end()` cleanup is not separately handled; the API base URL
  accepts query/hash components; and the long-running server lacks explicit
  signal-driven shared-pool shutdown. None affected the Foundation exit gate.
- Full command-level exit evidence is in the ignored local report
  `.superpowers/sdd/2026-07-26-foundation/foundation-exit-report.md`.
- `git status --short --branch`: exit `0`; started on clean
  `codex/mvp-foundation` worktree.
- `git branch --show-current`: exit `0`; reported `codex/mvp-foundation`.
- `node --version`: exit `0`; reported `v24.14.0`.
- `npm.cmd --version`: exit `0`; reported `11.9.0`.
- `npm.cmd ci`: initial sandbox attempt exited `124` after 60 seconds while
  installing, with no npm error; the approved rerun exited `0`, installed root
  dependencies, and applied `react-native-draggable-flatlist@4.0.3` cleanly.
- `npm.cmd --prefix server ci`: exit `0`.
- `npm.cmd run check`: exit `0` after adding the missing CSS side-effect
  declaration required by TypeScript 6.
- `npm.cmd test -- --runInBand`: exit `0`; 13 suites and 59 tests passed after
  correcting the Windows-incompatible Jest discovery glob and one portable path
  assertion.
- `npm.cmd run server:check`: exit `0`.
- `docker manifest inspect axllent/mailpit:v1.30.0 --verbose`: exit `0`; the
  pinned official Mailpit image resolves for `amd64`.
- `docker compose -f compose.dev.yaml config`: exit `0`; resolved
  `letyoucook-postgres`, `letyoucook-mailpit`, and the
  `letyoucook-dev_letyoucook-postgres-data` named volume.
- `npm.cmd run dev:services:reset` then `npm.cmd run dev:services:up`: exit
  `0`; reset only the documented `letyoucook-dev` local containers and volume,
  then started healthy PostgreSQL and Mailpit containers.
- `docker exec letyoucook-postgres pg_isready -U postgres -d letyoucook`:
  exit `0`; PostgreSQL reported accepting connections. `Test-NetConnection
  localhost -Port 1025` reported `TcpTestSucceeded: True`, and
  `Invoke-WebRequest http://localhost:8025 -UseBasicParsing` returned `200 OK`.
- `npm.cmd run server:db:migrate`: exit `0`; migrations applied successfully.
- `npm.cmd run server:test`: exit `0`; all 5 tests passed with 0 failures and
  0 skips, including the PostgreSQL auth/profile smoke test.
- `BASE-02` corrected the obsolete `axllent/mailpit:v1` plan reference to the
  verified pinned `axllent/mailpit:v1.30.0` release after the former returned
  a Docker registry `not found` error.
- `BASE-03` installed the API 36 Google APIs x86_64 system image without an SDK
  license prompt, created the additive `Codex_API_36` AVD, and booted Android
  API 36 as `emulator-5554`.
- `npm.cmd run android`: exit `0`; Gradle reported `BUILD SUCCESSFUL in 3m 39s`,
  installed `com.meh_chow.LetYouCook`, and Metro bundled 4,306 modules.
- `BASE-03` exercised every documented auth/protected route with
  `agent-device` `0.20.0`, including form input/keyboard dismissal, back
  behavior, tab transitions, the six-step Add Recipe wizard/Preview, demo
  login, and logout. The observed matrix is in
  `docs/verification/foundation-android-smoke.md`.
- Native smoke testing found two protected Recipe Detail/Reviews links that
  omitted `/private` and opened Expo Router's sitemap. Both were reproduced,
  fixed with focused RED/GREEN regression tests, and replayed successfully on
  the emulator.
- `BASE-04` adds validated `EXPO_PUBLIC_API_URL` configuration with the Android
  emulator default (`http://10.0.2.2:8787`), shared by the auth and general API
  clients. It trims trailing slashes and rejects malformed or non-HTTP URLs.
- Current mobile verification: focused BASE-04 API/environment tests exited
  `0` with 3 suites and 13 tests; `npm.cmd run check` exited `0`; and
  `npm.cmd test -- --runInBand` exited `0` with 16 suites and 67 tests passed.
- `BASE-06` guard TDD: the corrected rooted focused command first exited `1`
  with `ERR_MODULE_NOT_FOUND` for `server/src/db/devData`, then exited `0` with
  all 4 required guard tests passing. The plan's original
  `npm --prefix server exec` paths were relative to the repository root on
  PowerShell and could not find the test file, so the test and environment
  paths were rooted at `server/`.
- Self-review found Node serializes the IPv6 loopback hostname as `[::1]`; a
  focused regression test failed before bracket normalization and then passed.
  The focused guard suite now has 5 passing tests.
- Before the destructive reset, ignored `server/.env` resolved to
  `localhost:5432/letyoucook`; Compose and the running container both resolved
  to project `letyoucook-dev`, service `postgres`, container
  `letyoucook-postgres`, and PostgreSQL database `letyoucook`.
- `npm.cmd run server:db:dev:reset`: exit `0`; destroyed current local app data
  in the authorized development database and seeded
  `verified@letyoucook.local` and `unverified@letyoucook.local`.
- The post-reset PostgreSQL query returned exactly 2 users: the verified seed
  with `email_verified_at` present and the unverified seed without it.
- `BASE-06` review hardening added RED/GREEN regressions for query-string host
  redirection, sanitized malformed URLs, password-free success output, and
  fixed sanitized CLI errors. The reset now refuses query-string `host` or
  `port` overrides, and runtime output contains only the two seed emails.
- The hardened wrapper was rerun only after revalidating the ignored URL,
  absence of addressing overrides, Compose/container identity, and live
  database. Captured output contained both emails and no `coffee123` or
  password field; the direct query again returned exactly 2 seed rows.
- Current `BASE-06` verification: `npm.cmd run server:check` exited `0`;
  `npm.cmd run server:test` exited `0` with 14 passed, 0 failed, 0 skipped;
  `npm.cmd run check` exited `0`; and `npm.cmd test -- --runInBand` exited `0`
  with 16 suites and 67 tests passed.

## Snapshot

### Completed foundation

- [x] Expo SDK 56 app with Expo Router, React Compiler, Uniwind/RNR UI system,
  feature-oriented source structure, and Android native development setup.
- [x] Primary screen UI for auth, Home, Search/filter, Favourites, Profile,
  Recipe Detail/reviews, and the six-step Add Recipe wizard/preview.
- [x] Centralized mock image imports in `src/data/images.ts`.
- [x] Local stores and form schemas for the existing prototype flows.
- [x] Node/Hono backend skeleton with app creation separated from process start.
- [x] Docker/local PostgreSQL setup, Drizzle schema, and initial migration.
- [x] Server sign-up, login, access-token authentication, opaque hashed refresh
  tokens, refresh rotation/reuse revocation, and logout endpoints.
- [x] Protected server current-profile read/update endpoints.
- [x] Mobile SecureStore session/token wrappers and shared API client with one
  refresh-and-retry attempt.
- [x] Mobile Create Account wired to the real server sign-up endpoint.
- [x] Lightweight Jest/Node tests around auth helpers, API/session behavior,
  reset cooldown behavior, and backend auth/profile paths.
- [x] Guarded local app-data reset plus deterministic verified and unverified
  development accounts, documented with destructive-data warnings.
- [x] Repository agent/product/API/AI/roadmap documentation refreshed from a
  full source and screenshot audit.
- [x] Owner confirmed the backend/runtime, recipe lifecycle, category/tag,
  profile-heart, review, MVP social, AI nutrition, and beta-readiness product
  decisions in `docs/brief.md`.
- [x] Owner confirmed mandatory email verification, local Mailpit SMTP, disposable
  development data, short function/API comments, physical-device pause rules,
  and per-feature branch/subtask commit conventions.

### Partially complete

- [~] **Authentication integration:** server endpoints exist, but mobile login
  still accepts only the local demo credentials. App-start hydration does not
  refresh an expired access token, mobile logout does not call server logout,
  and email verification/password reset are simulations.
- [~] **Profile:** UI and protected current-profile server routes exist, but the
  screen still renders mock content and edit/avatar/public-profile flows are not
  integrated.
- [~] **Recipe backend:** initial recipe/image/ingredient/step/nutrition tables
  and route groups exist, but recipe list returns an empty array and detail/create
  remain stubs.
- [~] **Recipe creation:** the six-step form, reorder behavior, validation,
  manual nutrition UI, simulated AI state, and preview exist; no draft,
  autosave, R2 upload, or final persistence exists.
- [~] **Discovery/detail/social UI:** screens are complete enough to communicate
  intent, but their data and mutations remain mocked/in-memory.
- [~] **Favourites:** UI plus an in-memory Zustand map exists; no persistence or
  backend wiring.
- [~] **Reviews:** detail sheet can add a local review; there is no review table
  or API yet.

### Not implemented

- [ ] Email verification, real password reset, account deletion, and production
  auth rate limiting/email delivery.
- [ ] Revised recipe lifecycle/category/tag/review/media/analysis schema and
  migrations described in `docs/api-and-data-model.md`.
- [ ] Cloudflare R2 upload intents, direct uploads, verification, delivery, and
  cleanup.
- [ ] Recipe draft/autosave/publish/update/delete API and mobile integration.
- [ ] Real feed, search/filter, recipe detail, author profile, and favourites.
- [ ] Reviews/ratings, reports, blocks, and moderation workflow.
- [ ] Loading/empty/error/offline/permission states across real-data screens.
- [ ] Privacy policy, terms, crash reporting, backups, CI, release configuration,
  and a public beta.
- [ ] Real AI nutrition calculation or provider integration.

### Known product/implementation mismatches

- The current wizard has no category or tag controls, though recipe cards/search
  and the target data model require them.
- Profile "hearts" currently counts recipes saved by the current user in some
  mock logic; the target meaning is favourites received on authored recipes.
- Search's `newest` option cannot work correctly because mock recipes lack a
  real publish timestamp.
- The AI demo returns fixed nutrition after a timeout. Its fingerprint does not
  cover every future analysis input.
- The current database stores category as text, repeats ingredient group titles,
  has no standalone verified media asset, and has no reviews/auth challenges.
- Some existing UI code predates current style rules (for example an
  `expo-image` layout class); treat these as scoped debt, not a reason for an
  unrelated rewrite.

### Verification history

At the initial repository audit, the check commands could not start because
workspace dependencies were absent. That historical observation was superseded
by `BASE-01`, which installed root/server dependencies and established the
automated baseline, and by `BASE-02`/`BASE-03`, which completed services and
native verification.

Current foundation evidence:

- `npm.cmd run check`: exit `0`.
- `npm.cmd test -- --runInBand`: exit `0`; 16 suites and 67 tests passed.
- `npm.cmd run server:check`: exit `0`.
- `npm.cmd run server:test`: exit `0`; 14 tests passed, including the
  PostgreSQL smoke test, 7 development-database guard tests, password-free
  success formatting, and sanitized CLI failure coverage.
- Local PostgreSQL and Mailpit started healthy, and migrations applied.
- The guarded local reset completed and a direct PostgreSQL query found exactly
  the 2 documented deterministic account rows.
- `npm.cmd run android`: native build/install passed on Android API 36, and the
  complete route matrix passed on application source tree `1aededb`.

---

# Delivery roadmap

This roadmap supersedes `docs/upcomoing-task.md`, which is retained only as
historical input. Check an item only when its code, persistence/integration,
required states, proportional tests, and documentation are complete.

## Phase 0 — Re-establish a trustworthy baseline

- [x] Audit routes, features, stores, tests, server source/schema/docs, Git
  history, and all UI screenshots.
- [x] Document product behavior, confirmed decisions, API/data direction, AI
  nutrition constraints, and current progress.
- [x] Install root and server dependencies from the lockfiles.
- [x] Run and fix the baseline:
  - `npm run check`
  - `npm test -- --runInBand`
  - `npm run server:check`
  - `npm run server:test`
- [x] Start local PostgreSQL and Mailpit through Docker Compose, then apply the
  existing migration from a clean database.
- [x] Run the Android dev client and smoke-test every current route.
- [ ] Add a short environment setup section/script if a fresh clone reveals
  undocumented steps.

Exit gate: a fresh clone can start the backend/database and Android app using
documented commands, and all existing automated checks pass.

## Phase 1 — Finish authentication and account lifecycle

### Server

- [ ] Introduce/alias `/v1` auth/profile routes and update the client in the same
  change.
- [ ] Add `EmailSender`, an SMTP adapter, Mailpit Docker service, and an
  in-memory test fake.
- [ ] Add hashed email-verification challenges, resend cooldown, attempt/expiry
  limits, and non-enumerating responses.
- [ ] Add hashed password-reset challenges, reset grants, password update, and
  session revocation.
- [ ] Add account deletion state/endpoint and decide content
  deletion/anonymization/retention behavior.
- [ ] Add auth rate limits and redacted structured request/error logging.
- [ ] Test token rotation/reuse, expiry, revocation, concurrency, enumeration,
  and challenge failure paths.

### Mobile

- [ ] Replace demo login with `POST /v1/auth/login`.
- [ ] Refresh once during hydration when access has expired and refresh remains
  valid.
- [ ] Call server logout, then always clear local credentials.
- [ ] Wire forgot-password request, OTP verification, new password, cooldown,
  and resume behavior to real challenges.
- [ ] Add email-verification UI/resend states as required.
- [ ] Prevent sign-up/unverified login from entering private routes; issue the
  first full session only after OTP confirmation.
- [ ] Wire current profile read/update and avatar placeholder state.
- [ ] Add offline/retry/session-expired states and integration tests.

Exit gate: create, verify, sign in, restore/refresh, sign out, reset password,
and delete account work against PostgreSQL from the Android app.

## Phase 2 — Finalize recipe and media data foundations

- [x] Confirm the product decisions in `docs/brief.md`.
- [ ] Add curated categories and recipe tags.
- [ ] Add recipe status/version/publish/archive/remove fields and indexes.
- [ ] Normalize ingredient groups and structured ingredient amount/unit fields.
- [ ] Add standalone `media_assets` and convert recipe gallery/step/avatar links.
- [ ] Add reviews and rating constraints/indexes.
- [ ] Add auth-challenge and moderation/audit structures not completed in Phase
  1.
- [ ] Expand nutrition source/provenance and analysis tables, but do not call AI.
- [ ] Generate a forward Drizzle migration; backfill or obtain approval before
  resetting development data.
- [ ] Add database constraint and migration smoke tests.
- [ ] Add DTO/Zod contracts and Hono `AppType` export boundaries.

Exit gate: schema and contracts represent the documented product invariants and
pass backend checks from a clean migration.

## Phase 3 — Cloudflare R2 media

- [ ] Provision development/staging R2 bucket, server credentials, custom-domain
  delivery, and environment validation.
- [ ] Define avatar/gallery/step MIME, byte, dimension, and count limits.
- [ ] Implement authenticated upload-intent and short-lived signed `PUT`.
- [ ] Upload from Expo FileSystem/`expo/fetch` with progress, cancellation, and
  retry.
- [ ] Implement completion with R2 `HEAD`/metadata verification and ready/reject
  state.
- [ ] Implement attach/reorder/detach/delete rules and cover-image ordering.
- [ ] Add cleanup for abandoned pending/unattached assets.
- [ ] Test spoofed type/size, wrong owner, expired URL, duplicate completion,
  partial upload, deletion, and cleanup.

Exit gate: an Android device can reliably upload, resume/retry, display, reorder,
and remove owned media without exposing R2 credentials or proxying bytes through
Hono.

## Phase 4 — Recipe draft, wizard persistence, and publishing

- [ ] Add category/tag controls to Basics.
- [ ] Create a server draft early enough to support media and recovery.
- [ ] Add debounced/manual autosave with explicit saving/saved/error/offline
  states and optimistic `version`.
- [ ] Implement aggregate recipe validation and transactional save.
- [ ] Wire gallery, groups/ingredients, steps, optional step images, and notes.
- [ ] Implement manual nutrition persistence and real-time chart.
- [ ] Restore a draft after app termination and list owner drafts.
- [ ] Implement preview from the persisted draft.
- [ ] Implement publish validation/transition and owner archive/remove actions.
- [ ] Add tests for ordering, limits, stale versions, partial failure, ownership,
  draft visibility, publish invariants, and recovery.

Exit gate: a user can create, leave, resume, preview, publish, edit, archive, and
delete a recipe with durable media/data.

## Phase 5 — Replace mocked read experiences

### Recipe detail and profiles

- [ ] Build published recipe detail DTO/query with gallery, groups, steps,
  selected nutrition, author, rating counts, and actor-specific favourite state.
- [ ] Wire Recipe Detail with loading, error, removed/private, block, and retry
  states.
- [ ] Build/wire public profile and authored recipe pagination.
- [ ] Fix received-heart and average-rating semantics.

### Home/search

- [ ] Build cursor-paginated published feed and popular/newest ordering.
- [ ] Implement PostgreSQL title/category/tag/ingredient search.
- [ ] Implement all current filters/sorts with deterministic cursors.
- [ ] Wire Home category handoff and Search query/filter state through TanStack
  Query.
- [ ] Add empty, offline, retry, pagination, and refresh behavior.
- [ ] Measure list performance before considering LegendList v2.

Exit gate: Home, Search, Recipe Detail, and public Profile use only backend data
for normal signed-in operation.

## Phase 6 — Favourites, reviews, and safety interactions

- [ ] Add idempotent favourite endpoints and private favourites pagination.
- [ ] Wire optimistic favourite/unfavourite with rollback and received-heart
  updates.
- [ ] Add one-review-per-user API, no-self-review rule, pagination, edit/delete,
  and rating aggregates.
- [ ] Wire the review sheet with current-user review state and mutation errors.
- [ ] Add report recipe/review/user flow with reason codes.
- [ ] Add block/unblock and enforce block policy on every relevant read/mutation.
- [ ] Add a minimal protected moderation queue/action surface and append-only
  audit entries.
- [ ] Test uniqueness, concurrency, aggregates, authorization, concealment, and
  moderation transitions.

Exit gate: the MVP social/safety behaviors persist correctly and server rules
cannot be bypassed by direct requests.

## Phase 7 — Public Android beta readiness

- [ ] Apply rate limits to auth, uploads, search, creation, reviews, reports, and
  later AI.
- [ ] Add request IDs, structured/redacted logging, crash reporting, and key
  operational metrics.
- [ ] Add database backups and a restore drill.
- [ ] Add CI for app/server checks, tests, and clean migration validation.
- [ ] Write Privacy Policy, Terms of Service, community/report guidance, and
  data/account deletion policy.
- [ ] Review runtime permissions, image privacy, secret handling, retention, and
  dependency/security updates.
- [ ] Add analytics only for a minimal consent-aware funnel: sign-up, search,
  favourite, create/publish.
- [ ] Create staging/production environments and document secret/config
  ownership.
- [ ] Configure a verified sender domain and transactional provider before
  public beta; Mailpit remains development-only.
- [ ] Complete Android accessibility, small/large screen, slow network, offline,
  and release-build QA.
- [ ] Prepare store listing, support contact, screenshots, and review/demo
  account where required.

Exit gate: a small external Android beta can be operated, moderated, recovered,
and supported without relying on developer-only knowledge.

## Phase 8 — AI nutrition experiment (last)

Do not start this phase until recipes, structured ingredients, manual nutrition,
media, and production telemetry are stable.

- [ ] Create the representative reference evaluation set and approved
  accuracy/latency/cost budget.
- [ ] Implement deterministic FoodData Central lookup/conversion/calculation for
  already-normalized ingredients.
- [ ] Add model-provider adapter and structured ingredient normalization behind
  a server feature flag.
- [ ] Persist fingerprint, ingredient matches, provenance, confidence, warnings,
  usage, and latency.
- [ ] Implement eligibility, `needsInput`, stale, accept, rerun, manual switch,
  and remove states.
- [ ] Add optional image consistency check only if evaluation proves value.
- [ ] Compare `gpt-5.6-terra` and `gpt-5.6-luna` (or then-current equivalents)
  using the same versioned evaluation.
- [ ] Pass every launch gate in `docs/ai-nutrition.md`.
- [ ] Run an internal/developer-only Android pilot, then a small feature-flagged
  beta.

Exit gate: measured eligible-recipe accuracy, zero silent quantity invention,
acceptable p95 latency/cost, clear advisory UX, and complete manual fallback. If
the gate fails, keep manual nutrition and do not ship the AI button.

## Later, only after evidence

- [ ] Push reminders/notifications.
- [ ] Follow/unfollow.
- [ ] Comments.
- [ ] Collections and meal planning.
- [ ] Direct messages.
- [ ] Advanced/personalized recommendations.
- [ ] Creator monetization.
- [ ] Dedicated search service.
- [ ] Redis/cache infrastructure.
- [ ] Background queue.
- [ ] Microservices or multi-region database.
- [ ] iOS release work and Apple-specific authentication/review requirements.

Each item needs a measured user/product/operational reason before it moves into
an active phase.

## Progress maintenance rules

When finishing a feature:

1. Update the top `Current progress` snapshot in this file.
2. Check only tasks that meet their full exit criteria.
3. Add newly discovered debt/blockers to the relevant phase.
4. Update `server/docs/progress.md` for backend-specific state.
5. Update product/API/AI docs when behavior or contracts changed.
6. Record the verification commands and whether they actually ran.

Do not erase incomplete history to make progress look cleaner. Move genuinely
superseded work to a short note with the replacement decision.
