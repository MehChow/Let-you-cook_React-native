# Let You Cook

Let You Cook is an Android-first Expo 56 recipe community: discover and search
visual recipes, save favourites, read structured cooking instructions, review
recipes, and publish through a six-step wizard.

The repository is a monorepo:

- Expo/React Native app in `app/` and `src/`;
- Node/Hono/PostgreSQL API in `server/`;
- product and architecture guidance in `docs/`.

Most mobile content is currently mocked. The server has working auth/token
rotation and current-profile endpoints, but only sign-up is wired into the app.
Start with [the current progress](docs/progress.md), not the screenshots or old
task list.

## Requirements

- Node 20.19 or newer
- npm
- Android Studio/emulator or an Android device
- Expo development client toolchain
- Docker with the local PostgreSQL container `letyoucook-postgres`

This project has native modules. Do not use Expo web as a development or test
target.

## Install

```powershell
npm.cmd install
npm.cmd --prefix server install
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

## Run

Apply the current database migration:

```powershell
npm.cmd run server:db:migrate
```

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
- [API and data model](docs/api-and-data-model.md)
- [AI nutrition feasibility and architecture](docs/ai-nutrition.md)
- [Mobile styling rules](docs/styling.md)
- [Known implementation notes](docs/notes.md)
- [Backend documentation](server/docs/progress.md)
- [Repository agent rules](AGENTS.md)

`docs/upcomoing-task.md` is retained as historical planning input and is
superseded by `docs/progress.md`.
