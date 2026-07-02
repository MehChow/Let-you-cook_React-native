# Backend From Scratch

## Goal

Add one backend service to this repo without moving the current Expo app yet.

Start with:

```text
server/
  package.json
  tsconfig.json
  src/
    index.ts
    app.ts
    routes/
      auth.ts
      profiles.ts
      recipes.ts
      images.ts
      favourites.ts
      reports.ts
      blocks.ts
```

## Step 1: Create The Server Package

Create `server/package.json` with Hono, TypeScript, and a dev runner.

Use Node 20+.

Initial dependencies:

```text
hono
@hono/node-server
zod
@hono/zod-validator
drizzle-orm
pg
```

Initial dev dependencies:

```text
tsx
typescript
drizzle-kit
@types/node
```

## Step 2: Add Hono App Files

`server/src/app.ts` owns the app and route mounting.

```ts
import { Hono } from "hono";

export const app = new Hono()
  .get("/health", (c) => c.json({ ok: true }, 200));

export type AppType = typeof app;
```

`server/src/index.ts` starts Node.

```ts
import { serve } from "@hono/node-server";
import { app } from "./app";

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT ?? 8787),
});
```

## Step 3: Add Scripts

Server scripts:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "check": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  }
}
```

Root scripts can be added later:

```json
{
  "scripts": {
    "server:dev": "npm --prefix server run dev",
    "server:check": "npm --prefix server run check"
  }
}
```

## Step 4: Add Database

Add:

```text
server/src/db/schema.ts
server/src/db/client.ts
server/drizzle.config.ts
```

Start with the core tables from [backend-guidance.md](./backend-guidance.md). Add auth tables before recipe tables because most recipe mutations need `userId`.

## Step 5: Add Auth First

Implement:

```text
POST /auth/signup
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

Use [backend-token-auth.md](./backend-token-auth.md) as the contract.

Do not wire Google or Apple login until email/password works.

## Step 6: Add The Mobile API Layer

After auth works, add app-side API wrappers:

```text
src/features/auth/api.ts
src/features/profile/api.ts
src/features/recipes/api.ts
```

Use TanStack Query hooks above those wrappers. Screens should not call `fetch`, `hc`, or SecureStore directly.

## Step 7: Wire Hono RPC

When the app first needs typed Hono calls, add workspace/type sharing.

Target import:

```ts
import type { AppType } from "@letyoucook/server";
```

Keep the import type-only.

If workspace setup becomes noisy, skip RPC for the first endpoint and use plain `fetch` with Zod parsing. Add RPC once there are enough endpoints for type inference to pay for itself.

## First Endpoint Order

1. `GET /health`
2. `POST /auth/signup`
3. `POST /auth/login`
4. `POST /auth/refresh`
5. `GET /profiles/me`
6. `PATCH /profiles/me`
7. `GET /recipes`
8. `GET /recipes/:id`
9. `POST /recipes`
10. `POST /images/upload-url`

## Checks

Use the smallest checks first:

```text
npm --prefix server run check
npm run check
```

Add API tests after auth and refresh-token rotation exist. Token rotation has enough edge cases to deserve a real check.

## References

- Hono Node.js: https://hono.dev/docs/getting-started/nodejs
- Hono RPC: https://hono.dev/docs/guides/rpc
- Hono validation: https://hono.dev/docs/guides/validation
