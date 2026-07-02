# Let You Cook Backend

Hono + PostgreSQL backend for the Let You Cook Expo app.

## Setup

Install server dependencies:

```bash
npm install --prefix server
```

Create `server/.env` from the example:

```bash
cp server/.env.example server/.env
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

- `server/docs/progress.md`: current backend status and next steps.
- `server/docs/backend-from-scratch.md`: original build plan.
- `server/docs/backend-guidance.md`: backend architecture notes.
- `server/docs/backend-token-auth.md`: auth contract.
- `server/docs/backend-rpc-types.md`: Hono RPC/type-sharing notes.
