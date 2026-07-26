# Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a reproducible, verified development baseline for PostgreSQL, Mailpit, the Hono server, and the Android Expo app.

**Architecture:** Keep development services in a root Docker Compose file, centralize the mobile API URL in one validated configuration module, and provide guarded reset/seed tooling for disposable local data. Record Android and automated verification in the canonical progress file so subsequent feature branches begin from known evidence.

**Tech Stack:** Node 20.19+, npm, Expo SDK 56, React Native 0.85, Hono, Drizzle, PostgreSQL 17, Docker Compose, Mailpit, Jest, Node test runner, Android emulator.

## Global Constraints

- Work on `codex/mvp-foundation`, created from the integrated `dev` branch.
- Before branch/worktree setup, invoke `superpowers:using-git-worktrees`.
- Before implementation code, invoke `superpowers:test-driven-development`.
- Do not run or test Expo web.
- Use `npm.cmd` from PowerShell when `npm.ps1` is blocked.
- Use `src/app` for Expo Router routes.
- Add a short purpose comment above every declared function touched.
- Tiny anonymous inline/test callbacks do not require comments.
- Local development PostgreSQL, app storage, cache, and Mailpit data may be reset.
- Verify every destructive target is the documented local development resource.
- Use an Android emulator unless a physical device is demonstrably necessary.
- If physical-device evidence is required, pause that task and request a precise user check.
- Commit each completed subtask separately using its stable task ID.
- Update `docs/progress.md` and `server/docs/progress.md` when their state changes.

---

## Planned File Map

- `compose.dev.yaml` — reproducible local PostgreSQL and Mailpit services.
- `.env.example` — mobile API URL and local UI-development flags.
- `server/.env.example` — database, JWT, SMTP, and server configuration.
- `package.json` — root service and development-data command wrappers.
- `server/package.json` — backend reset/seed command.
- `src/config/env.ts` — validated Android-first API URL configuration.
- `src/lib/apiClientCore.ts` — shared authenticated requests consuming app config.
- `src/features/auth/api.ts` — auth requests consuming the same app config.
- `__tests__/env-config.test.ts` — pure mobile environment validation coverage.
- `server/src/db/devData.ts` — guarded development reset and seed operations.
- `server/src/db/resetDev.ts` — executable reset-and-seed entry point.
- `server/src/db/devData.test.ts` — development-database safety guard coverage.
- `docs/verification/foundation-android-smoke.md` — committed emulator route evidence.
- `README.md` and `server/README.md` — fresh-clone and service instructions.
- `docs/progress.md` — canonical active task and verification state.
- `server/docs/progress.md` — backend-specific baseline evidence.

### Task 1: `BASE-01` Establish Dependency and Automated-Test Baseline

**Files:**
- Modify: `docs/progress.md`
- Modify: `server/docs/progress.md`

**Interfaces:**
- Consumes: root and `server/` lockfiles, Node 20.19+, existing test scripts.
- Produces: installed dependency trees and recorded baseline command evidence.

- [ ] **Step 1: Verify the execution context**

Run:

```powershell
git status --short --branch
git branch --show-current
node --version
npm.cmd --version
```

Expected:

- branch is `codex/mvp-foundation`;
- worktree has no unrelated modifications;
- Node reports `v20.19.0` or newer;
- npm reports a valid version.

- [ ] **Step 2: Install exact locked dependencies**

Run:

```powershell
npm.cmd ci
npm.cmd --prefix server ci
```

Expected: both commands exit `0`; `postinstall` applies the tracked patch without
reject files.

- [ ] **Step 3: Prepare the ignored local server environment**

If `server/.env` does not exist, create it with `apply_patch` using:

```dotenv
DATABASE_URL=postgres://postgres:postgres@localhost:5432/letyoucook
JWT_SECRET=local-development-secret
PORT=8787
```

Expected: `server/.env` exists, remains ignored by Git, and targets only
`localhost:5432/letyoucook`. Preserve an existing local file.

