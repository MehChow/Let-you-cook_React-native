# API-02 Error Contract and Request IDs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every current Hono response a server-generated request ID and return every current JSON failure through one safe, typed error envelope.

**Architecture:** A typed request-ID middleware assigns one UUID and response header per request. Shared HTTP helpers own stable error definitions, Zod issue mapping, and root not-found/unexpected-error boundaries; current routes explicitly select stable error codes while preserving their successful payloads and status codes.

**Tech Stack:** Node 20+, TypeScript 6, Hono 4, Zod 4, `@hono/zod-validator`, Node test runner through `tsx`.

## Global Constraints

- Work only on branch `codex/mvp-error-contract` in `C:\Let-you-cook_React-native\.worktrees\mvp-error-contract`.
- Follow `docs/superpowers/specs/2026-07-30-api-error-contract-design.md`.
- Generate request IDs only on the server with Node `randomUUID()`; never trust or reuse a client-provided ID.
- Return `X-Request-Id` on every success and error response.
- Every JSON error has `{ "error": { "code", "message", "requestId" } }`.
- Only `validation_failed` errors include `fieldErrors`.
- Preserve every current success body and every current status, including placeholder `501` responses.
- Preserve `/health`, canonical `/v1` routes, and temporary unversioned aliases.
- Do not change mobile code, DTO schemas, database schema, migrations, route paths, auth/session semantics, or successful responses.
- Do not add logging, timing, transports, dashboards, or other `OPS-05` work.
- Add a short intent comment above every new named function or assigned arrow function.
- Use strict TypeScript without `any`.
- Follow RED-GREEN-REFACTOR and record each focused failing command and expected reason.
- Never build or test Expo web. Server tests plus root check and native-focused Jest are sufficient.
- Do not check `API-02` or advance to `API-03` until task review, whole-branch review, closure re-review, and fresh exit verification pass.

## File Map

- Create `server/src/http/requestId.ts`: request context type, header constant, and middleware.
- Create `server/src/http/errors.ts`: public error types, stable definitions, helpers, Zod issue mapping, validator hook, and root handlers.
- Create `server/src/http/errors.test.ts`: focused helper/validator/root-boundary behavior.
- Modify `server/src/app.ts`: typed root app, middleware, not-found handler, and error handler.
- Modify `server/src/app.test.ts`: request-ID and whole-app error integration.
- Modify `server/src/middleware/auth.ts`: standardized missing/invalid bearer errors and merged context variables.
- Modify `server/src/routes/auth.ts`: shared validator hook and stable auth error codes.
- Modify `server/src/routes/profiles.ts`: shared validator hook and missing-profile error.
- Modify `server/src/routes/recipes.ts`, `images.ts`, `reports.ts`, and `blocks.ts`: preserve `501` statuses with `not_implemented`.
- Modify auth tests where current failures need database-backed verification.
- Modify `docs/progress.md`, `server/docs/progress.md`, and `docs/mvp-roadmap.md` only at reviewed closure.

---

### Task 1: API-02A — Assign a server-owned request ID

**Files:**
- Create: `server/src/http/requestId.ts`
- Modify: `server/src/app.ts`
- Modify: `server/src/app.test.ts`

**Interfaces:**
- Produces: `REQUEST_ID_HEADER`, `RequestIdVariables`, `RequestIdEnv`, and `requestIdMiddleware`.
- Stores: `c.set("requestId", requestId)`.
- Guarantees: one server UUID per request and the same ID in `X-Request-Id`.
- Defers: JSON error envelopes to Task 2.

- [ ] **Step 1: Establish the isolated baseline**

Run:

```powershell
npm.cmd ci
npm.cmd --prefix server ci
if (-not (Test-Path "server/.env")) { Copy-Item "server/.env.example" "server/.env" }
npm.cmd run server:check
npm.cmd run server:test
npm.cmd run check
npm.cmd test -- --runInBand
git status --short --branch
```

Expected: all commands pass, backend tests have zero skips, and the worktree is clean.

