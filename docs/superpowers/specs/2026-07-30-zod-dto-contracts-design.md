# API-04 Stable Zod DTO Contracts Design

Status: approved by delegated owner decision on 2026-07-30

## Goal

Make every currently implemented JSON request and success response explicit,
runtime-validated, and reusable for Hono typing without exporting database row
shapes or maintaining handwritten duplicate TypeScript interfaces.

## Scope

API-04 covers:

- cross-cutting health, error-envelope, page-info, and cursor-page schemas;
- current auth request schemas and current login/signup/refresh/logout success
  schemas;
- current private-profile request and success schemas;
- route consumption of those schemas;
- schema-focused tests that reject accidental private fields and malformed
  output.

It does not define speculative recipe, media, review, favourite, report, block,
email-verification, password-reset, account-deletion, or public-profile DTOs.
Those schemas are added with the feature that implements the route. It does not
change endpoint paths, statuses, success bodies, authentication semantics,
database schema, mobile code, or API-02 error behavior.

The current signup response still issues a session. That behavior is temporary
and will change deliberately in `AUTH-08` when mandatory verification is
implemented. API-04 names the reusable session schema rather than claiming
that signup itself has reached its final product contract.

## Approaches Considered

### 1. Feature-owned contract modules with inferred types — selected

Create small modules under `server/src/contracts/`. Each schema is the runtime
source of truth and exports `z.infer` types. Routes import request schemas for
`zValidator` and parse projected success DTOs before `c.json`.

This keeps contracts out of database and UI layers, supports API-05 Hono
typing, and prevents route-local schema drift.

### 2. One global contracts file

A single file is easy initially but would quickly couple auth, recipes, media,
and moderation. It also makes later feature ownership and review harder.

### 3. Define every planned MVP DTO now

This appears comprehensive but would invent fields before the database and
behavior exist. Later implementation would either silently diverge or spend
time preserving guesses. API-04 instead establishes the pattern with real
routes.

## Module Layout

```text
server/src/contracts/
  common.ts
  system.ts
  auth.ts
  profiles.ts
```

`common.ts` owns:

- `opaqueIdSchema`;
- `isoTimestampSchema`;
- `pageInfoSchema`;
- `cursorPageSchema(itemSchema)`;
- Zod schemas for validation and non-validation API-02 envelopes.

The error schemas reuse the existing closed code set rather than accepting any
string. Only the validation branch permits `fieldErrors`.

`system.ts` owns `healthResponseSchema`.

`auth.ts` owns:

- `authCredentialsSchema`;
- `signUpInputSchema`;
- `refreshTokenInputSchema`;
- `authUserSchema`;
- `authTokensSchema`;
- `authSessionResponseSchema`;
- `logoutResponseSchema`.

`profiles.ts` owns:

- `updateProfileInputSchema`;
- `editableProfileSchema`;
- `privateProfileSchema`;
- the existing GET and PATCH response wrapper schemas.

Every public schema uses a closed object shape for response validation so raw
database fields such as password hashes, token hashes, internal timestamps, or
future moderation state cannot leak. Request schemas preserve current behavior:
recognized fields are validated and unknown fields are stripped rather than
turning API-04 into a breaking request-policy change.

## Runtime Use

Routes continue to use `zValidator` with API-02's validation hook, but request
schemas move out of route files.

Before a success response:

```ts
return c.json(authSessionResponseSchema.parse({ user, tokens }), 200);
```

The route still projects explicit database fields. Parsing is a final boundary
guard, not permission to pass database rows wholesale. A programming error in
server output reaches the existing safe `500 internal_server_error` boundary.

Literal response values use literal schemas where meaningful:

- health: `{ ok: true }`;
- logout: `{ ok: true }`.

Token strings are non-empty opaque strings. IDs are UUIDs for currently
implemented PostgreSQL entities. Email output is normalized email. Nullable
profile fields are explicit.

## Type Ownership

All DTO TypeScript types are inferred from schemas:

```ts
export type AuthTokens = z.infer<typeof authTokensSchema>;
```

No Drizzle row type crosses the route boundary. API-04 does not move these
schemas into the mobile bundle; API-05 will use Hono `AppType` for the private
typed client. Mobile-side runtime validation can be added deliberately where
untrusted persisted or network data crosses its boundary.

## Compatibility

API-04 preserves every current successful JSON shape and status:

- health `200`;
- signup `201`;
- login, refresh, logout, profile GET, and profile PATCH `200`.

Canonical `/v1` routes and temporary unversioned aliases consume the same
router schemas. Existing API-02 errors and request IDs remain unchanged.

## Verification

Focused tests prove:

- valid current request and response examples parse;
- inferred output shapes match route JSON;
- unknown response keys are rejected;
- password hashes, refresh-token IDs, and unrelated database fields are
  rejected;
- validation errors cannot omit `fieldErrors`;
- non-validation errors cannot add `fieldErrors`;
- page info enforces cursor/boolean consistency at the schema level where
  expressible, and generic page schemas validate their items;
- current route smoke tests remain byte-shape compatible.

The track then passes server type-check/tests, root lint/type-check,
native-focused Jest, and `git diff --check`. Expo web is never used.