- [ ] **Step 4: Run the mobile automated baseline**

Run:

```powershell
npm.cmd run check
npm.cmd test -- --runInBand
```

Expected: lint, TypeScript, and every root Jest test pass. If a command fails,
invoke `superpowers:systematic-debugging`, preserve the exact output, and fix the
root cause before marking `BASE-01` complete.

- [ ] **Step 5: Run the backend automated baseline**

Run:

```powershell
npm.cmd run server:check
npm.cmd run server:test
```

Expected: TypeScript and backend tests pass. A database smoke test may explicitly
skip only when PostgreSQL is not running; `BASE-02` removes that skip condition.

- [ ] **Step 6: Record exact verification evidence**

In the top `Current progress` section of `docs/progress.md`, record:

- active branch and task ID;
- installed Node/npm versions;
- each command and exit result;
- test counts reported by the runners;
- any database smoke test that skipped.

Add a dated entry to `server/docs/progress.md` containing the backend check/test
result. Do not convert a skipped smoke test into a passing database claim.

- [ ] **Step 7: Commit the verified baseline**

Run:

```powershell
git add docs/progress.md server/docs/progress.md
git commit -m "BASE-01: Establish verified dependency baseline"
```

Expected: one commit containing only baseline evidence.

### Task 2: `BASE-02` Add PostgreSQL and Mailpit Docker Compose Services

**Files:**
- Create: `compose.dev.yaml`
- Modify: `package.json`
- Modify: `.env.example`
- Modify: `server/.env.example`
- Modify: `README.md`
- Modify: `server/README.md`
- Modify: `docs/progress.md`
- Modify: `server/docs/progress.md`

**Interfaces:**
- Consumes: PostgreSQL URL `postgres://postgres:postgres@localhost:5432/letyoucook`.
- Produces: containers `letyoucook-postgres` and `letyoucook-mailpit`; SMTP at
  `localhost:1025`; Mailpit inspection UI/API at `localhost:8025`.

- [ ] **Step 1: Add the development Compose definition**

Create `compose.dev.yaml`:

```yaml
name: letyoucook-dev

services:
  postgres:
    image: postgres:17-alpine
    container_name: letyoucook-postgres
    environment:
      POSTGRES_DB: letyoucook
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d letyoucook"]
      interval: 3s
      timeout: 3s
      retries: 20
    volumes:
      - letyoucook-postgres-data:/var/lib/postgresql/data

  mailpit:
    image: axllent/mailpit:v1.30.0
    container_name: letyoucook-mailpit
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  letyoucook-postgres-data:
```

- [ ] **Step 2: Validate the Compose structure before startup**

Run:

```powershell
docker compose -f compose.dev.yaml config
```

Expected: exit `0`, both services present, and the named volume resolved.

- [ ] **Step 3: Add root service commands**

Add these scripts to root `package.json`:

```json
{
  "dev:services:up": "docker compose -f compose.dev.yaml up -d",
  "dev:services:down": "docker compose -f compose.dev.yaml down",
  "dev:services:logs": "docker compose -f compose.dev.yaml logs --tail=100",
  "dev:services:reset": "docker compose -f compose.dev.yaml down -v"
}
```

Keep the existing scripts unchanged.

- [ ] **Step 4: Document local mobile and SMTP configuration**

Add to `.env.example`:

```dotenv
EXPO_PUBLIC_API_URL=http://10.0.2.2:8787
```

Add to `server/.env.example`:

```dotenv
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=Let You Cook <no-reply@letyoucook.local>
```

Mailpit is development-only; do not add credentials.

- [ ] **Step 5: Synchronize ignored local development values**

If root `.env` does not exist, create it with `apply_patch`:

```dotenv
EXPO_PUBLIC_API_URL=http://10.0.2.2:8787
```

Use `apply_patch` to add the three `SMTP_*` example values to `server/.env`
without changing its existing database or JWT values. Verify both `.env` files
remain ignored:

```powershell
git check-ignore .env server/.env
```