- [ ] **Step 2: Write request-ID behavior tests**

Add tests to `server/src/app.test.ts` that:

```ts
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test("every response receives a unique server request ID", async () => {
  const first = await app.request("/health");
  const second = await app.request("/health");

  const firstId = first.headers.get("X-Request-Id");
  const secondId = second.headers.get("X-Request-Id");

  assert.match(firstId ?? "", UUID_PATTERN);
  assert.match(secondId ?? "", UUID_PATTERN);
  assert.notEqual(firstId, secondId);
  assert.deepEqual(await first.json(), { ok: true });
});

test("client request IDs are ignored and overwritten", async () => {
  const response = await app.request("/health", {
    headers: { "X-Request-Id": "client-controlled" },
  });

  assert.match(response.headers.get("X-Request-Id") ?? "", UUID_PATTERN);
  assert.notEqual(response.headers.get("X-Request-Id"), "client-controlled");
});
```

The production mutation these tests catch is missing middleware, reusing one ID, or trusting the inbound header.

- [ ] **Step 3: Run RED**

Run:

```powershell
npm.cmd --prefix server exec -- tsx --env-file=server/.env --test server/src/app.test.ts
```

Expected: the new assertions fail because `X-Request-Id` is absent. Existing routing tests remain green.

- [ ] **Step 4: Add the minimal middleware**

Create `server/src/http/requestId.ts`:

```ts
import { randomUUID } from "node:crypto";

import type { MiddlewareHandler } from "hono";

export const REQUEST_ID_HEADER = "X-Request-Id";

export interface RequestIdVariables {
  requestId: string;
}

export type RequestIdEnv = {
  Variables: RequestIdVariables;
};

// Assigns one server-owned correlation identifier to every response.
export const requestIdMiddleware: MiddlewareHandler<RequestIdEnv> = async (c, next) => {
  const requestId = randomUUID();
  c.set("requestId", requestId);
  c.header(REQUEST_ID_HEADER, requestId);
  await next();
};
```

Modify `server/src/app.ts`:

```ts
import { requestIdMiddleware, type RequestIdEnv } from "./http/requestId";

export const app = new Hono<RequestIdEnv>()
  .use("*", requestIdMiddleware)
  .get("/health", (c) => c.json({ ok: true }, 200))
  // keep the existing route mounts unchanged
```

- [ ] **Step 5: Run GREEN and task gates**

Run:

```powershell
npm.cmd --prefix server exec -- tsx --env-file=server/.env --test server/src/app.test.ts
npm.cmd run server:check
npm.cmd run server:test
git diff --check
```

Expected: focused tests, backend type-check, and all backend tests pass with zero skips.

- [ ] **Step 6: Commit**

```powershell
git add server/src/http/requestId.ts server/src/app.ts server/src/app.test.ts
git commit -m "API-02: Add server request IDs"
git status --short --branch
```

Write the SDD report with RED/GREEN output and submit the exact task range for task review.

---

### Task 2: API-02B — Define the shared envelope and root boundaries

**Files:**
- Create: `server/src/http/errors.ts`
- Create: `server/src/http/errors.test.ts`
- Modify: `server/src/app.ts`
- Modify: `server/src/app.test.ts`

**Interfaces:**
- Produces: `FieldErrors`, `ApiErrorEnvelope`, `NonValidationErrorCode`, `errorResponse`, `validationErrorResponse`, `validationErrorHook`, `handleNotFound`, and `handleAppError`.
- Consumes: `RequestIdEnv` and `c.get("requestId")`.
- Guarantees: non-validation errors cannot include `fieldErrors`; unexpected failures never expose thrown text.

- [ ] **Step 1: Write focused failing tests**

Create `server/src/http/errors.test.ts` using small real Hono applications with `requestIdMiddleware`. Cover:

```ts
test("non-validation errors omit fieldErrors and match the response header", async () => {
  const testApp = new Hono<RequestIdEnv>()
    .use("*", requestIdMiddleware)
    .get("/error", (c) => errorResponse(c, "authentication_required"));

  const response = await testApp.request("/error");
  const body = (await response.json()) as ApiErrorEnvelope;

  assert.equal(response.status, 401);
  assert.equal(body.error.code, "authentication_required");
  assert.equal(body.error.message, "Authentication is required.");
  assert.equal(body.error.requestId, response.headers.get(REQUEST_ID_HEADER));
  assert.equal("fieldErrors" in body.error, false);
});

test("validation issues are grouped by dot path in encounter order", async () => {
  const fieldErrors = fieldErrorsFromIssues([
    { path: ["ingredients", 1, "amount"], message: "Enter a quantity." },
    { path: ["ingredients", 1, "amount"], message: "Use a positive quantity." },
    { path: [], message: "Invalid form." },
  ]);

  assert.deepEqual(fieldErrors, {
    "ingredients.1.amount": ["Enter a quantity.", "Use a positive quantity."],
    _root: ["Invalid form."],
  });
});
```

Also build real test apps to prove:

- `validationErrorHook` returns `400 validation_failed`;
- `handleNotFound` returns safe `404 route_not_found`;
- `handleAppError(new Error("secret SQL"))` returns `500 internal_server_error` and the serialized body does not contain `secret SQL`;
- a thrown Hono `HTTPException(400)` maps to `400 malformed_request`.

Extend `server/src/app.test.ts` so `/v1/health` asserts the full `route_not_found` envelope and header/body request-ID equality.

- [ ] **Step 2: Run RED**

Run:

```powershell
npm.cmd --prefix server exec -- tsx --env-file=server/.env --test server/src/http/errors.test.ts server/src/app.test.ts
```

Expected: compilation/test failure because the shared error module and root handlers do not exist.

- [ ] **Step 3: Implement stable definitions and helpers**

Create `server/src/http/errors.ts` with these exact current codes:

```ts
export const errorDefinitions = {
  malformed_request: { status: 400, message: "The request could not be read." },
  authentication_required: { status: 401, message: "Authentication is required." },
  invalid_access_token: { status: 401, message: "Authentication is invalid or expired." },
  invalid_credentials: { status: 401, message: "Email or password is incorrect." },
  invalid_refresh_token: { status: 401, message: "Refresh token is invalid." },
  refresh_token_expired: { status: 401, message: "Refresh token has expired." },
  refresh_token_reuse_detected: { status: 403, message: "This session is no longer valid." },
  resource_not_found: { status: 404, message: "The requested resource was not found." },
  route_not_found: { status: 404, message: "The requested endpoint was not found." },
  email_already_registered: { status: 409, message: "Email is already registered." },
  not_implemented: { status: 501, message: "This operation is not available yet." },
  internal_server_error: { status: 500, message: "The server could not complete the request." },
} as const;
```

Define `NonValidationErrorCode = keyof typeof errorDefinitions`. Import
`ContentfulStatusCode` from `hono/utils/http-status` and use it for the stored
status rather than `number`. Define the discriminated error interfaces from the
approved design.

Implement:

```ts
// Converts Zod issues into deterministic field-error arrays.
export const fieldErrorsFromIssues = (
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>,
): FieldErrors => {
  const fieldErrors: FieldErrors = {};
  for (const issue of issues) {
    const path =
      issue.path.length === 0 ? "_root" : issue.path.map(String).join(".");
    (fieldErrors[path] ??= []).push(issue.message);
  }
  return fieldErrors;
};
```

`errorResponse(c, code)` selects both status and message from `errorDefinitions`. `validationErrorResponse(c, fieldErrors)` returns status `400`, code `validation_failed`, message `Some fields need attention.`, and the context request ID. `validationErrorHook(result, c)` returns nothing on success and calls the validation helper on failure.

`handleNotFound(c)` returns `route_not_found`. `handleAppError(error, c)` maps `HTTPException` status `400` to `malformed_request` and all other thrown failures to `internal_server_error`; it never serializes the thrown value.

