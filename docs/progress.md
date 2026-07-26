# Current progress

> Keep this section at the top of the file. Update it after every meaningful
> feature handoff so a new agent can establish the real state without trusting
> old task lists or screenshots.

Last audited: 2026-07-27
Current branch at audit: `codex/mvp-foundation`
Overall state: polished mocked Expo prototype plus an early local backend.

- Planning milestone: `PLAN-03` — Goal-mode MVP handoff ready.
- Active foundation task: `BASE-03` blocked pending an Android target.
- Next implementation task: resume `BASE-03` on `codex/mvp-foundation` after
  connecting an authorized physical device or creating and starting an AVD.
- Detailed task index: `docs/mvp-roadmap.md`.
- Goal-mode execution brief: `docs/mvp-goal-prompt.md`.
- Ready execution plan:
  `docs/superpowers/plans/2026-07-26-foundation.md`.
- Last verified design commit: `af34464`.
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
- `BASE-03` native bootstrap installed `agent-device` `0.20.0`, verified the
  backend health endpoint at `200`, and ran `npm.cmd run android`; Expo prebuild
  completed but no native build/install could start because neither
  `agent-device`, `adb`, nor the SDK emulator found a connected device or
  configured AVD.
- Required Android verification: connect and authorize a physical Android
  device with USB debugging enabled, or create and start an Android Virtual
  Device; confirm `agent-device devices --platform android` lists it, rerun
  `npm.cmd run android`, then verify every auth/protected route, keyboard
  dismissal, back behavior, tab transition, demo login, and logout listed in
  `docs/verification/foundation-android-smoke.md`. `BASE-03` remains incomplete
  until those native observations are recorded.

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

### Verification at this audit

The check commands were discovered and invoked, but could not start because
workspace dependencies were not installed (`expo`, `jest`, `tsc`, and `tsx`
executables were absent). This is not a test failure and not a passing build.
After `npm install` and `npm --prefix server install`, rerun all four standard
checks before relying on the baseline.

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
- [ ] Install root and server dependencies from the lockfiles.
- [ ] Run and fix the baseline:
  - `npm run check`
  - `npm test -- --runInBand`
  - `npm run server:check`
  - `npm run server:test`
- [ ] Start local PostgreSQL and Mailpit through Docker Compose, then apply the
  existing migration from a clean database.
- [ ] Run the Android dev client and smoke-test every current route.
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