Expected: Git reports both paths and neither appears in `git status --short`.

- [ ] **Step 6: Start clean services**

The owner has authorized development resets. Verify the command targets
`compose.dev.yaml`, then run:

```powershell
npm.cmd run dev:services:reset
npm.cmd run dev:services:up
docker compose -f compose.dev.yaml ps
```

Expected: PostgreSQL becomes healthy and Mailpit remains running.

- [ ] **Step 7: Verify database and Mailpit reachability**

Run:

```powershell
docker exec letyoucook-postgres pg_isready -U postgres -d letyoucook
Test-NetConnection localhost -Port 1025
Invoke-WebRequest http://localhost:8025 -UseBasicParsing
```

Expected:

- `pg_isready` reports accepting connections;
- SMTP port test reports `TcpTestSucceeded: True`;
- Mailpit HTTP response is successful.

- [ ] **Step 8: Apply migrations and rerun backend tests**

Run:

```powershell
npm.cmd run server:db:migrate
npm.cmd run server:test
```

Expected: migrations succeed and the PostgreSQL auth/profile smoke test runs
instead of skipping.

- [ ] **Step 9: Update setup documentation**

Update root `README.md` to:

- list Docker Desktop/Engine and Android emulator requirements;
- use `npm.cmd ci` and `npm.cmd --prefix server ci`;
- copy both example environment files;
- start services with `npm.cmd run dev:services:up`;
- identify Mailpit SMTP/UI ports;
- explain `10.0.2.2` for the Android emulator and a LAN URL for physical devices;
- document the authorized destructive reset command.

Update `server/README.md` with the Compose service commands and Mailpit details.

- [ ] **Step 10: Record service verification**

Mark `BASE-02` complete in `docs/progress.md` with Compose, migration, and test
evidence. Add the migration/database smoke result to `server/docs/progress.md`.

- [ ] **Step 11: Commit local services**

Run:

```powershell
git add compose.dev.yaml package.json .env.example server/.env.example README.md server/README.md docs/progress.md server/docs/progress.md
git commit -m "BASE-02: Add local Postgres and Mailpit services"
```

Expected: one independently revertible services commit.

### Task 3: `BASE-03` Record the Android Route Smoke Baseline

**Files:**
- Create: `docs/verification/foundation-android-smoke.md`
- Modify: `docs/progress.md`

**Interfaces:**
- Consumes: running local services/server, Expo development client, existing
  demo login (`gg@gmail.com` / `coffee123`), current routes under `src/app`.
- Produces: emulator evidence for every existing navigation surface.

- [ ] **Step 1: Invoke the Android automation guidance**

Read and apply the `agent-device` skill before navigating the emulator. Do not
open or compile the Expo app for web.

- [ ] **Step 2: Start the local backend**

Run in a persistent terminal:

```powershell
npm.cmd run server:dev
```

Expected: Hono listens on port `8787`; `GET /health` returns `200`.

- [ ] **Step 3: Build and launch the Android development client**

Run in another persistent terminal:

```powershell
npm.cmd run android
```

Expected: native build/install succeeds and the login route appears without a
blank screen or fatal native error.

- [ ] **Step 4: Verify authentication routes**

Use the Android emulator and record pass/fail evidence for:

- `/auth/login`;
- `/auth/create-account`;
- `/auth/forgot-password`;
- `/auth/email-otp`;
- `/auth/create-new-password`;
- back navigation and keyboard dismissal on each form.

Expected: every route renders and returns to its expected predecessor.

- [ ] **Step 5: Verify protected routes and tabs**

Use `gg@gmail.com` / `coffee123` for the existing local demo login, then verify:

- Home;
- Search and Filters;
- Add Recipe wizard and Preview;
- Favourites grid/list;
- Profile;
- Recipe Detail and Reviews;
- tab switching, back behavior, and logout.

Expected: every route renders without crash, blank safe-area layout, or broken
navigation.

- [ ] **Step 6: Create the smoke evidence report**

