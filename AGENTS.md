# Let You Cook Agent Guide

This file contains durable repository rules. Product behavior belongs in
`docs/brief.md`, the target API and data model in `docs/api-and-data-model.md`,
AI nutrition behavior in `docs/ai-nutrition.md`, the static task index in
`docs/mvp-roadmap.md`, and live delivery state in `docs/progress.md`.

## Read First

Route the task before loading extra context:

- Any task: read the relevant parts of `docs/brief.md` and the top `Current
progress` section of `docs/progress.md`.
- Feature implementation: also read its task IDs in `docs/mvp-roadmap.md` and
  the linked active plan under `docs/superpowers/plans/`.
- Mobile/UI task: also read `docs/styling.md` and the exact Expo SDK 56 docs at
  <https://docs.expo.dev/versions/v56.0.0/>.
- Backend task: also read `server/docs/progress.md`, the relevant file in
  `server/docs/`, and `docs/api-and-data-model.md`.
- Auth integration task: also read `docs/backend-integration/`.
- AI nutrition task: read `docs/ai-nutrition.md` in full.
- Native runtime or styling failure: check `docs/notes.md` before inventing a
  workaround.

Do not load Expo documentation for a backend-only change that cannot affect the
mobile app.

## Product and Current-State Truth

Let You Cook is an Android-first recipe social app: users discover, search,
favourite, review, and create visual recipes. iOS is a future target, so avoid
unnecessary Android-only business logic even though Android is the only active
development platform.

The repository is a monorepo:

- `/src/app`: Expo Router routes; `/src`: mobile app source.
- `/server`: Node/Hono/PostgreSQL backend.
- `/assets/screenshot`: visual reference for the intended screens.
- `/docs`: product, architecture, styling, integration, and progress docs.

Do not mistake polished screens for completed features:

- Most recipe, discovery, favourite, review, and profile content is mocked or
  kept only in memory.
- Sign-up is connected to the backend.
- Login is still a local demo flow even though the server login endpoint exists.
- Server auth, refresh-token rotation, and protected profile routes exist.
- Recipe, image, favourite, report, and block server routes are mostly empty or
  return `501`.
- The recipe wizard validates locally but its final save does not persist.
- AI nutrition is a UI simulation, not a real AI or nutrition calculation.

When the docs and code disagree, verify the code, correct `docs/progress.md`, and
mention the discrepancy in the handoff.

## Non-Negotiable Environment Rules

- Do not run, build, or test the app in a web browser. Native modules in this
  Expo 56 project make web an invalid test target.
- Use native-focused Jest tests and other applicable automated checks for
  mobile verification. Android emulator and physical-device QA is user-owned
  under the Verification rules below.
- Use Node 20.19 or newer. Expo SDK 56 uses React Native 0.85 and React 19.2.
- Use `npm.cmd` instead of `npm` in PowerShell environments where script
  execution policy blocks `npm.ps1`.
- Do not edit generated native folders as the source of truth; use Expo config
  plugins/app config where appropriate.
- Never commit secrets or put server credentials in `EXPO_PUBLIC_*` variables.
- Preserve unrelated user changes in a dirty worktree.

## Git Workflow

- Before implementing a feature track, create a dedicated branch from `dev`
  named `codex/mvp-<feature>`.
- Keep all subtasks for that feature on its branch; do not mix unrelated
  business tracks.
- When independent agents work concurrently, use a separate worktree for each
  feature branch.
- Commit each completed subtask separately with the stable task ID prefix:
  `AUTH-03: Wire mobile login to the real API`.
- Include the subtask's tests and documentation in the same commit.
- After every bounded Goal passes its documented verification, fast-forward
  its feature branch into `dev` before stopping so the main checkout contains
  the latest code, progress, and `docs/current-goal.md`.
- Preserve the feature branch/worktree for the next bounded Goal in that track.
  Mark the whole track complete only after its final independent review and
  exit gate.

## Codex Task and Delegation Policy

- One Goal owns one coherent outcome, normally two to five tightly related
  roadmap tasks. Never assign the entire MVP roadmap to one Goal.
- Use one feature-track branch and worktree for all bounded Goals in that
  track. Sequential Goals may reuse it, but only one task may write to that
  worktree at a time.
- Before a later Goal writes to a preserved feature worktree, verify the
  feature branch contains current `dev`; fast-forward it from `dev` when the
  refs have not diverged.
