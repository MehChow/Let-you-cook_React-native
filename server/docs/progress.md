# Backend Progress

This is the compact backend supplement to `docs/progress.md`. The target API
and schema contract remains `docs/api-and-data-model.md`.

## Current backend resume point

- Active feature track: Authentication and account lifecycle
- Next bounded Goal: `AUTH-07` through `AUTH-09`
- Feature branch: `codex/mvp-auth-account`
- Last integrated Goal checkpoint: `5bd56d9` (`AUTH-06` code checkpoint)
- Goal prompt: `docs/current-goal.md`

The API contract track and `AUTH-01` through `AUTH-06` are complete. Continue
with email delivery, mandatory verification, and password reset. Do not begin
account deletion or rate-limit hardening next.

## Current state

- Backend stack: Node 20+, Hono, Zod, Drizzle, and PostgreSQL.
- `/health` is unversioned; `/v1` mounts all current application route families.
- Auth/profile routes and mobile callers use `/v1`; temporary unversioned
  auth/profile aliases are retired.
- Stable request IDs, error envelopes, pagination primitives, and current
  auth/profile DTO contracts exist.
- Server signup, login, refresh rotation/reuse revocation, logout,
  access-token authentication, and protected current-profile read/update exist.
- The mobile app uses real signup and login through `/v1`; successful sessions
  are stored through the SecureStore-backed boundary, expired access refreshes
  once during hydration, and logout revokes before unconditional local clear.
- Recipe, image/media, favourite, report, and block routes remain mostly stubs
  or `501` responses.

## Completed API foundation

- [x] `API-01` Versioned route composition.
- [x] `API-02` Stable error envelope and request IDs.
- [x] `API-03` Cursor pagination and deterministic sorting primitives.
- [x] `API-04` Current shared/auth/profile Zod DTO contracts.
- [x] `API-05` Typed Hono mobile client.
- [x] `API-06` Authenticated cancellable transport and bounded query retries.
- [x] `API-07` Safe reusable mobile error presentation.

## Completed Auth work

- [x] `AUTH-01` Versioned auth/profile mobile integration and alias retirement.
- [x] `AUTH-02` PostgreSQL signup persistence, duplicate, and validation
  reverification.
- [x] `AUTH-03` Real mobile login and persisted session establishment.
- [x] `AUTH-04` Mobile hydration refresh and rotated-session persistence.
- [x] `AUTH-05` Single-flight invalid-session handling and private-route exit.
- [x] `AUTH-06` Best-effort refresh revocation with unconditional local logout.
- [x] `AUTH-07` Application-owned email sender, local SMTP/Mailpit adapter, and
  in-memory automated-test fake.
- [x] `AUTH-08` Mandatory email verification, resend cooldown/replacement,
  unverified-login denial, and first-session issuance on confirmation.
- [x] `AUTH-09` Generic password-reset request, OTP verification, short-lived
  grant, atomic password replacement, and refresh-session revocation.

Latest Auth branch verification:

- server typecheck passed;
- backend tests passed 74/74 with zero skips;
- mobile/root checks passed;
- native-focused mobile tests passed 20 suites/105 tests;
- diff check passed.

Android verification passed for real login, valid and expired-session relaunch,
one database-confirmed refresh rotation, and logout navigation. Temporary QA
token settings and the exact QA account were removed before handoff.

See `docs/mvp-handoff-2026-08-09-0400.md` and the API task ledgers for exact
historical evidence.

## Next backend responsibilities

Within the next Goal, `AUTH-07` through `AUTH-09` own application email
delivery, mandatory verification, and password reset. Later Auth Goals own
deletion, rate limits, redacted logging, and concurrency/failure hardening.

## Do not redo or expand

- Do not recreate the backend package, initial migration, current API contract
  primitives, or typed client.
- Do not add Redis, queues, GraphQL, tRPC, NestJS, or another database.
- Do not import mobile runtime code into `server/`.
- Do not implement recipe, media, or later Auth behavior inside the current
  bounded Goal.
- Do not expose secrets, tokens, signed URLs, or personal data in logs.

## Local database

Development default:

```text
postgres://postgres:postgres@localhost:5432/letyoucook
```

Docker project `letyoucook-dev` owns the local PostgreSQL and Mailpit services.
`npm.cmd run server:db:dev:reset` is destructive to local app data and must pass
the documented localhost and exact-database guards before use.

## Backend verification

Use focused tests during each task. At the current Goal handoff run the relevant
auth suites plus:

```powershell
npm.cmd run server:check
npm.cmd run server:test
```

At the full Auth track exit, also run every project-wide command required by
`AGENTS.md`. Missing dependencies, unavailable PostgreSQL, or skipped required
tests are not passing evidence.

## Maintenance

Keep this file under roughly 120 lines. Record only current backend state,
verification, blockers, and the next bounded responsibility. Detailed execution
history belongs in Git, dated handoffs, or task ledgers. Before each bounded
Goal stops, integrate its verified checkpoint into `dev` so this file and the
next Goal are available from the main checkout.
