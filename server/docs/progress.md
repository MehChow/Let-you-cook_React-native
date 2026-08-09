# Backend Progress

This is the compact backend supplement to `docs/progress.md`. The target API
and schema contract remains `docs/api-and-data-model.md`.

## Current backend resume point

- Active feature track: Authentication and account lifecycle
- Next bounded Goal: complete remaining Android-native Auth exit evidence
- Feature branch: `codex/mvp-auth-account`
- Last integrated Goal checkpoint: `AUTH-11` implementation and independent
  exit-review fixes (`90c5a84`, `8abdcad`, `14bd4bd`, and `11d91d1`)
- Goal prompt: `docs/current-goal.md`

The API contract track and `AUTH-01` through `AUTH-11` are implemented. The
independent review and all confirmed fixes are complete; continue only with the
remaining native Auth exit evidence. Do not begin Recipe Data or Profile UI.

## Current state

- Backend stack: Node 20+, Hono, Zod, Drizzle, and PostgreSQL.
- `/health` is unversioned; `/v1` mounts all current application route families.
- Auth/profile routes and mobile callers use `/v1`; temporary unversioned
  auth/profile aliases are retired.
- Stable request IDs, error envelopes, pagination, and auth/profile DTOs exist.
- Server signup, verification, login, refresh rotation/reuse revocation,
  logout, password reset, access-token authentication, and protected
  current-profile read/update exist.
- Mobile sessions use `/v1`, SecureStore, hydration refresh, and revoking logout.
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
- [x] `AUTH-11` Scoped keyed-HMAC Auth limits, stable `429`/`Retry-After`,
  allowlisted operational logging, transactional refresh serialization, and
  deterministic concurrency/delivery/database failure coverage.

Latest Auth branch verification after independent exit-review fixes:

- server typecheck passed;
- backend tests passed 104/104 with zero skips;
- mobile/root checks passed;
- native-focused mobile tests passed 21 suites/122 tests;
- diff check passed.

Fresh real SMTP/PostgreSQL verification passed verification delivery,
unverified denial, reset completion, `202/202/202/429` limiting with one reset
message, password replacement, refresh-family replay isolation, deletion,
immediate old-token denial, and email reuse. Exact QA database and Mailpit
records were removed and verified at zero. Migration `0004` applied
successfully. Android discovery again returned no connected target; exact
pending native checks remain in `docs/progress.md`.

## Next backend responsibilities

The independent Auth review and confirmed fixes are complete. A fresh task owns
only the remaining Android-native exit evidence; do not mark the track complete
or start Recipe Data until those reachable checks pass.

## Do not redo or expand

- Do not recreate the backend package, migrations, contract primitives, or
  typed client, and do not add another service/database architecture.
- Do not import mobile runtime code into `server/`.
- Do not implement recipe, media, Profile UI, or unconfirmed review findings.
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