Create `docs/verification/foundation-android-smoke.md` containing:

- tested Git commit;
- emulator name and Android API version;
- build command/result;
- one pass/fail row for every route above;
- any console/native errors;
- screenshots or local artifact paths for failures;
- a clear overall result.

Commit only observed results; do not mark an untested route as passing.

- [ ] **Step 7: Handle native failures rigorously**

If any route fails, invoke `superpowers:systematic-debugging`, inspect
`docs/notes.md`, reproduce the failure, and add the smallest tested fix to this
task before completion.

If an emulator cannot provide adequate evidence and a physical device is
required, record the exact user verification request in `docs/progress.md` and
pause `BASE-03`.

- [ ] **Step 8: Commit the Android baseline**

Run:

```powershell
git add docs/verification/foundation-android-smoke.md docs/progress.md
git commit -m "BASE-03: Record Android route smoke baseline"
```

Expected: evidence and any necessary tested native fix are committed together.

### Task 4: `BASE-04` Centralize Android API-Host Configuration

**Files:**
- Create: `src/config/env.ts`
- Create: `__tests__/env-config.test.ts`
- Modify: `src/lib/apiClientCore.ts`
- Modify: `src/features/auth/api.ts`
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `docs/progress.md`

**Interfaces:**
- Consumes: optional `EXPO_PUBLIC_API_URL`.
- Produces: `getApiBaseUrl(value?: string): string` and
  `appEnv.apiBaseUrl: string`.

- [ ] **Step 1: Write failing environment tests**

Create `__tests__/env-config.test.ts`:

```ts
import { getApiBaseUrl } from "@/config/env";

describe("getApiBaseUrl", () => {
  test("uses the Android emulator host by default", () => {
    expect(getApiBaseUrl(undefined)).toBe("http://10.0.2.2:8787");
  });

  test("trims whitespace and trailing slashes", () => {
    expect(getApiBaseUrl(" http://192.168.1.10:8787/// ")).toBe(
      "http://192.168.1.10:8787",
    );
  });

  test("rejects unsupported protocols", () => {
    expect(() => getApiBaseUrl("ftp://localhost:8787")).toThrow(
      "EXPO_PUBLIC_API_URL must use http or https",
    );
  });

  test("rejects malformed URLs", () => {
    expect(() => getApiBaseUrl("not-a-url")).toThrow(
      "EXPO_PUBLIC_API_URL must be a valid absolute URL",
    );
  });
});
```

- [ ] **Step 2: Run the tests and confirm the missing module failure**

Run:

```powershell
npm.cmd test -- --runInBand __tests__/env-config.test.ts
```

Expected: FAIL because `src/config/env.ts` does not exist.

- [ ] **Step 3: Implement the validated configuration module**

Create `src/config/env.ts`:

```ts
const DEFAULT_ANDROID_API_URL = "http://10.0.2.2:8787";

// Resolves and validates the backend URL used by mobile requests.
export const getApiBaseUrl = (value: string | undefined): string => {
  const candidate = value?.trim() || DEFAULT_ANDROID_API_URL;
  let parsed: URL;

  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("EXPO_PUBLIC_API_URL must be a valid absolute URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("EXPO_PUBLIC_API_URL must use http or https");
  }

  return candidate.replace(/\/+$/, "");
};

export const appEnv = Object.freeze({
  apiBaseUrl: getApiBaseUrl(process.env.EXPO_PUBLIC_API_URL),
});
```

- [ ] **Step 4: Run the focused tests**

Run:

```powershell
npm.cmd test -- --runInBand __tests__/env-config.test.ts
```

Expected: four tests pass.

- [ ] **Step 5: Make both API clients consume one configuration**

In `src/lib/apiClientCore.ts`:

- import `appEnv` from `@/config/env`;
- replace its local `API_BASE_URL` with `appEnv.apiBaseUrl`;
- add these comments directly above the touched functions:

```ts
// Builds an absolute pathname for authentication route classification.
// Adds the current access token to outgoing request headers.
// Creates an authenticated client with single-flight token refresh.
// Rotates expired credentials while deduplicating concurrent refresh attempts.
// Sends a request and retries once after successful refresh.
```

Place each comment above `getPathname`, `withBearerToken`, `createApiClient`,
`refreshTokens`, and `request`, respectively.

In `src/features/auth/api.ts`:

- import `appEnv` from `@/config/env`;
- replace its local `API_BASE_URL` with `appEnv.apiBaseUrl`;
- add these comments:

```ts
// Represents a safe authentication failure returned to mobile screens.
// Extracts a safe user-facing message from failed responses.
// Sends JSON and converts failed responses into authentication errors.
// Creates authentication operations against the configured backend URL.
```

Place them above `AuthApiError`, `readErrorMessage`, `postJson`, and
`createAuthApi`.

- [ ] **Step 6: Update the example and host documentation**

Keep this value in `.env.example`:

```dotenv
EXPO_PUBLIC_API_URL=http://10.0.2.2:8787
```

Document in `README.md`:

- `10.0.2.2` reaches the host from the standard Android emulator;
- a physical device needs the development machine's reachable LAN IP;
- production/staging builds must provide an HTTPS URL.

- [ ] **Step 7: Run focused and broad mobile checks**

Run:

```powershell
npm.cmd test -- --runInBand __tests__/env-config.test.ts __tests__/api-client.test.ts __tests__/auth-api.test.ts
npm.cmd run check
npm.cmd test -- --runInBand
```

Expected: all commands pass.

- [ ] **Step 8: Commit centralized environment configuration**

Run:

```powershell
git add src/config/env.ts __tests__/env-config.test.ts src/lib/apiClientCore.ts src/features/auth/api.ts .env.example README.md docs/progress.md
git commit -m "BASE-04: Centralize Android API host configuration"
```

Expected: configuration, tests, docs, and progress are one subtask commit.

### Task 5: `BASE-05` Correct Stale Repository Paths

**Files:**
- Modify: `README.md`
- Modify: `docs/progress.md`

**Interfaces:**
- Consumes: authoritative route root `src/app`.
- Produces: repository documentation with no claim that routes live in root
  `app/`.

- [ ] **Step 1: Reproduce the stale-path documentation finding**

Run:

```powershell
rg -n 'app/.*src/|routes.*app/|in `app/`|/app, /src' README.md AGENTS.md docs server/README.md
```

Expected: root `README.md` reports the known stale `app/` path. Any additional
hit must be inspected rather than replaced mechanically.

- [ ] **Step 2: Correct the repository map**

Replace the root README repository bullet with:

```markdown
- Expo Router routes in `src/app/` and mobile features/components in `src/`;
```

Keep historical plan references unchanged when they already name `src/app`.

- [ ] **Step 3: Verify all active documentation paths**

Run:

```powershell
rg -n 'app/.*src/|routes.*app/|in `app/`|/app, /src' README.md AGENTS.md docs server/README.md
Test-Path src/app
Test-Path app
```

Expected: no active documentation claims root `app/` contains routes;
`src/app` is true and root `app` is false.

- [ ] **Step 4: Record and commit the documentation correction**

Mark `BASE-05` complete in `docs/progress.md`, then run:

```powershell
git add README.md docs/progress.md
git commit -m "BASE-05: Correct Expo Router source paths"
```

Expected: a documentation-only commit.

### Task 6: `BASE-06` Add Guarded Development Reset and Seed Tooling

**Files:**
- Create: `server/src/db/devData.ts`
- Create: `server/src/db/resetDev.ts`
- Create: `server/src/db/devData.test.ts`
- Modify: `server/package.json`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `server/README.md`
- Modify: `docs/progress.md`
- Modify: `server/docs/progress.md`

