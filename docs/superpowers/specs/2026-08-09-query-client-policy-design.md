# Query Client Policy Design

## Objective

Complete `API-06` by composing the API-05 Hono RPC client with the existing
SecureStore-backed authenticated transport, preserving request cancellation,
and establishing conservative TanStack Query retry defaults.

## Scope

API-06 will:

- expose the existing authenticated transport as a `fetch`-compatible function;
- configure the Hono RPC singleton to use that transport;
- preserve an incoming `AbortSignal` on the initial protected request and the
  one post-refresh replay;
- retry transient queries at most twice with capped exponential delay;
- never retry mutations, explicit aborts, or non-transient HTTP failures;
- cover authentication, cancellation, retry classification, and defaults with
  native-focused Jest tests.

API-06 will not migrate auth route aliases to `/v1`, implement login/session
hydration, add error-to-UI mapping, add online/focus dependencies, or change
server behavior.

## Approaches Considered

### 1. Compose the existing auth transport into Hono RPC — selected

Widen `createApiClient().request` to the standard fetch input contract and pass
the configured singleton as Hono's injected fetch. This keeps SecureStore and
single-flight refresh in one place while retaining Hono route/DTO inference.

### 2. Add async authorization headers directly in Hono

This can attach a token but duplicates protected-route classification and
cannot reuse the current refresh/replay behavior without a second auth layer.

### 3. Defer authentication until the later auth track

This preserves current code but does not satisfy API-06 or establish the typed
protected-request path needed by the API track exit gate.

## Request and Cancellation Flow

The transport normalizes string, URL, and Request inputs into a replayable base
Request. Each network attempt receives a clone, with the latest bearer token
added only for protected paths. The original signal is retained by each clone.
Refresh itself is shared and is not owned by one caller's signal; after refresh,
an aborted caller's replay remains aborted while other callers may complete.

The typed singleton injects `apiClient.request` into `hc<AppType>`. Individual
query functions pass TanStack's `signal` through Hono's `init` option.

## Retry Policy

Queries retry while `failureCount < 2` only for fetch-style `TypeError`s or
errors carrying HTTP status 408, 429, or 5xx. Abort errors and all other HTTP or
application errors do not retry. Delay is `min(1000 * 2^attempt, 30000)`.
Mutations default to no retry because writes are not generally idempotent.
The refresh replay remains authentication recovery, not a TanStack retry.

## Verification

Focused Jest tests prove bearer injection through the typed client, signal
identity/abortion on the first attempt and replay, retry classification/delay,
and QueryClient defaults. Then run root check, the complete native-focused Jest
suite, backend check/tests, and `git diff --check`. Never run Expo web.
