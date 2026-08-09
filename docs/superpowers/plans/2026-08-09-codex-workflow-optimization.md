# Codex Workflow Optimization Implementation Plan

**Goal:** Install the approved bounded-Goal workflow without changing app or
backend behavior.

**Architecture:** Keep durable operating policy in `AGENTS.md`, current state
in compact progress files, reusable guidance in the MVP Goal workflow, and the
next exact assignment in one standalone current-Goal file.

**Tech Stack:** Markdown, Git, Codex Goal mode.

## Global Constraints

- Documentation-only change; do not modify application or backend code.
- Preserve historical handoffs and task ledgers as evidence.
- Do not use subagents.
- Do not run Expo web.

### Task 1: Install durable execution rules

**Files:**

- Modify: `AGENTS.md`
- Modify: `docs/mvp-goal-prompt.md`

- [x] Add bounded Goal and explicit delegation rules.
- [x] Align branch, review, planning, and verification granularity.
- [x] Remove the whole-MVP and mandatory-subagent execution contract.

### Task 2: Create the next standalone Goal

**Files:**

- Create: `docs/current-goal.md`

- [x] Define `AUTH-01` through `AUTH-03` as the only implementation scope.
- [x] Use `codex/mvp-auth-account` for the complete Auth track.
- [x] Include exact read order, constraints, verification, and stop conditions.

### Task 3: Compress live state

**Files:**

- Modify: `docs/progress.md`
- Modify: `server/docs/progress.md`
- Modify: `README.md`

- [x] Replace historical execution streams with compact current snapshots.
- [x] Point every resume surface to `docs/current-goal.md`.
- [x] Keep prior evidence discoverable through handoffs, ledgers, and Git.

### Task 4: Verify and commit

- [x] Run `git diff --check`.
- [x] Check active docs for stale whole-MVP and mandatory-subagent language.
- [x] Review the complete documentation diff for contradictions.
- [x] Commit as `DOCS: Optimize bounded Goal workflow`.
