# API-01 Contract Versioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose every existing application route beneath `/v1` while keeping `/health` exclusively unversioned and preserving the current unversioned callers until `AUTH-01`.

**Architecture:** Add one composed `v1Routes` Hono router containing the existing auth, profile, recipe, image, favourite, report, and block routers, then mount it once at `/v1` from the root application. Keep the current unversioned mounts as temporary compatibility aliases so the already-integrated sign-up flow and existing smoke tests do not break before `AUTH-01` migrates mobile auth paths.

**Tech Stack:** Node 20+, TypeScript 6, Hono 4, Node test runner through `tsx`, Expo 56 mobile client.

## Global Constraints

- Work only on branch `codex/mvp-api-contract` in `C:\Let-you-cook_React-native\.worktrees\mvp-api-contract`.
- Keep `GET /health` unversioned; `GET /v1/health` must remain `404`.
- Mount all current application route families below `/v1`: `auth`, `profiles`, `recipes`, `images`, `favourites`, `reports`, and `blocks`.
- Preserve the existing unversioned routes as temporary compatibility aliases. `AUTH-01` owns changing mobile auth wrappers to `/v1` and deciding when those aliases can be removed.
- Do not change request/response bodies, error shapes, DTOs, authentication behavior, route placeholder behavior, or database schema in `API-01`; those belong to later roadmap tasks.
- Do not change `src/features/auth/api.ts`, `src/lib/apiClientCore.ts`, or mobile URL expectations in `API-01`.
- Do not generate a Drizzle migration; this task has no schema implications.
- Add a short intent comment above every new named function or assigned arrow function in production code.
- Use strict TypeScript without `any`.
- Follow RED-GREEN-REFACTOR: record the focused failing command and failure reason before implementation, then record the passing focused and broad gates.
- Never build or test Expo web. There is no Android-visible behavior change in this server-routing task, so server tests plus the root mobile lint/type-check and Jest regression suite are sufficient.
- Preserve the four deferred Foundation minors recorded in `docs/progress.md`; they are outside this task.

## Design Decision

Three approaches were considered:

1. **Dual-mount the existing routers, recommended.** Add the canonical `/v1` tree while retaining legacy aliases until their callers migrate. This makes `API-01` independently safe and leaves `AUTH-01` with its explicitly documented mobile migration responsibility.
2. Move every route and all callers atomically. This gives a cleaner endpoint surface immediately, but it collapses `AUTH-01` into `API-01` and expands a routing-foundation task into auth integration.
3. Version only unauthenticated placeholder routes. This avoids touching auth, but it fails the approved design requirement that application routes live below `/v1`.

Use option 1. The compatibility aliases are deliberate transition infrastructure, not a permanent public contract.

## File Map

- Create `server/src/routes/v1.ts`: compose all current application routers under their resource names.
- Modify `server/src/app.ts`: keep `/health` and legacy aliases at the root, and mount `v1Routes` at `/v1`.
- Modify `server/src/app.test.ts`: prove the canonical versioned tree, health boundary, and compatibility aliases without requiring PostgreSQL.
- Modify `docs/progress.md`: record the `API-01` implementation result and point to `API-02` only after all gates and review pass.
- Modify `server/docs/progress.md`: mirror backend routing status, evidence, compatibility boundary, and next task.
- Modify `docs/mvp-roadmap.md`: check `API-01` only after implementation, review, and verification are complete.

---

### Task 1: API-01 — Introduce the versioned application router

**Files:**
- Create: `server/src/routes/v1.ts`
- Modify: `server/src/app.ts`
- Modify: `server/src/app.test.ts`
- Modify: `docs/progress.md`
- Modify: `server/docs/progress.md`
- Modify: `docs/mvp-roadmap.md`

**Interfaces:**
- Consumes: `authRoutes`, `profileRoutes`, `recipeRoutes`, `imageRoutes`, `favouriteRoutes`, `reportRoutes`, and `blockRoutes` from `server/src/routes/*.ts`.
- Produces: `export const v1Routes`, mounted by `app.route("/v1", v1Routes)`.
- Preserves: `export type AppType = typeof app`, `GET /health`, and all current unversioned route paths.
- Defers: mobile auth URL migration and legacy-alias removal to `AUTH-01`; error standardization to `API-02`.

- [ ] **Step 1: Establish the isolated baseline**

Run from `C:\Let-you-cook_React-native\.worktrees\mvp-api-contract`:

```powershell
npm.cmd ci
npm.cmd --prefix server ci
npm.cmd run server:check
npm.cmd run server:test
npm.cmd run check
npm.cmd test -- --runInBand
git status --short --branch
```

Expected: dependency installation succeeds; server type-check passes; all backend tests pass with no skip while the documented local PostgreSQL service is healthy; root lint/type-check passes; all native-focused Jest suites pass; status is clean on `codex/mvp-api-contract`. If PostgreSQL is unavailable, start only the documented local services with `npm.cmd run dev:services:up`, then rerun `npm.cmd run server:test`; do not accept a skipped database smoke test as passing evidence.

- [ ] **Step 2: Write focused failing routing tests**

Extend `server/src/app.test.ts` with route assertions equivalent to:

```ts
test("GET /health stays unversioned", async () => {
  const healthResponse = await app.request("/health");
  const versionedHealthResponse = await app.request("/v1/health");

  assert.equal(healthResponse.status, 200);
  assert.deepEqual(await healthResponse.json(), { ok: true });
  assert.equal(versionedHealthResponse.status, 404);
});

test("all existing application route families are mounted under /v1", async () => {
  const cases: ReadonlyArray<{
    path: string;
    method: "GET" | "POST";
    expectedStatus: number;
  }> = [
    { path: "/v1/auth/login", method: "POST", expectedStatus: 400 },
    { path: "/v1/profiles/me", method: "GET", expectedStatus: 401 },
    { path: "/v1/recipes", method: "GET", expectedStatus: 200 },
    { path: "/v1/images/upload-url", method: "POST", expectedStatus: 501 },
    { path: "/v1/favourites", method: "GET", expectedStatus: 200 },
    { path: "/v1/reports", method: "POST", expectedStatus: 501 },
    { path: "/v1/blocks", method: "POST", expectedStatus: 501 },
  ];

  for (const routeCase of cases) {
    const response = await app.request(routeCase.path, {
      method: routeCase.method,
      headers: { "content-type": "application/json" },
      body: routeCase.method === "POST" ? "{}" : undefined,
    });

    assert.equal(
      response.status,
      routeCase.expectedStatus,
      `${routeCase.method} ${routeCase.path}`,
    );
  }
});

test("legacy application routes remain available during migration", async () => {
  const recipesResponse = await app.request("/recipes");
  const loginResponse = await app.request("/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });

  assert.equal(recipesResponse.status, 200);
  assert.equal(loginResponse.status, 400);
});
```

The auth request intentionally uses an invalid empty body so validation returns before any database access. The profile request intentionally omits authorization so middleware returns before any database access.

- [ ] **Step 3: Run the focused test and capture RED**

Run:

```powershell
npm.cmd --prefix server exec -- tsx --env-file=.env --test src/app.test.ts
```

Expected: FAIL because `/v1/auth/login`, `/v1/profiles/me`, `/v1/recipes`, `/v1/images/upload-url`, `/v1/favourites`, `/v1/reports`, and `/v1/blocks` currently return `404`. Confirm `/health` and the legacy-route assertions already pass; do not weaken expected statuses to make RED pass.

- [ ] **Step 4: Add the minimal composed `/v1` router**

Create `server/src/routes/v1.ts`:

```ts
import { Hono } from "hono";

import { authRoutes } from "./auth";
import { blockRoutes } from "./blocks";
import { favouriteRoutes } from "./favourites";
import { imageRoutes } from "./images";
import { profileRoutes } from "./profiles";
import { recipeRoutes } from "./recipes";
import { reportRoutes } from "./reports";

export const v1Routes = new Hono()
  .route("/auth", authRoutes)
  .route("/profiles", profileRoutes)
  .route("/recipes", recipeRoutes)
  .route("/images", imageRoutes)
  .route("/favourites", favouriteRoutes)
  .route("/reports", reportRoutes)
  .route("/blocks", blockRoutes);
```

Modify `server/src/app.ts` to import `v1Routes` and mount it immediately after `/health`, before the compatibility aliases:

```ts
import { v1Routes } from "./routes/v1";

export const app = new Hono()
  .get("/health", (c) => c.json({ ok: true }, 200))
  .route("/v1", v1Routes)
  .route("/auth", authRoutes)
  .route("/profiles", profileRoutes)
  .route("/recipes", recipeRoutes)
  .route("/images", imageRoutes)
  .route("/favourites", favouriteRoutes)
  .route("/reports", reportRoutes)
  .route("/blocks", blockRoutes);
```

Do not add a `/v1/health` handler, rewrite route response payloads, or edit any mobile path.

- [ ] **Step 5: Run GREEN and the complete automated regression gates**

Run:

```powershell
npm.cmd --prefix server exec -- tsx --env-file=.env --test src/app.test.ts
npm.cmd run server:check
npm.cmd run server:test
npm.cmd run check
npm.cmd test -- --runInBand
```

Expected: focused routing tests pass; server type-check passes; all backend tests pass with no failures or skips; root lint/type-check passes; all native-focused Jest suites pass. No Expo web or Android build is required because the mobile URLs and rendered app are unchanged.

- [ ] **Step 6: Record the contract boundary and verification**

Update `docs/progress.md`:

- set the current branch to `codex/mvp-api-contract`;
- record the canonical `/v1` mount and unversioned-only `/health`;
- state that legacy aliases remain only to protect current callers until `AUTH-01`;
- record the exact focused RED reason and GREEN/full-gate counts;
- change the next action to `API-02` only after review passes.

Update `server/docs/progress.md` with the same backend facts and exact verification commands. Update `docs/mvp-roadmap.md` from `- [ ] API-01` to `- [x] API-01` only after the implementation report and task review are clean. Do not mark `AUTH-01`, `API-02`, or any later task complete.

- [ ] **Step 7: Review, commit, and prepare the next task**

Run:

```powershell
git diff --check
git status --short
git diff -- server/src/routes/v1.ts server/src/app.ts server/src/app.test.ts docs/progress.md server/docs/progress.md docs/mvp-roadmap.md
git add server/src/routes/v1.ts server/src/app.ts server/src/app.test.ts docs/progress.md server/docs/progress.md docs/mvp-roadmap.md
git commit -m "API-01: Introduce versioned application routes"
git status --short --branch
```

Expected: the diff contains only `API-01` routing, tests, and documentation; commit succeeds with the stable task prefix; worktree is clean. Use the required SDD task reviewer and broad branch reviewer before integration. The next implementation plan must start at `API-02`; do not begin it inside this task.

## Exit Gate

- `GET /health` returns `200` with `{ "ok": true }`.
- `GET /v1/health` returns `404`.
- Every existing application route family resolves under `/v1` with its unchanged behavior.
- Existing unversioned routes still resolve as compatibility aliases.
- `AppType` still exports from the composed root app.
- No mobile URL, DTO, error-envelope, database schema, or migration changed.
- Focused routing tests, backend type-check/tests, root check, and native-focused Jest all pass.
- `API-01` documentation is current, the branch is reviewed, and the worktree is clean.

