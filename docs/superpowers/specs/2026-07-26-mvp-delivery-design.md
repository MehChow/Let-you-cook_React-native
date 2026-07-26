# Let You Cook MVP Delivery Design

Status: approved in conversation on 2026-07-26

## Goal

Complete the Android-first Let You Cook MVP as a fully integrated mobile and
backend application. Every normal mobile flow must use the Hono API and
PostgreSQL rather than mock data or in-memory-only mutations. PostgreSQL, the
backend, and development email may remain local through Docker, while the
backend is packaged and documented for provider-neutral deployment.

## Scope

MVP includes:

- verified email/password accounts, sessions, password recovery, and deletion;
- current and public profiles;
- Cloudflare R2-backed avatars and recipe media;
- durable recipe drafts, creation, preview, publishing, editing, archiving, and
  removal;
- recipe detail, Home discovery, Search/filtering, and author recipes;
- private favourites;
- ratings and reviews;
- reports, blocks, role-gated moderation, and audit history;
- Android loading, empty, error, offline, and retry behavior;
- production-oriented configuration, containerization, migrations, logging,
  rate limiting, backup/restore, CI, legal documents, and release verification;
- optional AI-assisted nutrition only after every core feature is stable.

MVP does not include follows, comments, direct messages, push notifications,
meal planning, collections, creator monetization, a public web app, a dedicated
search service, Redis, queues, microservices, or an iOS release.

## Delivery Approach

Use dependency-aware vertical slices. Each task includes the database and API
work, mobile integration, required states, tests, verification, and progress
documentation needed to leave independently reviewable behavior.

Do not complete the whole backend before mobile integration. Do not wire screens
against temporary contract shapes. Shared foundations are built first, then
features are completed end to end in dependency order.

## Tracking and Handoff

Use three documentation levels:

1. `docs/progress.md` remains the canonical dynamic handoff. Its top section
   records the active task ID, current state, exact next action, blockers, linked
   plan, last verified commit, commands run, and their real result.
2. `docs/mvp-roadmap.md` is the static ordered task index. It contains stable
   task IDs, dependencies, subtasks, and exit criteria without implementation
   diary entries.
3. `docs/superpowers/plans/YYYY-MM-DD-<feature>.md` contains the detailed,
   test-first implementation plan for the feature currently being executed.

A future agent starts with `docs/progress.md`, reads the linked active plan, and
then loads only the relevant product/API documentation and feature source. It
must not need to reconstruct the full project history.

Check a task only when its backend behavior, Android integration, required UI
states, proportional tests, verification, and documentation are complete.

## Branch and Commit Isolation

Create one branch for each feature track/implementation plan before changing its
code. Branch from the current integration branch (`dev` unless the owner changes
it) and use the `codex/` prefix:

```text
codex/mvp-foundation
codex/mvp-api-contracts
codex/mvp-auth-account
codex/mvp-recipe-data
codex/mvp-r2-media
codex/mvp-profile
codex/mvp-recipe-authoring
codex/mvp-recipe-detail
codex/mvp-home
codex/mvp-search
codex/mvp-favourites
codex/mvp-reviews
codex/mvp-safety
codex/mvp-operations
codex/mvp-ai-nutrition
```

Do not mix unrelated feature tracks on one branch. If concurrent agents work on
independent tracks, give each branch a separate Git worktree. Dependent tracks
start only after their required contract branch is integrated or from an
explicitly approved dependency branch.

Commit each completed subtask separately. Begin the subject with its stable task
ID and a concise outcome:

```text
AUTH-03: Wire mobile login to the real API
HOME-05: Add feed refresh and pagination loading
MEDIA-05: Verify uploaded R2 objects before attachment
```

Include the subtask's tests and documentation in the same commit. Do not use
ambiguous subjects such as "updates", "fixes", or "work in progress". Merge a
feature branch into `dev` only after its feature exit gate and verification pass.

## Shared Architecture

Normal data flow:

```text
Expo screen
  -> feature query/mutation hook
  -> typed Hono client
  -> validated Hono route
  -> feature service and transaction
  -> Drizzle/PostgreSQL, R2, or SMTP
  -> stable DTO
  -> TanStack Query cache
  -> rendered mobile state
```

- Route files remain thin and REST-shaped.
- Services own authorization, transactions, lifecycle rules, and aggregate
  invariants.
- Zod validates parameters, queries, headers, bodies, and external-provider
  results at boundaries.
