# Let You Cook MVP Roadmap

This is the static, dependency-ordered task index for the Android MVP. Product
behavior is defined in `docs/brief.md`; architecture and completion rules are in
`docs/superpowers/specs/2026-07-26-mvp-delivery-design.md`; live execution state
is always at the top of `docs/progress.md`.

## Status Rules

- `[ ]` not started
- `[~]` active or partially implemented
- `[x]` complete with backend, Android wiring, required states, tests,
  verification, and documentation

Do not check a feature merely because its UI or endpoint exists.

## Branch and Commit Rules

Each feature track starts from `dev` on its dedicated branch. Each completed
subtask receives a separate commit whose subject starts with the task ID.

| Order | Track | Branch | Detailed plan |
| --- | --- | --- | --- |
| 0 | Foundation | `codex/mvp-foundation` | `docs/superpowers/plans/2026-07-26-foundation.md` |
| 1 | API contracts | `codex/mvp-api-contracts` | Created immediately before execution |
| 2 | Auth/account | `codex/mvp-auth-account` | Created immediately before execution |
| 3 | Recipe data | `codex/mvp-recipe-data` | Created immediately before execution |
| 4 | R2 media | `codex/mvp-r2-media` | Created immediately before execution |
| 5 | Profile | `codex/mvp-profile` | Created immediately before execution |
| 6 | Recipe authoring | `codex/mvp-recipe-authoring` | Created immediately before execution |
| 7 | Recipe detail | `codex/mvp-recipe-detail` | Created immediately before execution |
| 8 | Home | `codex/mvp-home` | Created immediately before execution |
| 9 | Search | `codex/mvp-search` | Created immediately before execution |
| 10 | Favourites | `codex/mvp-favourites` | Created immediately before execution |
| 11 | Reviews | `codex/mvp-reviews` | Created immediately before execution |
| 12 | Safety/moderation | `codex/mvp-safety` | Created immediately before execution |
| 13 | Operations/release | `codex/mvp-operations` | Created immediately before execution |
| 14 | AI nutrition | `codex/mvp-ai-nutrition` | Created immediately before execution |

## 0. Foundation and Development Baseline

Dependencies: approved MVP design.

- [x] `BASE-01` Install root/server dependencies and establish passing checks.
- [x] `BASE-02` Add reproducible PostgreSQL and Mailpit Docker Compose services.
- [x] `BASE-03` Verify every existing route in the Android development client.
- [x] `BASE-04` Standardize environment and Android API-host configuration.
- [x] `BASE-05` Correct stale repository paths in documentation.
- [x] `BASE-06` Add safe development reset, seed, and test-fixture support.

Exit: a fresh clone starts PostgreSQL, Mailpit, backend, and Android app using
documented commands, and the existing automated baseline passes.

## 1. Shared API and Mobile Data Foundation

Dependencies: Foundation.

- [ ] `API-01` Introduce `/v1` while keeping `/health` unversioned. Task 1 is
  implemented and awaiting required task and branch review before completion.
- [ ] `API-02` Define the shared error envelope and request IDs.
- [ ] `API-03` Define cursor pagination and deterministic sorting.
- [ ] `API-04` Create stable Zod request/response DTO contracts.
- [ ] `API-05` Export Hono `AppType` and configure the typed mobile client.
- [ ] `API-06` Configure TanStack Query authentication, cancellation, and retries.
- [ ] `API-07` Add reusable mobile error-to-UI mapping.

Exit: a protected request works through the typed standardized contract.

## 2. Authentication and Account Lifecycle

Dependencies: API contracts.

- [ ] `AUTH-01` Move auth routes and mobile wrappers to `/v1`.
- [ ] `AUTH-02` Reverify sign-up persistence, duplicate handling, and validation.
- [ ] `AUTH-03` Replace hard-coded mobile login with the real API.
- [ ] `AUTH-04` Refresh expired access during app hydration.
- [ ] `AUTH-05` Handle concurrent refresh and session-expired navigation.
- [ ] `AUTH-06` Revoke refresh on logout and clear local credentials.
- [ ] `AUTH-07` Add `EmailSender`, SMTP/Mailpit, and the test fake.
- [ ] `AUTH-08` Add mandatory email verification and resend behavior.
- [ ] `AUTH-09` Implement password-reset request, OTP, grant, and completion.
- [ ] `AUTH-10` Implement account deletion and retention/anonymization.
- [ ] `AUTH-11` Add rate limits, redacted logging, and concurrency/failure tests.

Exit: sign-up, verification, login, restore, refresh, logout, reset, and deletion
work end to end; unverified users cannot enter Home.

## 3. Core Recipe Taxonomy and Database Model

Dependencies: Auth/account.

