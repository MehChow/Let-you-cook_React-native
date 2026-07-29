# API-02 Error Contract and Request ID Design

Status: approved by delegated owner decision on 2026-07-30

## Goal

Give every current Hono response a server-generated request ID and replace every
current JSON error shape with one typed, safe envelope. Preserve all successful
payloads and all current status codes, including the temporary `501` route
placeholders.

## Scope

API-02 changes only the server HTTP boundary:

- generate one opaque UUID for each request;
- return that value in `X-Request-Id` on every response;
- include the same value in every JSON error envelope;
- standardize current validation, authentication, profile, placeholder,
  not-found, malformed-request, and unexpected-error responses;
- keep field-level details only on schema-validation errors.

API-02 does not change mobile code, Hono DTO schemas, database schema,
migrations, auth/session semantics, successful response bodies, route paths, or
status codes. It does not run Expo web.

## Current State

The root Hono app mounts `/health`, the canonical `/v1` application tree, and
temporary unversioned compatibility aliases. Current errors are inconsistent:

- `@hono/zod-validator` returns its raw parse result;
- auth, profile, and placeholder routes return `{ "message": "..." }`;
- unmatched routes use Hono's default response;
- an uncaught exception can expose framework-provided text;
- responses have no correlation identifier.

The current mobile auth wrapper reads a top-level `message`. API-02 deliberately
does not modify that client: it safely falls back to `"Request failed"`.
`API-07` owns reusable mobile error-to-UI mapping.

## Approaches Considered

### 1. Explicit boundary helpers and route conversion — selected

Add typed request-ID middleware, a central error definition registry, response
helpers, a shared Zod hook, and root `notFound`/`onError` handlers. Convert each
current expected error return explicitly.

This is the least invasive robust option. Statuses and machine codes are visible
at each decision point, successful responses are untouched, and future Hono RPC
typing can see the error envelopes.

### 2. Rewrite every non-success response in middleware

A response-rewriting layer would require fewer route edits, but it would need to
consume response bodies, infer codes from status or message text, and recreate
headers. That is fragile for streams, future binary responses, and typed Hono
contracts.

### 3. Throw typed exceptions for every expected failure

A custom exception hierarchy could centralize formatting, but it would rewrite
normal route control flow and still require a separate validation hook. It is a
larger change without a current benefit.

## Architecture

### Request context

`server/src/http/requestId.ts` owns:

```ts
export const REQUEST_ID_HEADER = "X-Request-Id";

export interface RequestIdVariables {
  requestId: string;
}

export type RequestIdEnv = {
  Variables: RequestIdVariables;
};

export const requestIdMiddleware: MiddlewareHandler<RequestIdEnv>;
```

The middleware calls Node's `randomUUID()` exactly once per request, stores the
result in `c.set("requestId", requestId)`, and sets the response header before
calling `next()`. It never reads `X-Request-Id` or any other client value.
Therefore a client-provided header is ignored and overwritten.

`AuthVariables` extends `RequestIdVariables` with `userId`. Routers that create
errors use `RequestIdEnv`; the protected profile router uses the extended auth
environment.

### Error contract

`server/src/http/errors.ts` owns the public TypeScript contract, the stable
definitions, and two response helpers:

```ts
export type FieldErrors = Record<string, string[]>;

export interface ValidationApiError {
  code: "validation_failed";
  message: string;
  fieldErrors: FieldErrors;
  requestId: string;
}

export interface NonValidationApiError {
  code: NonValidationErrorCode;
  message: string;
  requestId: string;
}

export interface ApiErrorEnvelope {
  error: ValidationApiError | NonValidationApiError;
}
```

`validationErrorResponse(c, fieldErrors)` is the only helper that emits
`fieldErrors`. `errorResponse(c, code)` accepts only
`NonValidationErrorCode`, so non-validation responses cannot accidentally add
that property.

Definitions provide both the status and server-safe generic message. Routes
select a code; they do not duplicate status/message pairs.

## Stable Current Error Definitions