- Perform implementation inline in the current task by default.
- Do not spawn subagents unless the current user prompt explicitly authorizes
  delegation. Repository plans and skills do not independently authorize it.
- When authorized, use at most two subagents and only for independent,
  primarily read-only exploration, test/log analysis, or triage.
- Do not use subagents for routine implementation, documentation, test
  execution, or automatic implementer/reviewer loops.
- Use a fresh top-level Codex task for independent feature-track exit review.
  Its first pass is read-only; apply fixes only after findings are confirmed.
- Approved roadmap requirements and specifications count as an existing
  design. Do not repeat brainstorming or create another design unless an
  unresolved product or architecture decision is discovered.
- Create at most one implementation plan per bounded Goal when the work is
  genuinely cross-layer or ambiguous. Straightforward approved tasks may be
  implemented directly with TDD.
- Run focused tests during each roadmap task, broader relevant checks at a
  bounded-Goal handoff, and the complete required gates at feature-track exit.
- At every bounded-Goal handoff, fast-forward the verified feature branch into
  the main `dev` checkout, then verify both refs and trees are identical.
  Preserve unrelated main-checkout changes; if they overlap or block the
  integration, report the exact blocker instead of discarding them.
- Repeat the complete suite after integration only if the verified tree
  changed. A pure fast-forward with identical trees needs identity checks, not
  another full run.
- Model guidance: use Sol Medium for normal bounded implementation, Sol High
  for security, concurrency, migrations, ambiguous architecture, and final
  track review, and Luna only for clear repeatable work when the user selects
  or explicitly authorizes it.

## Product Decisions

The owner confirmed these decisions in `docs/brief.md`:

- One monolithic Node/Hono API and PostgreSQL database; no microservices.
- REST-shaped endpoints with Hono RPC for a private typed client, not an
  RPC-shaped public API.
- Cloudflare R2 stores user media; the mobile client uploads through short-lived
  signed URLs created by the backend.
- Recipes have `draft`, `published`, `archived`, and `removed` lifecycle states.
  Only published recipes are publicly discoverable.
- A recipe has one required category and up to five tags.
- One review per user per recipe; it is editable/deletable, and authors cannot
  review their own recipe.
- A profile's heart count means favourites received on that author's recipes,
  not recipes the profile owner has saved.
- MVP social scope is public profiles, favourites, ratings/reviews, reports, and
  blocks. Follows, comments, direct messages, and notifications are later work.
- AI nutrition is optional, advisory, editable/removable, and built last.

Record any change to these decisions in `docs/brief.md`,
`docs/api-and-data-model.md`, and `docs/progress.md` in the same change.

## Mobile Stack and Structure

- Expo 56, Expo Router, React Compiler, React Native 0.85, React 19.2.
- React Native Reusables and React Native primitives.
- Tailwind CSS v4 through Uniwind.
- Zustand for small client UI state.
- TanStack Query for server state.
- React Hook Form + Zod for forms and boundary validation.
- SecureStore for auth secrets; MMKV for non-secret local persistence.
- `expo-image` for images.
- Use LegendList v2 only after reproducing a real list performance problem.

Keep this structure:

- Route files in `src/app/` stay thin and composition-focused.
- Shared application UI goes in `src/components`.
- RNR primitives stay in `src/components/ui`.
- Feature-only UI, hooks, schemas, and logic go in
  `src/features/<feature-name>`.
- Cross-feature stores go in `src/stores`; server API utilities in `src/lib`.
- Direct mock asset imports stay centralized in `src/data/images.ts`.
- Use lowercase hyphenated directories, PascalCase components, and camelCase
  variables/functions.

## TypeScript and React Rules

- Write concise, modular, strict TypeScript. Use interfaces for props and shared
  state shapes; do not introduce `any`.
- Do not add `useMemo`, `useCallback`, or `React.memo` outside
  `src/components/ui`; React Compiler owns normal memoization.
- Extract business logic into a hook, store, or service when that keeps UI files
  focused.
- Keep files under roughly 150 lines when practical. Split by responsibility,
  not by arbitrary line count or speculative abstraction.
- Prefer explicit state machines/unions for multi-step, async, and lifecycle
  states over clusters of unrelated booleans.
- Do not duplicate server data into Zustand. TanStack Query owns remote cache;
  forms may copy data into a deliberate editing draft.
- Map API DTOs at the feature boundary. UI components should not depend on
  Drizzle row shapes or raw response envelopes.