- [ ] `DATA-01` Add recipe lifecycle, version, and publication timestamps.
- [ ] `DATA-02` Add curated categories and ordered development seeds.
- [ ] `DATA-03` Add normalized tags and the five-tag limit.
- [ ] `DATA-04` Normalize ingredient groups.
- [ ] `DATA-05` Store structured ingredient amounts, units, and preparation.
- [ ] `DATA-06` Add standalone owned media assets.
- [ ] `DATA-07` Add gallery ordering and optional step media.
- [ ] `DATA-08` Expand manual nutrition source and fingerprint.
- [ ] `DATA-09` Add reviews, reports, blocks, roles, and moderation tables.
- [ ] `DATA-10` Backfill/reset development rows and add constraints/indexes.
- [ ] `DATA-11` Verify forward and clean-database migrations.

Exit: PostgreSQL enforces the confirmed product invariants.

## 4. Cloudflare R2 Media

Dependencies: Recipe data.

- [ ] `MEDIA-01` Add the storage interface and R2 adapter.
- [ ] `MEDIA-02` Validate purpose, MIME, bytes, dimensions, count, and ownership.
- [ ] `MEDIA-03` Create upload intents and short-lived signed `PUT` URLs.
- [ ] `MEDIA-04` Upload from Expo with progress, cancellation, and retry.
- [ ] `MEDIA-05` Verify objects before marking them ready.
- [ ] `MEDIA-06` Attach, reorder, detach, and delete recipe/avatar media.
- [ ] `MEDIA-07` Serve public-ready media through the delivery domain.
- [ ] `MEDIA-08` Clean abandoned pending and unattached objects.
- [ ] `MEDIA-09` Test spoofing, ownership, expiry, partial uploads, and completion.

Exit: Android manages media without exposing credentials or proxying bytes
through Hono.

## 5. Current-User Profile

Dependencies: Auth/account and R2 media.

- [ ] `PROFILE-01` Adapt current-profile read/update to shared DTOs.
- [ ] `PROFILE-02` Replace mock identity, bio, and location.
- [ ] `PROFILE-03` Add editing and optimistic/version conflict handling.
- [ ] `PROFILE-04` Upload, replace, and remove the avatar.
- [ ] `PROFILE-05` Add loading, offline, retry, and validation states.
- [ ] `PROFILE-06` Wire account deletion and logout entry points.

Exit: the current Profile tab contains no mock identity data.

## 6. Recipe Creation, Drafts, and Publishing

Dependencies: Recipe data and R2 media.

- [ ] `CREATE-01` Create an owner draft with aggregate version.
- [ ] `CREATE-02` Add category and tags to Basics.
- [ ] `CREATE-03` Autosave basics with explicit save state.
- [ ] `CREATE-04` Persist and reorder gallery media.
- [ ] `CREATE-05` Persist ordered ingredient groups/items.
- [ ] `CREATE-06` Persist ordered steps and optional media.
- [ ] `CREATE-07` Persist chef notes/reminder text.
- [ ] `CREATE-08` Persist optional manual nutrition.
- [ ] `CREATE-09` Recover unfinished drafts after termination.
- [ ] `CREATE-10` Render Preview from persisted data.
- [ ] `CREATE-11` Validate and publish transactionally.
- [ ] `CREATE-12` List owner drafts, published, and archived recipes.
- [ ] `CREATE-13` Edit, republish, archive, and remove owned recipes.
- [ ] `CREATE-14` Test races, ordering, ownership, failure, recovery, and publish.

Exit: the wizard is durable and publishes a real recipe.

## 7. Recipe Detail and Public Author Profile

Dependencies: Recipe authoring.

- [ ] `DETAIL-01` Build the full recipe-detail aggregate DTO.
- [ ] `DETAIL-02` Replace recipe-detail mock data.
- [ ] `DETAIL-03` Render gallery, metadata, ingredients, steps, notes, nutrition.
- [ ] `DETAIL-04` Enforce lifecycle, ownership, moderation, and block visibility.
- [ ] `DETAIL-05` Add loading, private/removed, offline, retry, malformed states.
- [ ] `DETAIL-06` Build public profile identity and derived statistics.
- [ ] `DETAIL-07` Paginate an author's published recipes.
- [ ] `DETAIL-08` Derive favourites received and average rating.
- [ ] `DETAIL-09` Wire recipe/author navigation.

Exit: Recipe Detail and public Profile contain no mocked content.

## 8. Home Tab

Dependencies: Recipe detail.

- [ ] `HOME-01` Define featured, popular, and newest feed queries.
- [ ] `HOME-02` Return active categories in curated order.
- [ ] `HOME-03` Add deterministic cursor pagination.
- [ ] `HOME-04` Replace featured and popular mock cards.
- [ ] `HOME-05` Add refresh and pagination loading.
- [ ] `HOME-06` Add empty, offline, retry, and end states.
- [ ] `HOME-07` Navigate recipe cards to detail.
- [ ] `HOME-08` Carry category selection into Search.
- [ ] `HOME-09` Test ordering and cursor behavior.

Exit: Home renders only database-backed recipes.

## 9. Search and Filters

Dependencies: Recipe detail and Home category contract.