- Hono `AppType` is imported by the app as a type-only contract.
- Database rows never become public DTOs accidentally.
- TanStack Query owns server state. Zustand owns only local UI state.
- Aggregate recipe mutations use an optimistic `version`.
- Retryable create/finalize operations use an idempotency key.
- Public recipe reads always enforce lifecycle, moderation, author status, and
  block relationships.

## Authentication and Email Verification

The mobile authentication state is an explicit union:

```text
hydrating | signedOut | verificationRequired | authenticated
```

Only an authenticated user with a verified email may enter `src/app/private`.
Home is the landing page after successful verification or login.

### Sign-up

1. Validate and normalize email, password, and display name.
2. Transactionally create an unverified user and profile.
3. Create one active email-verification challenge.
4. Send a six-digit OTP through the configured `EmailSender`.
5. Return the verification challenge state without full access/refresh tokens.
6. Navigate the app to Email OTP.
7. On valid OTP, mark the user verified and issue the first token pair.
8. Persist the session and enter Home.

### Unverified Login

Login does not issue a full session for an unverified account. It returns the
stable `email_verification_required` code, creates or reuses an eligible
challenge, and routes the app to verification.

### OTP Rules

- Generate six digits with a cryptographically secure source.
- Expire after ten minutes.
- Allow no more than five failed verification attempts.
- Enforce a sixty-second resend cooldown.
- Keep only one active challenge per user and purpose.
- Store a keyed hash, never the plaintext OTP.
- Consuming or replacing a challenge invalidates the previous challenge.
- Password-reset requests remain non-enumerating.
- Seeded development accounts may be pre-verified.

### Email Delivery

Define an application-owned `EmailSender` interface.

- Local development uses a generic SMTP adapter connected to Mailpit in Docker.
- Tests inject an in-memory fake that records messages.
- Future production can use the same SMTP adapter with a transactional provider,
  or a new provider adapter without changing auth services.
- Mailpit is development-only and must never be used as public delivery.
- Production startup fails with a clear configuration error when required email
  settings are absent.

The owner does not currently have a sender domain. A verified domain and real
transactional provider are external prerequisites before public beta, but they
do not block completing and testing the local MVP.

## API, Errors, and Recovery

- Keep `/health` unversioned and expose application routes under `/v1`.
- Use camelCase JSON, opaque IDs, UTC ISO timestamps, stable DTOs, and cursor
  pagination with deterministic tie-breakers.
- Use one error envelope containing stable code, safe message, optional field
  errors, and request ID.
- A `401` may trigger exactly one refresh; refresh failure clears the session.
- `email_verification_required` routes the user to the verification flow.
- `409` represents duplicate, lifecycle, or optimistic-version conflicts.
- Network failures preserve editable drafts and expose retry.
- Pagination failure retains already loaded items.
- Media errors distinguish intent, binary upload, verification, and attachment.
- Every real-data screen implements applicable loading, empty, error, offline,
  permission, retry, refreshing, pagination, and terminal states.

## Development Data Policy

All local development data is disposable. The agent may reset:

- the local `letyoucook-postgres` database or its development schema;
- development recipe/media fixtures;
- emulator/device app storage;
- MMKV, SecureStore, TanStack Query persistence, and other app-local state;
- local Mailpit messages.

No extra approval is required when a reset clearly accelerates development.
Before a destructive command, resolve the exact target and verify that it is the
documented development database/container/app storage rather than a broad path,
external database, production resource, or unrelated user data. Record material
resets and recovery steps in the handoff.

Forward migration discipline still applies to committed schema history. A local
database reset does not justify editing an already-applied migration.

## Function and API Comments

Place a short purpose comment, roughly ten words, directly above:

- named function declarations;
- arrow functions assigned to variables;
- React components and custom hooks;
- backend services, middleware, validators, and utilities;
- every Hono API endpoint or handler;
- public interfaces where a purpose comment improves comprehension.

Comments describe intent rather than restating syntax. Exclude tiny anonymous
inline callbacks such as array mapping, event forwarding, and test-only
callbacks. Keep comments current when behavior changes.

## Device Verification

Use automated tests and an Android emulator whenever they provide adequate
evidence. Never substitute Expo web.

When a task genuinely requires a physical Android device, tell the user exactly
what needs verification and pause that task. Record the blocker and requested
check in `docs/progress.md`. Resume and complete the task only after the user
provides sufficiently clear feedback. Independent tasks may continue, but the
device-dependent task remains incomplete.

