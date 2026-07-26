# Let You Cook Backend

Hono + PostgreSQL backend for the Let You Cook Expo app.

## Setup

Install server dependencies:

```powershell
npm.cmd --prefix server ci
```

Create `server/.env` from the example:

```powershell
Copy-Item server\.env.example server\.env
```

Default local database:

```text
postgres://postgres:postgres@localhost:5432/letyoucook
```

## Commands

Run the API:

```bash
npm run server:dev
```

This loads `server/.env` automatically.

Type-check:

```bash
npm run server:check
```

Run tests:

```bash
npm run server:test
```

Generate a migration after schema changes:

```bash
npm run server:db:generate
```

Apply migrations:

```bash
npm run server:db:migrate
```

### Reset and seed development app data

> **Warning:** `server:db:dev:reset` destroys all local app data in the current
> application tables before reseeding them.

The reset refuses to run unless `server/.env` supplies a `DATABASE_URL` whose
host is exactly `localhost`, `127.0.0.1`, or `::1` and whose database name is
exactly `letyoucook`. Run it from the repository root:

```powershell
npm.cmd run server:db:dev:reset
```

The deterministic account credentials are:

| State | Email | Password |
| --- | --- | --- |
| Verified | `verified@letyoucook.local` | `coffee123` |
| Unverified | `unverified@letyoucook.local` | `coffee123` |

Later schema tracks must update `src/db/devData.ts` so its reset table list and
deterministic seed rows stay aligned with the current schema.

## Local Postgres

Current local connection:

```text
Host: localhost
Port: 5432
User: postgres
Password: postgres
Database: letyoucook
```

List tables:

```bash
docker exec letyoucook-postgres psql -U postgres -d letyoucook -c "\dt"
```

## Local services

Start PostgreSQL and development-only Mailpit from the repository root:

```powershell
npm.cmd run dev:services:up
```

Mailpit accepts SMTP at `localhost:1025` and exposes its message inspection
UI/API at `http://localhost:8025`; it requires no development credentials.

Useful service commands from the repository root:

```powershell
npm.cmd run dev:services:logs
npm.cmd run dev:services:down
```

The owner-authorized local reset below removes only the Compose development
containers and named volume, so it deletes disposable PostgreSQL data:

```powershell
npm.cmd run dev:services:reset
```

## Structure

```text
server/
  src/
    app.ts
    index.ts
    auth/
    db/
    middleware/
    routes/
  drizzle/
  docs/
```

## Docs

- `../docs/progress.md`: canonical project progress and phased roadmap.
- `../docs/api-and-data-model.md`: target REST/Hono RPC contract and schema.
- `../docs/ai-nutrition.md`: final-phase nutrition analysis design.
- `server/docs/progress.md`: current backend status and next steps.
- `server/docs/backend-from-scratch.md`: original build plan.
- `server/docs/backend-guidance.md`: backend architecture notes.
- `server/docs/backend-token-auth.md`: auth contract.
- `server/docs/backend-rpc-types.md`: Hono RPC/type-sharing notes.