- [ ] `SEARCH-01` Search title, category, tag, and ingredient.
- [ ] `SEARCH-02` Implement relevance, top-rated, newest, and quickest sorts.
- [ ] `SEARCH-03` Implement time, calorie, serving, category, and tag filters.
- [ ] `SEARCH-04` Validate limits and deterministic cursors.
- [ ] `SEARCH-05` Replace local filtering with debounced server queries.
- [ ] `SEARCH-06` Preserve staged filter apply/reset behavior.
- [ ] `SEARCH-07` Keep recent searches local.
- [ ] `SEARCH-08` Add pagination, refresh, empty, offline, retry, invalid states.
- [ ] `SEARCH-09` Preserve Home-to-Search navigation.
- [ ] `SEARCH-10` Test queries and measure before specialized search.

Exit: Search operates entirely on PostgreSQL-backed recipes.

## 10. Favourites

Dependencies: Recipe detail.

- [ ] `FAV-01` Add idempotent favourite/unfavourite endpoints.
- [ ] `FAV-02` Add actor-specific favourite state and derived counts.
- [ ] `FAV-03` Replace the in-memory store with optimistic mutations.
- [ ] `FAV-04` Synchronize state across every recipe surface.
- [ ] `FAV-05` Cursor-paginate the private Favourites tab.
- [ ] `FAV-06` Preserve grid/list presentation.
- [ ] `FAV-07` Update received-heart statistics.
- [ ] `FAV-08` Test retries, concurrency, visibility, and rollback.

Exit: favourites persist and remain consistent across screens.

## 11. Ratings and Reviews

Dependencies: Recipe detail.

- [ ] `REVIEW-01` Add one-review-per-user API and reject self-review.
- [ ] `REVIEW-02` Cursor-paginate active reviews.
- [ ] `REVIEW-03` Create, edit, and delete the current user's review.
- [ ] `REVIEW-04` Derive average rating and review count.
- [ ] `REVIEW-05` Replace local review-sheet state.
- [ ] `REVIEW-06` Add mutation, empty, pagination, removed, and auth states.
- [ ] `REVIEW-07` Test aggregates, concurrency, uniqueness, and moderation.

Exit: reviews and ratings are fully persistent.

## 12. Reports, Blocks, and Moderation

Dependencies: Profiles, recipe detail, and reviews.

- [ ] `SAFETY-01` Report recipe, review, or user with reason codes.
- [ ] `SAFETY-02` Block and unblock idempotently.
- [ ] `SAFETY-03` Enforce blocks on every relevant read and mutation.
- [ ] `SAFETY-04` Add admin-role authorization.
- [ ] `SAFETY-05` Add moderation queue, detail, and action endpoints.
- [ ] `SAFETY-06` Add a minimal role-gated in-app moderation screen.
- [ ] `SAFETY-07` Remove/restore content and record append-only actions.
- [ ] `SAFETY-08` Test concealment, bypass attempts, authorization, and audits.

Exit: safety rules cannot be bypassed through direct API calls.

## 13. Deployment and Android Beta Readiness

Dependencies: every core feature.

- [ ] `OPS-01` Validate startup environment and secrets.
- [ ] `OPS-02` Add production backend Dockerfile and development Compose.
- [ ] `OPS-03` Add liveness/readiness and graceful shutdown.
- [ ] `OPS-04` Define safe deployment migration execution.
- [ ] `OPS-05` Add request IDs, structured logs, and operational errors.
- [ ] `OPS-06` Apply per-route rate limits.
- [ ] `OPS-07` Add database backup and restore drill.
- [ ] `OPS-08` Add CI for app/server checks, tests, and clean migrations.
- [ ] `OPS-09` Add crash reporting and consent-aware analytics.
- [ ] `OPS-10` Write privacy, terms, deletion, and community guidance.
- [ ] `OPS-11` Audit permissions, secrets, media privacy, accessibility, network,
  and Android release builds.
- [ ] `OPS-12` Document staging/production without choosing a host.
- [ ] `OPS-13` Configure a verified sender domain/provider before public beta.

Exit: the service is provider-neutral and deployable, while development remains
local.

## 14. AI Nutrition

Dependencies: every core and operations feature. Execute last.

- [ ] `AI-01` Build the versioned reference evaluation set.
- [ ] `AI-02` Implement deterministic FoodData Central calculation.
- [ ] `AI-03` Add structured AI normalization behind a feature flag.
- [ ] `AI-04` Persist provenance, confidence, warnings, usage, and latency.
- [ ] `AI-05` Implement eligibility and missing-input guidance.
- [ ] `AI-06` Implement analyze, accept, stale, rerun, manual, removal states.
- [ ] `AI-07` Evaluate optional image consistency.
- [ ] `AI-08` Compare providers/models on identical fixtures.
- [ ] `AI-09` Enable only after documented launch gates pass.

Exit: accuracy, cost, and latency pass the documented gate; otherwise manual
nutrition remains the supported behavior.