**Interfaces:**
- Produces:
  - `assertSafeDevelopmentDatabase(databaseUrl: string): void`
  - `resetDevelopmentData(): Promise<void>`
  - `seedDevelopmentData(): Promise<DevelopmentSeedResult>`
  - `resetAndSeedDevelopmentData(): Promise<DevelopmentSeedResult>`
- Seed credentials:
  - verified: `verified@letyoucook.local`
  - unverified: `unverified@letyoucook.local`
  - password: `coffee123`

- [ ] **Step 1: Write failing development-database guard tests**

Create `server/src/db/devData.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { assertSafeDevelopmentDatabase } from "./devData";

test("accepts the documented local development database", () => {
  assert.doesNotThrow(() =>
    assertSafeDevelopmentDatabase(
      "postgres://postgres:postgres@localhost:5432/letyoucook",
    ),
  );
});

test("rejects a remote database host", () => {
  assert.throws(
    () =>
      assertSafeDevelopmentDatabase(
        "postgres://user:secret@db.example.com:5432/letyoucook",
      ),
    /Refusing to reset a non-local database/,
  );
});

test("rejects a different local database name", () => {
  assert.throws(
    () =>
      assertSafeDevelopmentDatabase(
        "postgres://postgres:postgres@localhost:5432/postgres",
      ),
    /Refusing to reset a non-development database/,
  );
});

test("rejects a missing database URL", () => {
  assert.throws(
    () => assertSafeDevelopmentDatabase(""),
    /DATABASE_URL is required for development reset/,
  );
});
```

- [ ] **Step 2: Run the guard tests and confirm the missing module**

Run:

```powershell
npm.cmd --prefix server exec -- tsx --env-file=.env --test src/db/devData.test.ts
```

Expected: FAIL because `devData.ts` does not exist.

- [ ] **Step 3: Implement guarded reset and deterministic account seeds**

Create `server/src/db/devData.ts`:

```ts
import { sql } from "drizzle-orm";

import { hashPassword } from "../auth/password";
import { db } from "./client";
import { profiles, users } from "./schema";

const DEVELOPMENT_DATABASE_NAME = "letyoucook";
const LOCAL_DATABASE_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export const DEVELOPMENT_SEED_PASSWORD = "coffee123";

export interface DevelopmentSeedResult {
  password: string;
  unverifiedEmail: string;
  verifiedEmail: string;
}

// Prevents destructive reset commands from targeting non-development databases.
export const assertSafeDevelopmentDatabase = (databaseUrl: string): void => {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for development reset");
  }

  const parsed = new URL(databaseUrl);
  const databaseName = parsed.pathname.replace(/^\//, "");

  if (!LOCAL_DATABASE_HOSTS.has(parsed.hostname)) {
    throw new Error("Refusing to reset a non-local database");
  }

  if (databaseName !== DEVELOPMENT_DATABASE_NAME) {
    throw new Error("Refusing to reset a non-development database");
  }
};

// Clears every current application table in the local database.
export const resetDevelopmentData = async (): Promise<void> => {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  assertSafeDevelopmentDatabase(databaseUrl);
  await db.execute(sql`
    TRUNCATE TABLE
      blocks,
      reports,
      favourites,
      nutrition,
      steps,
      ingredients,
      recipe_images,
      recipes,
      refresh_tokens,
      profiles,
      users
    RESTART IDENTITY CASCADE
  `);
};

// Seeds verified and unverified accounts for repeatable local testing.
export const seedDevelopmentData = async (): Promise<DevelopmentSeedResult> => {
  assertSafeDevelopmentDatabase(process.env.DATABASE_URL ?? "");
  const passwordHash = await hashPassword(DEVELOPMENT_SEED_PASSWORD);
  const seeds = [
    {
      displayName: "Verified Cook",
      email: "verified@letyoucook.local",
      emailVerifiedAt: new Date(),
    },
    {
      displayName: "Unverified Cook",
      email: "unverified@letyoucook.local",
      emailVerifiedAt: null,
    },
  ];

  for (const seed of seeds) {
    const [user] = await db
      .insert(users)
      .values({
        email: seed.email,
        emailVerifiedAt: seed.emailVerifiedAt,
        passwordHash,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          emailVerifiedAt: seed.emailVerifiedAt,
          passwordHash,
          updatedAt: new Date(),
        },
      })
      .returning({ id: users.id });

    await db
      .insert(profiles)
      .values({ displayName: seed.displayName, userId: user.id })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          displayName: seed.displayName,
          updatedAt: new Date(),
        },
      });
  }

  return {
    password: DEVELOPMENT_SEED_PASSWORD,
    unverifiedEmail: seeds[1].email,
    verifiedEmail: seeds[0].email,
  };
};

// Resets and seeds local data as one development operation.
export const resetAndSeedDevelopmentData =
  async (): Promise<DevelopmentSeedResult> => {
    await resetDevelopmentData();
    return seedDevelopmentData();
  };
```