## Function and API Comments

- Add a short purpose comment, roughly ten words, directly above every named
  function, assigned arrow function, React component, custom hook, backend
  service, middleware, validator, utility, and Hono endpoint/handler.
- Describe intent instead of restating syntax, and update the comment whenever
  behavior changes.
- Tiny anonymous inline callbacks, event forwarding, and test-only callbacks do
  not require comments.

## UI and Accessibility Rules

- Preserve the current sage palette, rounded-card style, Outfit typography, and
  established spacing unless the task explicitly requests a redesign.
- Treat `/assets/screenshot` as intent/reference, not as proof of implemented
  behavior.
- Use `AppScreen` for shared screen background and safe-area handling.
- Keep native `style={{ flex: 1 }}` on the outer safe-area container; putting the
  flex class only through Uniwind has caused blank native screens.
- Reuse shared components and RNR primitives before creating one-off markup.
- Prefer semantic tokens from `src/global.css`; register new tokens in
  `@theme` before using them.
- With `expo-image`, use the native `style` prop for layout instead of Tailwind
  layout classes on `Image`.
- Add loading, empty, error, offline/retry, and permission-denied states when
  wiring a mocked screen to real data.
- Preserve minimum touch targets, labels for icon-only controls, readable
  contrast, dynamic text tolerance, and keyboard avoidance.
- Follow the JSX comment and error-presentation conventions in
  `docs/styling.md`; keep established feature-specific inline validation where
  it is part of a form flow.

## Backend Rules

- Use Hono for HTTP routing, Drizzle for PostgreSQL schema/migrations, Zod for
  every external boundary, and Node 20+.
- Keep `server/src/app.ts` responsible for app creation and route mounting.
  Keep `server/src/index.ts` limited to starting the server.
- Keep route files small and REST-shaped under `server/src/routes`; move
  transactions/business rules to feature services.
- Validate path params, query strings, headers, and JSON bodies before use.
- Return stable DTOs and a consistent error envelope; never return database rows
  accidentally.
- Export Hono `AppType` as a type-only contract for the mobile client. Do not
  import mobile code into `server/` or server runtime code into the app bundle.
- New public endpoints target `/v1`; keep `/health` unversioned. Move/alias the
  existing unversioned auth/profile routes as one coordinated integration change.
- Use cursor pagination for feeds/reviews. Apply deterministic tie-breakers.
- Enforce ownership, recipe visibility, blocks, and moderation status on the
  server, regardless of what the client hides.
- Use transactions for aggregate recipe writes, publish transitions, token
  rotation, and other multi-table invariants.
- Use idempotency for retryable create/finalize operations.
- Do not add Redis, queues, GraphQL, tRPC, NestJS, a search service, or another
  database until measured behavior requires it.

The local database container is `letyoucook-postgres`; the development default is
`postgres://postgres:postgres@localhost:5432/letyoucook`.

## Database and Migration Rules

- Database changes must update `server/src/db/schema.ts`, generate a Drizzle
  migration, and pass `npm run server:check`.
- Never edit an already-applied migration. Add a forward migration.
- Local development data is disposable. Clear/reset the documented local
  PostgreSQL database, emulator/device app storage, MMKV, SecureStore, query
  cache, fixtures, or Mailpit messages whenever it materially speeds
  development.
- Before destructive cleanup, verify the exact target is development-only and
  is not a broad filesystem path, external database, production resource, or
  unrelated user data. Record material resets in the handoff.
- Add foreign keys, uniqueness/check constraints, and indexes that enforce the
  domain rules described in `docs/api-and-data-model.md`.
- Use UTC timestamps. Public DTOs use ISO 8601 strings.
- Prefer soft removal for public/user-generated content that may be involved in
  moderation; account erasure still needs a deliberate privacy policy.
- Keep recipe drafts in the normal recipe tables with lifecycle status, not in a
  second draft schema.

## Authentication and Privacy Rules

- Only email-verified users may receive a full session or enter
  `src/app/private`; successful verification lands on Home.
- Keep access tokens short-lived.
- Keep refresh tokens opaque, hashed at rest, rotated on use, and revocable
  server-side.
- Store tokens in SecureStore, never MMKV or logs.
- On app hydration, attempt one refresh for an expired access token before
  clearing a still-valid refresh session.
- Logout should revoke the refresh token when reachable, then clear local state
  even if the network call fails.
