# Let You Cook MVP Goal Brief

Use this document as the complete objective after manually enabling Goal mode
and invoking the Superpowers plugin.

## Objective

Deliver the complete Let You Cook Android MVP by implementing every track and
task in `docs/mvp-roadmap.md`, in dependency order, without stopping after
individual tracks.

## Starting State

- Workspace: `C:\Let-you-cook_React-native`
- Approved planning branch: `codex/mvp-roadmap`
- Approved planning commit: `1b394eb`
- The repository is planning-complete, but MVP implementation has not begun.
- Treat the product decisions and delivery design as approved. Do not repeat
  brainstorming for settled decisions.

## Read Before Acting

Read these sources in order:

1. `AGENTS.md`
2. The top `Current progress` section of `docs/progress.md`
3. `docs/mvp-roadmap.md`
4. `docs/superpowers/specs/2026-07-26-mvp-delivery-design.md`
5. `docs/brief.md`
6. `docs/api-and-data-model.md`
7. `docs/ai-nutrition.md`
8. The detailed plan linked for the active track
9. Relevant backend/mobile documentation selected according to `AGENTS.md`

Treat verified code as the current-state truth. Correct progress documentation
when it disagrees with the implementation.

## Product Outcome

Complete tracks 0 through 14 in `docs/mvp-roadmap.md` and deliver a locally
runnable, deployment-ready Android MVP.

The Expo mobile app must use the real Hono/PostgreSQL APIs for every MVP
feature. PostgreSQL, Mailpit, and supporting development services may remain
local through Docker. Cloud and production integrations must remain
provider-neutral and configurable.

## Execution Contract

- First safely integrate the approved planning branch into `dev` if it is not
  already integrated.
- Execute tracks strictly in the dependency order defined by
  `docs/mvp-roadmap.md`.
- For each track without a detailed implementation plan, invoke
  `superpowers:writing-plans`, save the plan under
  `docs/superpowers/plans/`, self-review it, and continue immediately.
- The execution approach is preselected as Subagent-Driven. Use
  `superpowers:subagent-driven-development` with fresh bounded subagents and
  two-stage review. Do not stop to ask for the execution approach again.
- Before feature implementation, use `superpowers:using-git-worktrees`.
- Create the track's documented `codex/mvp-*` branch from the latest integrated
  `dev`.
- Use test-driven development for every feature and bug fix.
- Complete and verify one roadmap subtask at a time.
- Commit every completed subtask separately with its task ID prefix, for
  example: `AUTH-03: Wire mobile login to real API`.
- After a track passes review and verification, use
  `superpowers:finishing-a-development-branch`, integrate it locally into
  `dev`, create the next track branch, and continue.
- Do not push branches or create pull requests unless the owner explicitly
  requests it.
- Preserve unrelated user changes.

## Progress and Continuity

- Keep the fixed `Current progress` section at the top of `docs/progress.md`
  accurate after every meaningful subtask and track.
- Record the active task ID, branch, latest commit, verification evidence,
  blockers, and exact next task.
- Update `server/docs/progress.md` for backend changes.
- Update `docs/mvp-roadmap.md` only when implementation evidence satisfies its
  completion definition.
- Never redo a completed task unless verification proves it is broken.
- Do not stop after producing a plan, completing one track, or giving a status
  report. Move directly to the next executable task.
- If another session must resume the work, this documentation is the handoff.
  The new session must verify the recorded branch and commit before continuing.

## Repository Rules

- Follow `AGENTS.md` as the durable source of repository rules.
- Do not build or test Expo web.
- Use an Android emulator and native-focused tests.
- If a physical Android device is genuinely necessary, record the exact
  requested check, pause only the affected task, and continue independent work
  where possible.
- Local PostgreSQL, Mailpit, app storage, caches, and development fixtures may
  be cleared when useful after verifying the exact local target.
- Add a short purpose comment, roughly ten words, directly above every declared
  function, component, hook, service, middleware, validator, utility, and Hono
  handler/API added or modified. Tiny anonymous inline/test callbacks are
  excluded.
- Only verified users may enter private routes or Home.
- Use Mailpit for local email and a fake sender for tests.
- Keep secrets out of Git and `EXPO_PUBLIC_*` variables.
- Implement R2 through server-owned credentials, signed upload URLs,
  PostgreSQL metadata, validation, and test fakes.
- Implement AI nutrition last and only after its documented launch gate. If the
  evaluation fails, complete the track by recording the no-go result and
  retaining manual nutrition. Do not ship unreliable AI estimation.

## Verification

- Run the smallest focused tests during each subtask.
- At every track exit, run:

```powershell
npm.cmd run check
npm.cmd test -- --runInBand
npm.cmd run server:check
npm.cmd run server:test
```

- Run migration generation/application checks for database changes.
- Verify affected user flows on an Android emulator.
- Do not treat skipped tests, missing dependencies, unavailable services,
  mocked production behavior, or unverified UI as passing evidence.
- Invoke `superpowers:systematic-debugging` for failures.
- Invoke `superpowers:verification-before-completion` before completion claims.
- Invoke `superpowers:requesting-code-review` at every track exit.

## External Blockers

- Never invent credentials, domains, legal decisions, or production approvals.
- Missing production email domains, store accounts, R2 credentials, and
  similar external prerequisites must not stop implementation that can be
  completed with provider interfaces, local services, and test fakes.
- Record external requirements as explicit launch prerequisites.
- Request owner input only when an irreversible product decision or unavoidable
  live validation cannot be safely resolved.
- Keep the goal active and continue other dependency-independent work when
  possible.
- Do not falsely claim that an external integration was live-tested when only
  its fake or contract tests ran.

## Completion Conditions

The goal is complete only when:

1. Every roadmap task has implementation and proportionate verification
   evidence.
2. All track branches have been reviewed and integrated into `dev`.
3. Core MVP screens contain no mock-only data or mutations.
4. Mandatory verification, authentication lifecycle, recipe creation, media,
   profile, Home, Search, favourites, reviews, reports, and blocks work through
   the real local backend.
5. Required automated checks pass.
6. The complete MVP flow is verified on an Android emulator.
7. Deployment configuration and operations documentation are ready without
   committed secrets.
8. AI nutrition has either passed its documented gate and been implemented, or
   has a documented no-go result with manual nutrition retained.
9. `docs/progress.md`, `server/docs/progress.md`, and `docs/mvp-roadmap.md`
   accurately describe the final state.
10. The integrated `dev` worktree is clean.

Do not mark the goal complete merely because usage is low, one track finished,
or progress is temporarily blocked.

## Resume Objective

If a new Goal-mode session must resume interrupted work, use this objective:

> Resume the Let You Cook Android MVP objective from the top `Current progress`
> section of `docs/progress.md`. Read `AGENTS.md`, `docs/mvp-roadmap.md`, the
> approved delivery design, and the active track plan. Verify the recorded
> branch and commit, do not redo completed tasks, then continue through every
> remaining track under this document's original completion conditions.