Typical physical-device candidates include camera/gallery permission behavior,
vendor-specific media pickers, SecureStore behavior that cannot be reproduced,
background/resume behavior, haptics, and release-build performance.

## Verification Strategy

Each implementation task follows a test-first cycle:

- unit tests for validation, state transitions, normalization, cursors, and
  deterministic calculations;
- service/route tests for authorization, transactions, errors, and concurrency;
- PostgreSQL smoke tests for migrations, constraints, and aggregate writes;
- mobile hook/component tests with native-heavy leaves mocked locally;
- Android emulator verification for navigation, forms, persistence, media, and
  restored sessions;
- physical-device feedback when emulator evidence is inadequate.

Standard automated gates:

```text
npm.cmd run check
npm.cmd test -- --runInBand
npm.cmd run server:check
npm.cmd run server:test
```

Database changes also require clean migration verification. Cross-cutting
contract changes run both app and server suites.

## Ordered MVP Task Index

### 0. Foundation and Development Baseline

- `BASE-01` Install root/server dependencies and establish passing checks.
- `BASE-02` Start PostgreSQL from reproducible Docker Compose and apply
  migrations from an empty database.
- `BASE-03` Verify every existing route in the Android development client.
- `BASE-04` Standardize environment variables and emulator/device API host
  configuration.
- `BASE-05` Correct documentation paths such as `src/app`.
- `BASE-06` Add development seed and test-fixture support.

Exit: a fresh clone can start PostgreSQL, backend, Mailpit, and Android app with
documented commands.

### 1. Shared API and Mobile Data Foundation

- `API-01` Introduce `/v1` while keeping `/health` unversioned.
- `API-02` Define the error envelope and request IDs.
- `API-03` Define cursor pagination and deterministic sorting.
- `API-04` Create stable Zod request/response DTO contracts.
- `API-05` Export Hono `AppType` and configure the type-only mobile client.
- `API-06` Configure TanStack Query defaults, auth, cancellation, and retries.
- `API-07` Add reusable mobile error-to-UI mapping.

Exit: one protected request works through the typed standardized contract.

### 2. Authentication and Account Lifecycle

- `AUTH-01` Move auth routes and mobile wrappers to `/v1`.
- `AUTH-02` Reverify sign-up persistence, duplicate handling, and validation.
- `AUTH-03` Replace hard-coded mobile login with the real API.
- `AUTH-04` Refresh an expired access token during hydration.
- `AUTH-05` Handle concurrent refresh and session-expired navigation.
- `AUTH-06` Revoke refresh on logout and always clear local credentials.
- `AUTH-07` Add `EmailSender`, SMTP configuration, Mailpit, and test fake.
- `AUTH-08` Add mandatory email verification and resend behavior.
- `AUTH-09` Implement password-reset request, OTP, grant, and completion.
- `AUTH-10` Implement account deletion and retention/anonymization behavior.
- `AUTH-11` Add auth rate limits, redacted logging, and failure/concurrency tests.

Exit: sign-up, verification, login, restore, refresh, logout, password reset, and
deletion work end to end.

### 3. Core Recipe Taxonomy and Database Model

- `DATA-01` Add recipe lifecycle status, version, and publication timestamps.
- `DATA-02` Add curated categories and ordered development seeds.
- `DATA-03` Add normalized tags and enforce the five-tag limit.
- `DATA-04` Normalize ingredient groups.
- `DATA-05` Store structured ingredient amount, display amount, unit, and
  preparation.
- `DATA-06` Add standalone owned media assets.
- `DATA-07` Add gallery ordering and optional step-media references.
- `DATA-08` Expand manual nutrition with source and fingerprint.
- `DATA-09` Add reviews, reports, blocks, roles, and moderation tables.
- `DATA-10` Backfill/reset development rows and add constraints/indexes.
- `DATA-11` Verify forward and clean-database migrations.

Exit: PostgreSQL enforces the confirmed product invariants.

### 4. Cloudflare R2 Media

- `MEDIA-01` Add a storage interface and R2 adapter.
- `MEDIA-02` Validate purpose, MIME, bytes, dimensions, count, and ownership.
- `MEDIA-03` Create upload intents and short-lived signed `PUT` URLs.
- `MEDIA-04` Upload directly from Expo with progress, cancellation, and retry.
- `MEDIA-05` Verify objects before marking them ready.
- `MEDIA-06` Attach, reorder, detach, and delete recipe/avatar media.
- `MEDIA-07` Serve public-ready media through the delivery domain.
- `MEDIA-08` Clean abandoned pending/unattached objects.
- `MEDIA-09` Test spoofing, ownership, expiry, partial uploads, and completion.