- [ ] **Step 4: Add the executable reset-and-seed entry point**

Create `server/src/db/resetDev.ts`:

```ts
import { pool } from "./client";
import { resetAndSeedDevelopmentData } from "./devData";

// Resets local data and reports the deterministic development accounts.
const run = async (): Promise<void> => {
  const result = await resetAndSeedDevelopmentData();
  console.info("Development database reset complete.", result);
};

void run()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
```

- [ ] **Step 5: Run the focused safety tests**

Run:

```powershell
npm.cmd --prefix server exec -- tsx --env-file=.env --test src/db/devData.test.ts
```

Expected: four guard tests pass.

- [ ] **Step 6: Add reset command wrappers**

Add to `server/package.json`:

```json
{
  "db:dev:reset": "tsx --env-file=.env src/db/resetDev.ts"
}
```

Add to root `package.json`:

```json
{
  "server:db:dev:reset": "npm --prefix server run db:dev:reset"
}
```

- [ ] **Step 7: Execute the authorized development reset**

Verify `server/.env` points to localhost database `letyoucook`, then run:

```powershell
npm.cmd run server:db:dev:reset
```

Expected: command exits `0` and reports both deterministic accounts without
printing password hashes or tokens.

- [ ] **Step 8: Verify seeded rows**

Run:

```powershell
docker exec letyoucook-postgres psql -U postgres -d letyoucook -c "select email, email_verified_at is not null as verified from users order by email;"
```

Expected: exactly one verified and one unverified development account.

- [ ] **Step 9: Document reset behavior and credentials**

Update both READMEs with:

- the authorized reset command;
- its exact development-only guard;
- the two seed emails and `coffee123` password;
- the fact that later schema tracks must update the seed function;
- a warning that the command destroys local app data.

Record reset/seed and test evidence in both progress files.

- [ ] **Step 10: Run the complete backend and root verification**

Run:

```powershell
npm.cmd run server:check
npm.cmd run server:test
npm.cmd run check
npm.cmd test -- --runInBand
git diff --check
```

Expected: every command passes and the PostgreSQL smoke test runs.

- [ ] **Step 11: Commit development-data tooling**

Run:

```powershell
git add server/src/db/devData.ts server/src/db/resetDev.ts server/src/db/devData.test.ts server/package.json package.json README.md server/README.md docs/progress.md server/docs/progress.md
git commit -m "BASE-06: Add safe development reset and seed tooling"
```

Expected: the foundation branch now has six task-prefixed commits.

## Foundation Exit Review

- [ ] Verify `git log --oneline dev..HEAD` contains `BASE-01` through `BASE-06`.
- [ ] Verify `git status --short` is empty.
- [ ] Run all four standard automated gates again.
- [ ] Reset services and reproduce startup from the documented commands.
- [ ] Verify migrations and seed command from an empty PostgreSQL volume.
- [ ] Verify the Android smoke report references the final branch commit.
- [ ] Update `docs/progress.md` to point to the next `API-01` plan creation task.
- [ ] Invoke `superpowers:requesting-code-review` before integration.
- [ ] Use `superpowers:finishing-a-development-branch` after review passes.
