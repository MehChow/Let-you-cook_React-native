# Codex Workflow Optimization Design

## Goal

Replace the whole-MVP, mandatory-subagent execution loop with bounded Goal
tasks that preserve verification quality while reducing duplicated context,
planning, review, worktree, and full-suite costs.

## Problems Being Corrected

- The existing Goal owns every remaining roadmap task and cannot reach a useful
  context boundary until the entire MVP is complete.
- Subagent-driven implementation and two-stage review are mandatory even for
  small sequential changes.
- The live progress block contains hundreds of lines of historical execution
  detail, forcing every new task to reread stale intermediate states.
- The resume handoff creates a branch for one roadmap item even though the
  roadmap and `AGENTS.md` define one branch per feature track.
- Approved product and architecture decisions are repeatedly converted into
  new design, plan, ledger, review, and merged-verification artifacts.

## Operating Model

Git and repository documentation are the durable supervisor. A feature track
uses one branch and worktree, while two to five tightly related roadmap items
form one bounded Goal task. Sequential Goals may reuse that track worktree, but
only one task may write to it at a time.

Implementation stays inline by default. Subagents require explicit
authorization in the current user prompt and are limited to at most two
independent, primarily read-only investigations. Independent code review uses a
fresh top-level task after the feature track is complete rather than a
per-roadmap-item implementer/reviewer loop.

## Planning and Verification

Approved roadmap and specification text counts as an existing design. Create
at most one bounded implementation plan when the Goal contains unresolved
cross-layer work; do not create a new design and plan for every task ID.

Use focused RED/GREEN tests during each task. Run the relevant broader checks
at a bounded-Goal handoff and the complete required gates at the feature-track
exit. After an exact fast-forward merge, verify commit and tree identity; rerun
the complete suite only if the reviewed tree changed.

## Durable Documents

- `AGENTS.md` owns the stable Goal, delegation, branch, and verification rules.
- `docs/progress.md` is a compact current-state and resume record.
- `server/docs/progress.md` is a compact backend supplement, not a second log.
- `docs/mvp-roadmap.md` remains the static dependency/task index.
- `docs/mvp-goal-prompt.md` explains the bounded-Goal workflow.
- `docs/current-goal.md` is the standalone prompt for the next Goal task.
- Historical handoffs, task ledgers, and Git history retain prior evidence.

## Initial Auth Decomposition

Use `codex/mvp-auth-account` for the entire Auth track:

1. `AUTH-01` through `AUTH-03`: API migration and real login, Sol Medium.
2. `AUTH-04` through `AUTH-06`: session lifecycle, Sol High.
3. `AUTH-07` through `AUTH-09`: email verification and reset, Sol High.
4. `AUTH-10` through `AUTH-11`: deletion and security hardening, Sol High.
5. Fresh Sol High task: read-only-first whole-track review, then authorized
   fixes and exit verification.

No permanent AI supervisor is introduced.

## Success Criteria

- A new task can establish the exact resume point from the first screenful of
  `docs/progress.md`.
- The reusable Goal documentation cannot accidentally start a whole-MVP Goal.
- The next Auth Goal is directly reusable in a new Codex task.
- Branch ownership and task boundaries no longer conflict.
- Routine execution no longer mandates subagents or per-task independent
  review.