Exit: Android manages media without exposing credentials or proxying bytes
through Hono.

### 5. Current-User Profile

- `PROFILE-01` Adapt current-profile read/update to shared DTOs.
- `PROFILE-02` Replace mock identity, bio, and location.
- `PROFILE-03` Add editing and optimistic/version conflict handling.
- `PROFILE-04` Upload, replace, and remove the avatar.
- `PROFILE-05` Add loading, offline, retry, and validation states.
- `PROFILE-06` Wire deletion and logout entry points.

Exit: the current Profile tab contains no mock identity data.

### 6. Recipe Creation, Drafts, and Publishing

- `CREATE-01` Create an owner draft with aggregate version.
- `CREATE-02` Add category and tags to Basics.
- `CREATE-03` Autosave basics with explicit save state.
- `CREATE-04` Persist and reorder gallery media.
- `CREATE-05` Persist ordered ingredient groups/items.
- `CREATE-06` Persist ordered steps and optional media.
- `CREATE-07` Persist chef notes/reminder text.
- `CREATE-08` Persist optional manual nutrition.
- `CREATE-09` Recover unfinished drafts after termination.
- `CREATE-10` Render Preview from persisted data.
- `CREATE-11` Validate and publish transactionally.
- `CREATE-12` List owner drafts/published/archived recipes.
- `CREATE-13` Edit, republish, archive, and remove owned recipes.
- `CREATE-14` Test races, ordering, ownership, failure, recovery, and publishing.

Exit: the complete wizard is durable and publishes a real recipe.

### 7. Recipe Detail and Public Author Profile

- `DETAIL-01` Build the full recipe-detail aggregate DTO.
- `DETAIL-02` Replace recipe-detail mock data.
- `DETAIL-03` Render gallery, metadata, ingredients, steps, notes, and nutrition.
- `DETAIL-04` Enforce lifecycle, ownership, moderation, and block visibility.
- `DETAIL-05` Add loading, private/removed, offline, retry, and malformed states.
- `DETAIL-06` Build public profile identity and derived statistics.
- `DETAIL-07` Paginate an author's published recipes.
- `DETAIL-08` Derive favourites received and average rating.
- `DETAIL-09` Wire recipe/author navigation.

Exit: Recipe Detail and public Profile contain no mocked content.

### 8. Home Tab

- `HOME-01` Define featured, popular, and newest feed queries.
- `HOME-02` Return active categories in curated order.
- `HOME-03` Add deterministic cursor pagination.
- `HOME-04` Replace featured/popular mock cards.
- `HOME-05` Add refresh and pagination loading.
- `HOME-06` Add empty, offline, retry, and end states.
- `HOME-07` Navigate cards to detail.
- `HOME-08` Carry category selection into Search.
- `HOME-09` Test ordering and cursor behavior.

For MVP, Today's Special is the best-rated recent eligible recipe with a
newest-recipe fallback.

### 9. Search and Filters

- `SEARCH-01` Search title, category, tag, and ingredient.
- `SEARCH-02` Implement relevance, top-rated, newest, and quickest sorts.
- `SEARCH-03` Implement time, calorie, serving, category, and tag filters.
- `SEARCH-04` Validate limits and deterministic cursors.
- `SEARCH-05` Replace local filtering with debounced server queries.
- `SEARCH-06` Preserve staged filter apply/reset behavior.
- `SEARCH-07` Keep recent searches local.
- `SEARCH-08` Add pagination, refresh, empty, offline, retry, and invalid states.
- `SEARCH-09` Preserve Home-to-Search navigation.
- `SEARCH-10` Test query behavior and measure before specialized search.

Exit: Search operates entirely on PostgreSQL-backed recipes.

### 10. Favourites

- `FAV-01` Add idempotent favourite/unfavourite endpoints.
- `FAV-02` Add actor-specific state and derived counts to DTOs.
- `FAV-03` Replace the in-memory store with optimistic mutations and rollback.
- `FAV-04` Synchronize state across every recipe surface.
- `FAV-05` Cursor-paginate the private Favourites tab.
- `FAV-06` Preserve grid/list presentation.
- `FAV-07` Update received-heart statistics.
- `FAV-08` Test retries, concurrency, visibility, and rollback.