- [ ] **Step 4: Wire root boundaries**

Modify `server/src/app.ts` after the route chain:

```ts
app.notFound(handleNotFound);
app.onError(handleAppError);
```

Keep middleware first and every existing route mount unchanged.

- [ ] **Step 5: Run GREEN and task gates**

```powershell
npm.cmd --prefix server exec -- tsx --env-file=server/.env --test server/src/http/errors.test.ts server/src/app.test.ts
npm.cmd run server:check
npm.cmd run server:test
git diff --check
```

Expected: focused tests and all backend gates pass with zero skips.

- [ ] **Step 6: Commit**

```powershell
git add server/src/http/errors.ts server/src/http/errors.test.ts server/src/app.ts server/src/app.test.ts
git commit -m "API-02: Add shared error boundaries"
git status --short --branch
```

Write the task report and submit the exact task range for task review.

---

### Task 3: API-02C — Convert current route failures and close the contract

**Files:**
- Modify: `server/src/middleware/auth.ts`
- Modify: `server/src/routes/auth.ts`
- Modify: `server/src/routes/profiles.ts`
- Modify: `server/src/routes/recipes.ts`
- Modify: `server/src/routes/images.ts`
- Modify: `server/src/routes/reports.ts`
- Modify: `server/src/routes/blocks.ts`
- Modify: `server/src/app.test.ts`
- Modify: `server/src/auth/signup-validation.test.ts`
- Modify: `server/src/auth/auth-smoke.test.ts`
- Modify at reviewed closure: `docs/progress.md`, `server/docs/progress.md`, `docs/mvp-roadmap.md`

**Interfaces:**
- Consumes: `errorResponse`, `validationErrorHook`, `RequestIdVariables`, and the exact stable codes from Task 2.
- Preserves: all success bodies/statuses and all current failure statuses.
- Produces: one envelope for every current explicit route/middleware failure.

- [ ] **Step 1: Write failing whole-app error tests**

Extend `server/src/app.test.ts` with a table covering current database-free failures:

```ts
const cases = [
  { path: "/v1/auth/login", method: "POST", body: "{}", status: 400, code: "validation_failed" },
  { path: "/v1/auth/login", method: "POST", body: "{", status: 400, code: "malformed_request" },
  { path: "/v1/profiles/me", method: "GET", status: 401, code: "authentication_required" },
  { path: "/v1/images/upload-url", method: "POST", body: "{}", status: 501, code: "not_implemented" },
  { path: "/v1/reports", method: "POST", body: "{}", status: 501, code: "not_implemented" },
  { path: "/v1/blocks", method: "POST", body: "{}", status: 501, code: "not_implemented" },
] as const;
```

For each response assert status, exact code, safe message, header/body request-ID equality, and absence of `fieldErrors` except `validation_failed`. Add recipe detail/create `501` cases and representative legacy-alias cases.

Update `server/src/auth/signup-validation.test.ts` to assert the exact validation envelope and password path. Extend `server/src/auth/auth-smoke.test.ts` with database-backed assertions for:

- duplicate signup: `409 email_already_registered`;
- wrong-password login: `401 invalid_credentials`;
- unknown refresh token: `401 invalid_refresh_token`;
- expired refresh token: `401 refresh_token_expired`;
- reused refresh token: `403 refresh_token_reuse_detected`;
- valid-token lookup for a deleted profile: `404 resource_not_found`.

Each test must compare body request ID to `X-Request-Id` and must clean up only its own fixture rows.

- [ ] **Step 2: Run RED**

```powershell
npm.cmd --prefix server exec -- tsx --env-file=server/.env --test server/src/app.test.ts server/src/auth/signup-validation.test.ts server/src/auth/auth-smoke.test.ts
```

Expected: current raw Zod bodies and `{ message }` route responses fail the envelope assertions.

- [ ] **Step 3: Convert validators and auth middleware**

In `server/src/routes/auth.ts` and `server/src/routes/profiles.ts`, pass `validationErrorHook` as the third argument of every `zValidator`.

