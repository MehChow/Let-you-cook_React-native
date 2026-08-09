# Let You Cook Bounded Goal Workflow

This file defines how to divide the MVP roadmap across Codex Goal tasks. Do not
paste this entire file into Goal mode as a request to complete the whole MVP.
Use the exact standalone assignment in `docs/current-goal.md` instead.

## Durable Coordination

The repository is the supervisor:

- `AGENTS.md` contains durable engineering and Codex execution rules.
- `docs/progress.md` contains the compact current state and exact resume point.
- `docs/mvp-roadmap.md` contains the dependency-ordered task index.
- Approved specs and plans contain settled product and implementation detail.
- Git commits provide implementation and verification history.
- `docs/current-goal.md` contains the next bounded Goal-mode assignment.

Do not create a permanent supervisor task that rereads and delegates the whole
roadmap. Start a fresh task for each coherent outcome and archive it after its
handoff is durable.

## Goal Size

- One Goal normally owns two to five tightly related roadmap task IDs.
- Split sooner when security, concurrency, migrations, destructive data work,
  or an Android validation gate would otherwise dominate the context.
- A Goal must name its task IDs, branch, exclusions, verification, and stop
  condition.
- Completing a bounded Goal means handing off its verified outcome. It does not
  mean completing the overall MVP.

## Branch and Task Topology

- Keep one branch/worktree per feature track as assigned in
  `docs/mvp-roadmap.md`.
- Sequential Goal tasks may reuse the same feature worktree.
- Only one task may write to a worktree at a time.
- Commit each completed roadmap item separately with its stable task ID.
- After every bounded Goal, fast-forward its verified feature branch into
  `dev`, prove the refs/trees match, and ensure the next `docs/current-goal.md`
  is visible from the main checkout before stopping.
- Preserve the feature branch/worktree for the next Goal. Before later writes,
  fast-forward it from `dev` when the refs have not diverged.
- Mark a feature track complete only after its final independent review and
  exit gate.
- Run parallel writer tasks only for dependency-independent feature branches
  with separate worktrees.

## Implementation and Review

- Implement inline by default; subagents are not part of the normal loop.
- A current user prompt must explicitly authorize any delegation.
- Approved roadmap/specification text is an existing design. Do not repeat
  brainstorming for settled decisions.
- Create at most one bounded plan for a Goal when its cross-layer work is not
  already executable from the roadmap, specs, code, and tests.
- Use TDD for behavior changes and fixes.
- Self-review each task ID before committing it.
- At feature-track exit, start a fresh top-level review task. Review first
  without modifying code, then fix confirmed findings and re-review.

## Verification Cadence

- During a task ID: focused RED/GREEN tests and the smallest relevant check.
- At a bounded-Goal handoff: relevant feature suites and affected typechecks.
- Before a bounded Goal stops: fast-forward its verified branch into `dev` and
  prove branch/ref and tree identity without disturbing unrelated user changes.
- At feature-track exit: all commands required by `AGENTS.md`, plus Android
  verification when rendered or native behavior changed.
- Rerun the complete suite after integration only if the verified tree changed.
- Never use Expo web.

## Model Selection

- Sol Medium: default bounded implementation and normal debugging.
- Sol High: authentication security, concurrency, migrations, destructive data
  work, ambiguous architecture, and feature-track review.
- Luna Medium/High: optional clear, repeatable, or read-heavy work when the user
  selects or explicitly authorizes it.

Reasoning effort follows the current Goal's risk, not the overall importance of
the MVP.

## Current Resume Point

The API contract track is complete. Start a new Codex task, select Sol Medium,
enable Goal mode, and use `docs/current-goal.md`. That Goal owns `AUTH-01`
through `AUTH-03` only on `codex/mvp-auth-account`.

Later Auth Goals continue on the same branch in this order:

1. `AUTH-04` through `AUTH-06` — session lifecycle, Sol High.
2. `AUTH-07` through `AUTH-09` — email verification/reset, Sol High.
3. `AUTH-10` through `AUTH-11` — deletion/security hardening, Sol High.
4. Fresh Sol High task — whole-track read-only-first review and exit gate.

After each bounded Goal, update `docs/current-goal.md` to the next exact
assignment, keep the compact progress snapshot current, and fast-forward the
verified checkpoint into `dev` before stopping.
