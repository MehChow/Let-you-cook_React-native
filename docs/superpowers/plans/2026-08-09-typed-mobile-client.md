# Typed Mobile Client Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable Hono RPC client whose routes and DTOs are inferred from the server's composed `AppType`.

**Architecture:** The server remains the only route-type source. The mobile project resolves a type-only `@letyoucook/server` alias and uses its own `hono/client` runtime to create a normalized, injectable client without changing existing auth or refresh behavior.

**Tech Stack:** Expo SDK 56, React Native 0.85, TypeScript 6, Hono 4, Jest 29.

## Global Constraints

- Work only on `codex/mvp-typed-client` in `C:\Let-you-cook_React-native\.worktrees\mvp-typed-client`.
- Follow `docs/superpowers/specs/2026-08-09-typed-mobile-client-design.md`.
- Preserve current server paths, statuses, bodies, authentication semantics, and request IDs.
- Do not change `src/features/auth/api.ts`, `src/lib/apiClientCore.ts`, or `src/lib/apiClient.ts`.
- Defer `/v1` auth-wrapper migration to `AUTH-01`, query/auth/retry policy to `API-06`, and UI error mapping to `API-07`.
- Import `AppType` with `import type`; never bundle server runtime code into Expo.
- Add a short purpose comment above every named function and assigned arrow function.
- Follow RED-GREEN-REFACTOR and record the focused failing evidence.
- Never build or test Expo web.
- Do not check API-05 until review and every exit gate pass.

---

### Task 1: Configure and prove the typed client

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tsconfig.json`
- Create: `src/lib/typedApiClient.ts`
- Create: `__tests__/typed-api-client.test.ts`
- Modify: `docs/api-and-data-model.md`
- Modify: `docs/mvp-roadmap.md`
- Modify: `docs/progress.md`
- Modify: `server/docs/progress.md`
- Create: `.superpowers/sdd/2026-08-09-typed-mobile-client/progress.md`

**Interfaces:**
- Consumes: `server/src/app.ts` export `type AppType = typeof app` and `appEnv.apiBaseUrl`.
- Produces: `TypedApiClientOptions`, `createTypedApiClient(options?: TypedApiClientOptions)`, and `typedApiClient`.

- [ ] **Step 1: Add the aligned Hono runtime dependency**

  Run `npm.cmd install hono@^4.11.1 --save`. Confirm `package.json` and
  `package-lock.json` contain the root dependency and that no unrelated
  dependency ranges changed.

- [ ] **Step 2: Write the failing protected-request test**

  Create `__tests__/typed-api-client.test.ts` with a real injected fetch that
  captures a `Request`, returns a complete private-profile success fixture,
  invokes `client.v1.profiles.me.$get(undefined, { headers: { Authorization:
  "Bearer access-token" } })`, and asserts:

  ```ts
  expect(request.url).toBe("http://api.test/v1/profiles/me");
  expect(request.method).toBe("GET");
  expect(request.headers.get("Authorization")).toBe("Bearer access-token");
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    profile: {
      id: "00000000-0000-4000-8000-000000000001",
      email: "cook@example.com",
      displayName: "Cook",
      bio: null,
      avatarImageUrl: null,
    },
  });
  ```

  Type the parsed body using
  `InferResponseType<typeof client.v1.profiles.me.$get, 200>` so a missing or
  widened route contract fails TypeScript compilation.

- [ ] **Step 3: Run the focused test and verify RED**

  Run `npm.cmd test -- --runInBand __tests__/typed-api-client.test.ts`.
  Expected: fail because `@/lib/typedApiClient` does not exist.

- [ ] **Step 4: Add the type-only server alias and minimal client**

  Add this path to root `tsconfig.json`:

  ```json
  "@letyoucook/server": ["./server/src/app.ts"]
  ```

  Create `src/lib/typedApiClient.ts` with:

  ```ts
  import { appEnv } from "@/config/env";
  import type { AppType } from "@letyoucook/server";
  import { hc } from "hono/client";

  export interface TypedApiClientOptions {
    baseUrl?: string;
    fetch?: typeof fetch;
  }

  // Creates the AppType-derived client for a normalized API origin.
  export const createTypedApiClient = (options: TypedApiClientOptions = {}) => {
    const baseUrl = (options.baseUrl ?? appEnv.apiBaseUrl).replace(/\/+$/, "");
    return hc<AppType>(baseUrl, { fetch: options.fetch });
  };

  export const typedApiClient = createTypedApiClient();
  ```

- [ ] **Step 5: Run focused GREEN and refactor**

  Run `npm.cmd test -- --runInBand __tests__/typed-api-client.test.ts`.
  Expected: one suite passes with no warnings. If Hono supplies the injected
  fetch with `(input, init)` rather than a `Request`, normalize only inside the
  test via `new Request(input, init)`; do not wrap production fetch.

- [ ] **Step 6: Run task checks**

  Run `npm.cmd run check`, `npm.cmd run server:check`, and
  `git diff --check`. Expected: all exit zero.

- [ ] **Step 7: Document and review API-05**

  Record the type-only boundary in `docs/api-and-data-model.md`, update both
  progress ledgers with RED/GREEN evidence, and complete the local SDD ledger.
  Review exact `dev..HEAD` scope for runtime server imports, unassigned auth or
  retry work, duplicated DTOs, Hono version drift, and missing purpose comments.
  Resolve every Critical or Important finding before checking API-05.

- [ ] **Step 8: Run fresh branch exit gates**

  Run:

  ```powershell
  npm.cmd test -- --runInBand __tests__/typed-api-client.test.ts
  npm.cmd run server:check
  npm.cmd run server:test
  npm.cmd run check
  npm.cmd test -- --runInBand
  git diff --check
  ```

  Expected: every command exits zero, with no skipped backend tests.

- [ ] **Step 9: Commit the completed task**

  Stage only API-05 files and commit as
  `API-05: Configure the typed mobile client`.

## Closure

- [ ] Verify the exact clean branch head and complete the tracked SDD ledger.
- [ ] Use `superpowers:finishing-a-development-branch` and select local merge,
  as pre-authorized by the owner.
- [ ] Fast-forward into `dev` and repeat merged-result verification.
- [ ] Remove the merged feature branch/worktree.
- [ ] Start API-06 from exact verified `dev` only if the 04:00 HKT stop
  checkpoint has not arrived.

## Completion Conditions

API-05 is complete only when the root app owns an aligned Hono runtime, mobile
code imports `AppType` type-only, the real typed client produces the protected
`/v1/profiles/me` request and typed `200` DTO, existing transport/auth behavior
is unchanged, documentation is current, all broad gates pass, and the merged
result is freshly verified.