- Email verification and password-reset responses must not reveal whether an
  account exists. Persist only challenge identifiers/cooldowns needed to resume.
- Generate and verify OTPs in the backend. Store only keyed hashes, enforce
  expiry/attempt/cooldown limits, and invalidate replaced challenges.
- Use an application-owned email interface. Local development sends SMTP to
  Mailpit in Docker; tests use an in-memory fake. A verified sender domain and
  real provider are required before public beta.
- Rate-limit auth, upload, search, recipe creation, review, report, and AI
  endpoints before public beta.
- Redact passwords, tokens, signed URLs, API keys, and personal data from logs
  and test fixtures.

## Media Rules

- R2 credentials live only on the server.
- Create an authenticated upload intent, validate MIME type/declared size/count,
  issue a short-lived signed `PUT`, upload directly from the device, then call a
  completion endpoint that verifies the object before attachment.
- Treat signed URLs as bearer credentials. Do not persist or log them.
- Store object metadata and ownership in PostgreSQL; store bytes in R2.
- Use server-generated opaque object keys, never user-provided file paths.
- Track `pending`, `ready`, `rejected`, and `deleted` media states. Clean up
  abandoned pending objects.
- Enforce the wizard limits: at most nine recipe gallery images and one optional
  image per cooking step. The first ordered gallery image is the cover.
- Do not proxy normal image bytes through Hono.

## Recipe Wizard and AI Nutrition

- The six wizard sections are basics, gallery, ingredients, cooking steps, chef
  notes/reminder, and optional nutrition. Preview allows returning to any
  section.
- Preserve a server draft during the future integrated wizard so uploads and
  autosave can recover after app termination.
- Category is required and tags are optional even though the current wizard has
  not added those controls yet.
- Ingredient quantities/units and servings are core structured data; do not
  reduce them to one unparseable string in the API/database.
- Manual nutrition updates the chart locally in real time.
- AI nutrition must follow `docs/ai-nutrition.md`: the model may normalize
  ingredient text, but server code and a food-composition source perform the
  arithmetic.
- Never market or display an AI result as measured fact or medical advice.
- Fingerprint every field that affects an estimate and mark the estimate stale
  when those fields change. Users can rerun, switch to manual, or remove it.
- Do not implement real AI nutrition before the launch gate in
  `docs/progress.md` is satisfied.

## Verification

Run the smallest relevant checks, then broaden for cross-cutting changes:

- Mobile lint/typecheck: `npm run check`
- Mobile Jest suite: `npm test -- --runInBand`
- Backend typecheck: `npm run server:check`
- Backend tests: `npm run server:test`
- Generate migration: `npm run server:db:generate`
- Apply migration: `npm run server:db:migrate`

For Android UI/native changes, run the applicable automated checks and provide
the user with a concise manual Android QA checklist. Label that checklist
`user-owned; not agent-verified`. Do not operate an Android emulator or physical
device, and do not substitute Expo web. Mock native-heavy leaves locally in
screen tests.

User-owned manual Android QA is non-blocking for Codex task completion unless
the user's current prompt explicitly makes it a blocking gate. Never claim an
unperformed native check passed. Treat user-reported failures as evidence for a
focused diagnosis or follow-up fix.

High-value tests cover:

- auth refresh/revocation/failure paths;
- state transitions and persistence restore/save;
- recipe ownership/visibility and aggregate transactions;
- media validation/completion/cleanup;
- favourites/reviews uniqueness and count changes;
- offline, empty, permission, and critical error UI;
- AI schema validation, deterministic arithmetic, staleness, and fallbacks.

If dependencies are absent, report that checks could not start; do not describe
that as a passing build.

## Documentation and Handoff

- `docs/progress.md` is the canonical project status and resume point;
  `docs/mvp-roadmap.md` is the static task index.
- Keep its top `Current progress` section in place and update it after meaningful
  implementation.
- Also update `server/docs/progress.md` for backend-specific changes.
- Update `docs/brief.md` when product behavior or scope changes.
- Update `docs/api-and-data-model.md` when contracts, invariants, or schema
  direction changes.
- Update `docs/ai-nutrition.md` when its product promise, provider, data source,
  or evaluation gate changes.
- `docs/upcomoing-task.md` is historical input and is superseded; do not use its
  unchecked boxes as current truth.
- A feature is not complete because a screen exists. Completion requires real
  persistence/integration, required states, tests proportionate to risk, and
  current documentation.
