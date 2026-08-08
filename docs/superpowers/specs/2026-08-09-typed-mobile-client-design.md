# Typed Mobile Client Design

## Objective

Complete `API-05` by exposing the composed Hono application as a type-only
mobile contract and adding a reusable Hono RPC client for the Expo app. The
client must prove that a protected `/v1` request is generated from `AppType`
without moving existing auth wrappers, adding token lifecycle behavior, or
changing server routes.

## Scope

API-05 will:

- keep `server/src/app.ts` as the owner of `AppType`;
- make that type available to the mobile TypeScript project through a
  type-only path alias;
- add Hono as a mobile runtime dependency for `hono/client`;
- add a small typed-client factory and configured singleton under `src/lib`;
- verify base-URL normalization, injected fetch support, and a real typed
  `/v1/profiles/me` request.

API-05 will not:

- migrate the existing auth wrappers from unversioned aliases to `/v1`
  (`AUTH-01`);
- replace the current raw authenticated fetch client or wire screens to the
  Hono client;
- add TanStack Query defaults, authorization headers, refresh, cancellation,
  or retries (`API-06`);
- add mobile error-to-UI mapping (`API-07`);
- change server behavior, DTO schemas, database schema, or migrations.

## Approaches Considered

### 1. Hono RPC factory with a type-only server alias — selected

Map `@letyoucook/server` to `server/src/app.ts` for TypeScript only, import
`AppType` with `import type`, and construct the runtime client with
`hc<AppType>()` from the app's own Hono dependency. This preserves one route
type source, keeps server runtime code out of the Expo bundle, and provides a
small injection seam for tests and later auth/query integration.

### 2. Export inferred DTO types but keep raw fetch

This avoids a new mobile dependency, but it does not meet the Hono RPC
architecture decision and would keep URL/method/request typing handwritten.

### 3. Replace all auth and protected requests immediately

This would demonstrate more end-to-end behavior, but it would mix API-05 with
`AUTH-01` and API-06, making route migration and token refresh changes harder
to review and roll back independently.

## Architecture

`server/src/app.ts` remains the sole composed-route type source and continues
to export `AppType = typeof app`. The root TypeScript configuration maps the
server package name to that file. Mobile code imports only the type, so Metro
has no server runtime module to bundle.

`src/lib/typedApiClient.ts` owns:

- `TypedApiClientOptions`, with optional `baseUrl` and `fetch` overrides;
- `createTypedApiClient(options)`, which trims one or more trailing slashes
  from the selected base URL and calls `hc<AppType>`;
- `typedApiClient`, configured from the validated shared `appEnv.apiBaseUrl`.

The existing `src/lib/apiClientCore.ts`, `src/lib/apiClient.ts`, and
`src/features/auth/api.ts` remain unchanged. Later tasks can compose their
token/query/error policies around this typed transport.

## Data Flow

For a call such as `typedApiClient.v1.profiles.me.$get()`, Hono derives the
path, method, accepted inputs, status union, and JSON response type from
`AppType`. The configured runtime fetch sends the request to the normalized
mobile API base. API-05 returns Hono's response unchanged; parsing non-success
responses and presenting errors remain later-layer responsibilities.

## Error and Compatibility Behavior

The factory performs no network error translation and no retry. Invalid base
configuration remains owned by `src/config/env.ts`. Trimming trailing slashes
only prevents accidental double separators and does not modify path versions,
headers, response bodies, or status codes.

The root and server Hono version ranges stay aligned to avoid incompatible RPC
types. The mobile contract uses a type-only import, and no server database,
Node adapter, environment, or route module is imported at runtime.

## Verification

A native-focused Jest test will use the real Hono client with an injected
in-memory fetch implementation. It will call the typed protected profile
endpoint and assert the emitted URL, HTTP method, authorization header, status,
and parsed DTO fixture. The test's compile step also proves the
`AppType`-derived route and `200` response type exist.

The closure gate is:

- focused typed-client Jest test;
- `npm.cmd run server:check`;
- `npm.cmd run server:test`;
- `npm.cmd run check`;
- `npm.cmd test -- --runInBand`;
- `git diff --check`.

No Expo web command is permitted. No Android interaction is required because
API-05 changes no rendered or native behavior.