Exit: favourites persist and remain consistent across screens.

### 11. Ratings and Reviews

- `REVIEW-01` Add one-review-per-user API with no-self-review enforcement.
- `REVIEW-02` Cursor-paginate active reviews.
- `REVIEW-03` Create, edit, and delete the current user's review.
- `REVIEW-04` Derive average rating and review count.
- `REVIEW-05` Replace local review-sheet state.
- `REVIEW-06` Add mutation, empty, pagination, removed, and auth states.
- `REVIEW-07` Test aggregates, concurrency, uniqueness, and moderation.

Exit: reviews and ratings are fully persistent.

### 12. Reports, Blocks, and Moderation

- `SAFETY-01` Report recipe, review, or user with reason codes.
- `SAFETY-02` Block and unblock idempotently.
- `SAFETY-03` Enforce blocks on every relevant read and mutation.
- `SAFETY-04` Add admin role authorization.
- `SAFETY-05` Add moderation queue/detail/action endpoints.
- `SAFETY-06` Add a minimal role-gated in-app moderation screen.
- `SAFETY-07` Remove/restore content and record append-only actions.
- `SAFETY-08` Test concealment, bypass attempts, authorization, and audits.

Exit: safety rules cannot be bypassed with direct API calls.

### 13. Deployment and Android Beta Readiness

- `OPS-01` Validate startup environment and secrets.
- `OPS-02` Add production backend Dockerfile and development Compose.
- `OPS-03` Add liveness/readiness and graceful shutdown.
- `OPS-04` Define safe deployment migration execution.
- `OPS-05` Add request IDs, structured logs, and operational errors.
- `OPS-06` Apply per-route rate limits.
- `OPS-07` Add database backup and restore drill.
- `OPS-08` Add CI for app/server checks, tests, and clean migrations.
- `OPS-09` Add crash reporting and minimal consent-aware analytics.
- `OPS-10` Write privacy, terms, deletion, and community guidance.
- `OPS-11` Audit permissions, secrets, media privacy, accessibility, network, and
  Android release builds.
- `OPS-12` Document staging/production environments without choosing a host.
- `OPS-13` Configure a verified sender domain/provider before public beta.

Exit: the service is provider-neutral and deployable; local Docker remains the
development environment.

### 14. AI Nutrition, Last

- `AI-01` Build the versioned reference evaluation set.
- `AI-02` Implement deterministic FoodData Central lookup/calculation.
- `AI-03` Add structured AI normalization behind a feature flag.
- `AI-04` Persist provenance, confidence, warnings, usage, and latency.
- `AI-05` Implement eligibility and missing-input guidance.
- `AI-06` Implement analyze, accept, stale, rerun, manual, and removal states.
- `AI-07` Evaluate optional image consistency.
- `AI-08` Compare models/providers on identical fixtures.
- `AI-09` Enable only after documented launch gates pass.

Exit: accuracy, cost, and latency pass the documented gate; otherwise manual
nutrition remains the MVP behavior.

## Dependency Summary

```text
BASE
  -> API
  -> AUTH
  -> DATA
  -> MEDIA
  -> PROFILE
  -> CREATE
  -> DETAIL
  -> HOME
  -> SEARCH
  -> FAVOURITES
  -> REVIEWS
  -> SAFETY
  -> OPS
  -> AI
```

Some independent work may overlap after its dependencies are stable, but no
feature may consume an unapproved temporary contract. Examples:

- SMTP/Mailpit work can run beside `/v1` contract work after BASE.
- Category seeds can run beside auth UI after API conventions are stable.
- Home and Search can be developed in parallel after recipe reads are stable.
- Favourites and reviews can be developed in parallel after recipe detail DTOs
  are stable.
- Operational container/CI work can begin early, but final hardening remains
  after feature completion.

## MVP Completion Evidence

MVP is complete only when:

- every task through OPS is checked with linked evidence;
- every normal screen uses real API data and persistence;
- no normal save/favourite/review/auth flow is a simulation;
- a clean local setup starts PostgreSQL, Mailpit, backend, and Android app;
- migrations succeed from an empty database;
- all standard checks pass;
- required Android emulator flows pass;
- physical-device-dependent tasks have user feedback;
- privacy/deletion/moderation and operational gates are satisfied;
- deployment packaging does not assume a specific host;
- AI is either enabled after its gate or deliberately disabled with manual
  nutrition working.
