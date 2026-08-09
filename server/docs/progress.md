# Backend Progress

This is the compact backend supplement to `docs/progress.md`. The target API
and schema contract remains `docs/api-and-data-model.md`.

## Current backend resume point

- Active feature track: Authentication and account lifecycle
- Next bounded Goal: `AUTH-10` through `AUTH-11`
- Feature branch: `codex/mvp-auth-account`
- Last integrated Goal checkpoint: `83dfefa` (`AUTH-09` code checkpoint; the
  later docs handoff commit is the current branch tip)
- Goal prompt: `docs/current-goal.md`

The API contract track and `AUTH-01` through `AUTH-09` are complete. Continue
with the deletion-policy gate and Auth hardening; do not begin exit review.

## Current state

- Backend stack: Node 20+, Hono, Zod, Drizzle, and PostgreSQL.
- `/health` is unversioned; `/v1` mounts all current application route families.
- Auth/profile routes and mobile callers use `/v1`; temporary unversioned
  auth/profile aliases are retired.
- Stable request IDs, error envelopes, pagination primitives, and current
  auth/profile DTO contracts exist.
- Server signup, verification, login, refresh rotation/reuse revocation,
  logout, password reset, access-token authentication, and protected
  current-profile read/update exist.
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
- [x] `AUTH-10` Immediate irreversible account tombstoning, credential/profile
  erasure, private media-reference cleanup, refresh revocation, live-access
  denial, published-content/moderation reference retention, and mobile cleanup.

Latest Auth branch verification:

- server typecheck passed;
- backend tests passed 89/89 with zero skips;
- mobile/root checks passed;
- native-focused mobile tests passed 21 suites/114 tests;
- diff check passed.

Real SMTP/PostgreSQL verification passed for verification and reset delivery,
session issuance, reset revocation, password replacement, and subsequent login.
No Android device was available for the exact native checks in
`docs/progress.md`; the exact QA account was removed before handoff.

## Next backend responsibilities

The active Goal continues with `AUTH-11`: Auth-scoped rate limits, redacted
logging, and adversarial concurrency/failure coverage. A later fresh task owns
independent Auth exit review before Recipe Data starts.

## Do not redo or expand

- Do not recreate the backend package, migrations, contract primitives, or
  typed client, and do not add another service/database architecture.
- Do not import mobile runtime code into `server/`.
- Do not implement recipe, media, Profile UI, or Auth exit-review fixes inside
  the next bounded Goal.
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

Keep this file under roughly 120 lines; detailed history belongs in Git. Before
each Goal stops, integrate its verified checkpoint into `dev` so the next Goal
is available from the main checkout.
