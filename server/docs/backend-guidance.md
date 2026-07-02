# Backend Stack

## Decision

Use one custom Node.js TypeScript backend service.

```text
Hono
Hono RPC for the private Expo client
PostgreSQL
Drizzle
Zod
TanStack Query
R2
Cloudflare Images
```

## API Shape

Keep the API REST-shaped even when using Hono RPC.

```text
GET    /recipes
GET    /recipes/:id
POST   /recipes
PATCH  /recipes/:id
DELETE /recipes/:id
POST   /recipes/:id/favourite
DELETE /recipes/:id/favourite
```

Use Hono RPC only as the typed private client layer between the Expo app and the backend. Keep route names and request/response bodies readable without relying on RPC-specific knowledge.

## Backend Modules

Start with these route groups:

- `auth`
- `profiles`
- `recipes`
- `images`
- `favourites`
- `reports`
- `blocks`

Keep each group small and split only when the file becomes hard to scan.

## Database

Use PostgreSQL with Drizzle migrations.

Start with these tables:

- `users`
- `profiles`
- `recipes`
- `recipe_images`
- `ingredients`
- `steps`
- `nutrition`
- `favourites`
- `reports`
- `blocks`

Keep Drizzle migrations as the source of truth for schema changes.

## Validation

Use Zod at server boundaries:

- request params
- query params
- JSON bodies
- upload metadata
- auth forms

Reuse schemas for response typing only when it stays simple. Do not build a large shared schema layer before the real API exists.

## Client Integration

Use TanStack Query in the Expo app.

Create small feature API files instead of calling the Hono client directly from screens:

```text
src/features/recipes/api.ts
src/features/profile/api.ts
src/features/auth/api.ts
```

Route files should stay thin. Feature code should own loading, empty, offline, and error states.

## Images

Use R2 for uploads and Cloudflare Images for delivery/transforms.

Use a server-created upload flow:

```text
Expo app -> backend requests upload URL -> R2 upload -> backend stores image record -> app reads Cloudflare Images URL
```

Do not upload directly with permanent credentials from the app.

## Auth

Start with email/password auth using short-lived access tokens and rotating refresh tokens.

Required flows:

- sign up
- sign in
- email verification
- password reset
- secure mobile session storage
- access token refresh
- delete-own-account

Add Google login later. Add Sign in with Apple if any third-party/social login is enabled.

See [backend-token-auth.md](./backend-token-auth.md).

## Guardrails

- Keep one backend service for now.
- Do not add Redis until repeated reads or rate limits need it.
- Do not add external search until PostgreSQL search is not enough.
- Do not add GraphQL, tRPC, NestJS, or microservices for the first backend pass.
- Do not export one giant Hono RPC type forever; split routes by feature early.
- Keep contracts stable enough that an admin page or public client can use normal HTTP routes later.

See [backend-rpc-types.md](./backend-rpc-types.md).

## First Build Order

1. Create backend service skeleton.
2. Add Hono route groups.
3. Add PostgreSQL connection.
4. Add Drizzle migrations.
5. Create core schema.
6. Add Zod validation helpers.
7. Add auth.
8. Add profile read/update.
9. Add recipe CRUD.
10. Add image upload flow.
11. Replace mocked frontend data one feature at a time.

See [backend-from-scratch.md](./backend-from-scratch.md).