| Code | Status | Safe message | Current source |
| --- | ---: | --- | --- |
| `validation_failed` | 400 | `Some fields need attention.` | Zod schema failure |
| `malformed_request` | 400 | `The request could not be read.` | Malformed JSON |
| `authentication_required` | 401 | `Authentication is required.` | Missing bearer token |
| `invalid_access_token` | 401 | `Authentication is invalid or expired.` | Invalid bearer token |
| `invalid_credentials` | 401 | `Email or password is incorrect.` | Failed login |
| `invalid_refresh_token` | 401 | `Refresh token is invalid.` | Unknown refresh token |
| `refresh_token_expired` | 401 | `Refresh token has expired.` | Expired refresh token |
| `refresh_token_reuse_detected` | 403 | `This session is no longer valid.` | Reused refresh token |
| `resource_not_found` | 404 | `The requested resource was not found.` | Missing profile |
| `route_not_found` | 404 | `The requested endpoint was not found.` | Unmatched route |
| `email_already_registered` | 409 | `Email is already registered.` | Signup uniqueness conflict |
| `not_implemented` | 501 | `This operation is not available yet.` | Current route placeholders |
| `internal_server_error` | 500 | `The server could not complete the request.` | Unexpected exception |

Future feature tasks add feature-specific codes when their behavior exists.
API-02 does not predeclare unused `413`, `422`, or `429` codes.

## Response Rules

Every success keeps its current JSON body and status. The only addition is the
`X-Request-Id` header.

Every expected error uses:

```json
{
  "error": {
    "code": "invalid_credentials",
    "message": "Email or password is incorrect.",
    "requestId": "f6822e40-7c3a-40ec-a77f-c3291888dc0c"
  }
}
```

Schema validation uses:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Some fields need attention.",
    "fieldErrors": {
      "ingredients.1.amount": ["Enter a quantity."]
    },
    "requestId": "f6822e40-7c3a-40ec-a77f-c3291888dc0c"
  }
}
```

Zod issue paths use dot notation; numeric array positions remain numeric path
segments. Issues without a path use `_root`. Multiple messages for one path
remain in encounter order. Only the issue message is returned; raw inputs, Zod
objects, stack traces, database errors, and thrown error messages are omitted.

Malformed JSON remains `400` but uses `malformed_request` without
`fieldErrors`.

## Root Error Boundaries

The root app is typed with `RequestIdEnv` and registers middleware before every
route:

```ts
const app = new Hono<RequestIdEnv>();

app.use("*", requestIdMiddleware);
```

The root `notFound` handler returns `route_not_found`. The root `onError`
handler maps Hono's malformed-JSON `HTTPException` to `malformed_request` and
maps every other thrown failure to `internal_server_error`.

The unexpected-error response never contains `error.message`, `error.cause`, a
stack trace, SQL, credentials, or a URL. Expected route failures continue to be
explicit returns rather than thrown exceptions.

## Current Route Conversion

The implementation converts all current error-producing branches:

- auth validator failures;
- signup duplicate email;
- login invalid credentials;
- invalid, expired, and reused refresh tokens;
- auth middleware missing/invalid bearer tokens;
- profile validator failures and missing current profile;
- recipe, image, report, and block `501` placeholders;
- root unmatched routes and unexpected failures.

Both `/v1` and the temporary unversioned aliases reuse the same route instances,
so they receive identical standardized behavior. `GET /health`, recipe-list,
favourite-list, auth success, profile success, refresh success, and logout
success payloads remain unchanged.

## Verification Strategy

Tests use the native Node/Hono request harness; no browser, Metro, or Android
runtime is needed because API-02 has no rendered mobile change.

Focused coverage proves:

- success responses contain a syntactically valid server UUID;
- consecutive requests receive different IDs;
- a client-supplied `X-Request-Id` is overwritten;
- error header and envelope `requestId` are identical;
- validation paths and grouped messages are deterministic;
- non-validation envelopes omit `fieldErrors`;
- malformed JSON remains `400`;
- unmatched routes are safe `404` envelopes;
- unexpected error text is absent from the `500` response;
- every current explicit route error has its exact status and machine code;
- all current `501` statuses are preserved;
- existing successful bodies are unchanged.

The implementation follows RED-GREEN-REFACTOR per plan task. Full exit gates
are `npm.cmd run server:check`, `npm.cmd run server:test`,
`npm.cmd run check`, and `npm.cmd test -- --runInBand`.

## OPS-05 Boundary

API-02 creates the correlation primitive that `OPS-05` will consume. It does
not add request logs, error logs, timing, structured log fields, redaction
policy, transports, retention, dashboards, or operational alerting.

`OPS-05` may read the already-generated request ID from Hono context and place
it in redacted structured events. It must not introduce a second ID or begin
trusting client-supplied IDs.

## Completion

API-02 is complete only after implementation tasks pass their SDD specification
and code-quality reviews, broad verification passes, the roadmap item is
checked, both progress files record exact evidence, and the worktree is clean.
Writing this design and its implementation plan does not complete API-02.
