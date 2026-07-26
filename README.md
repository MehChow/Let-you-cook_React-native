# Let You Cook

Let You Cook is an Android-first Expo 56 recipe community: discover and search
visual recipes, save favourites, read structured cooking instructions, review
recipes, and publish through a six-step wizard.

The repository is a monorepo:

- Expo Router routes in `src/app/` and mobile features/components in `src/`;
- Node/Hono/PostgreSQL API in `server/`;
- product and architecture guidance in `docs/`.

Most mobile content is currently mocked. The server has working auth/token
rotation and current-profile endpoints, but only sign-up is wired into the app.
Start with [the current progress](docs/progress.md), not the screenshots or old
task list.

## Requirements

- Node 20.19 or newer
- npm
- Docker Desktop or Docker Engine with Docker Compose
- Android Studio with an Android emulator, or an Android device
- Expo development client toolchain

This project has native modules. Do not use Expo web as a development or test
target.

## Install

```powershell
npm.cmd ci
npm.cmd --prefix server ci
Copy-Item .env.example .env
Copy-Item server\.env.example server\.env
```

Replace `JWT_SECRET` in `server/.env` with a long local secret. The documented
development database URL is:

```text
postgres://postgres:postgres@localhost:5432/letyoucook
```

The root example enables wizard debug shortcuts and disables some wizard Zod
validation. Treat those flags as local UI-development aids, not release
settings.

`EXPO_PUBLIC_API_URL=http://10.0.2.2:8787` lets an Android emulator reach the
API running on the development machine. For a physical device, replace it with
the development machine's reachable LAN URL, such as `http://192.168.1.10:8787`.
Production and staging builds must provide an HTTPS API URL.

## Run

Start the local PostgreSQL and Mailpit services:

```powershell
npm.cmd run dev:services:up
```

PostgreSQL is available at `localhost:5432`. Mailpit is development-only:
SMTP listens at `localhost:1025`, and its inspection UI/API is at
`http://localhost:8025`.

Apply the current database migration:

```powershell
npm.cmd run server:db:migrate
```

### Reset and seed development app data

> **Warning:** `server:db:dev:reset` destroys all local app data in the current
> application tables before reseeding them.

The reset refuses to run unless `server/.env` supplies a `DATABASE_URL` whose
host is exactly `localhost`, `127.0.0.1`, or `::1` and whose database name is
exactly `letyoucook`. Run the guarded reset from the repository root:

```powershell
npm.cmd run server:db:dev:reset
```

It creates these deterministic local accounts:

| State | Email | Password |
| --- | --- | --- |
| Verified | `verified@letyoucook.local` | `coffee123` |
| Unverified | `unverified@letyoucook.local` | `coffee123` |

Later schema tracks must update `server/src/db/devData.ts` so its reset table
list and deterministic seed rows stay aligned with the current schema.

Start the API:

```powershell
npm.cmd run server:dev
```

Start/build the Android app in another terminal:

```powershell
npm.cmd run android
```

After the development client is installed, `npm.cmd start` can start Metro for
normal iterations.

Local development data is disposable. The owner-authorized reset command stops
the services and deletes only the `compose.dev.yaml` service containers and
their named volume:

```powershell
npm.cmd run dev:services:reset
```

## Verify

```powershell
npm.cmd run check
npm.cmd test -- --runInBand
npm.cmd run server:check
npm.cmd run server:test
```

Backend database smoke tests need the local PostgreSQL service. Do not claim a
passing baseline when dependencies or the database prevented the checks from
starting.

## Documentation

- [Product brief](docs/brief.md)
- [Current progress and roadmap](docs/progress.md)
- [Dependency-ordered MVP task index](docs/mvp-roadmap.md)
- [Goal-mode MVP execution brief](docs/mvp-goal-prompt.md)
- [Approved MVP delivery design](docs/superpowers/specs/2026-07-26-mvp-delivery-design.md)
- [API and data model](docs/api-and-data-model.md)
- [AI nutrition feasibility and architecture](docs/ai-nutrition.md)
- [Mobile styling rules](docs/styling.md)
- [Known implementation notes](docs/notes.md)
- [Backend documentation](server/docs/progress.md)
- [Repository agent rules](AGENTS.md)

`docs/upcomoing-task.md` is retained as historical planning input and is
superseded by `docs/progress.md`.