Change `AuthVariables`:

```ts
export interface AuthVariables extends RequestIdVariables {
  userId: string;
}
```

In `requireAuth`, return:

```ts
return errorResponse(c, "authentication_required");
```

for a missing token, and:

```ts
return errorResponse(c, "invalid_access_token");
```

for verification failure.

- [ ] **Step 4: Convert current explicit route errors**

Replace only the current failure branches with these exact mappings:

| Source | Code |
| --- | --- |
| Signup unique violation | `email_already_registered` |
| Login failed credentials | `invalid_credentials` |
| Unknown refresh token | `invalid_refresh_token` |
| Reused refresh token | `refresh_token_reuse_detected` |
| Expired/revoked refresh token | `refresh_token_expired` |
| Missing profile | `resource_not_found` |
| Recipe detail/create placeholder | `not_implemented` |
| Image upload placeholder | `not_implemented` |
| Report placeholder | `not_implemented` |
| Block placeholder | `not_implemented` |

Use `errorResponse(c, code)` at each branch. Do not change the surrounding database/auth logic or any success return.

- [ ] **Step 5: Run GREEN and complete automated gates**

```powershell
npm.cmd --prefix server exec -- tsx --env-file=server/.env --test server/src/app.test.ts server/src/http/errors.test.ts server/src/auth/signup-validation.test.ts server/src/auth/auth-smoke.test.ts
npm.cmd run server:check
npm.cmd run server:test
npm.cmd run check
npm.cmd test -- --runInBand
git diff --check
```

Expected: all focused tests pass; backend tests have zero failures/skips; root check and all native-focused Jest suites pass.

- [ ] **Step 6: Record pending-review evidence and commit**

Update `docs/progress.md` and `server/docs/progress.md` with exact RED/GREEN/full-gate evidence, but keep `API-02` unchecked and the next action at API-02 review pending. Do not advance to API-03 yet.

```powershell
git add server/src/middleware/auth.ts server/src/routes/auth.ts server/src/routes/profiles.ts server/src/routes/recipes.ts server/src/routes/images.ts server/src/routes/reports.ts server/src/routes/blocks.ts server/src/app.test.ts server/src/auth/signup-validation.test.ts server/src/auth/auth-smoke.test.ts docs/progress.md server/docs/progress.md
git commit -m "API-02: Standardize current route errors"
git status --short --branch
```

Submit the exact task range for task review, then run the mandatory whole-branch review.

- [ ] **Step 7: Perform the single reviewed closure wave**

Only after task and broad reviews have no open Critical/Important findings:

- fix the complete final-review finding set in one wave;
- check only `API-02` in `docs/mvp-roadmap.md`;
- advance `docs/progress.md` and `server/docs/progress.md` to `API-03`;
- retain `AUTH-01`, `API-03`, and later tasks unchecked;
- run one scoped re-review of the closure/fix diff;
- run fresh exit verification on the exact closure head.

Commit:

```powershell
git add docs/progress.md server/docs/progress.md docs/mvp-roadmap.md
git commit -m "API-02: Close error contract review"
```

## Exit Gate

- Every response contains a syntactically valid server-generated `X-Request-Id`.
- A client-provided request ID is ignored and overwritten.
- Every current JSON failure uses the approved envelope and stable machine code.
- Error envelope `requestId` equals the response header.
- Only validation failures include deterministic `fieldErrors`.
- Malformed JSON stays `400`; unmatched routes stay `404`; unexpected failures are safe `500`.
- All existing success bodies and all current statuses, including `501`, are unchanged.
- `/health`, `/v1`, and temporary aliases remain available.
- No mobile, schema, migration, DTO, logging, or auth-semantic change exists.
- Focused tests, backend type-check/tests, root check, and native-focused Jest pass with zero failures/skips.
- Task reviews, whole-branch review, scoped closure re-review, fresh exit verification, docs, and roadmap are complete.
- The feature branch is clean and ready for the user's pre-authorized local merge into `dev`.
