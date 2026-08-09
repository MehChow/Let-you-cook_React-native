# Current Goal: Independent Authentication Track Exit Review

Use this document as the complete prompt in a new top-level Codex Goal-mode
task with Sol High.

## Outcome

Independently review the complete `AUTH-01` through `AUTH-11` track, resolve
confirmed findings, and run the Authentication and account-lifecycle exit gate.

The first review pass is strictly read-only. Do not edit code or documentation,
create commits, or reinterpret a finding as approved merely because it looks
straightforward. Present a concise, severity-ordered findings report to the
owner. If findings exist, wait for the owner to confirm which findings belong
to this exit Goal before applying fixes. If no findings exist, say so explicitly
and proceed to the exit gate.

Stop after the Auth track is independently reviewed, its required verification
is complete, its final checkpoint is integrated into `dev`, and a fresh Recipe
Data Goal is recorded. Do not execute that Recipe Data Goal or begin Profile UI.

## Verified Starting State

- Workspace: `C:\Let-you-cook_React-native`
- Integration branch: `dev`
- Feature branch: `codex/mvp-auth-account`
- Preserved worktree:
  `C:\Let-you-cook_React-native\.worktrees\mvp-auth-account`
- Auth implementation code checkpoints:
  - `8347d84` — `AUTH-10: Implement account deletion policy`
  - `8fe1641` — `AUTH-11: Harden authentication operations`
- Completed roadmap range: `BASE-01` through `BASE-06`, `API-01` through
  `API-07`, and `AUTH-01` through `AUTH-11`.
- Latest implementation verification: mobile 21 suites/115 tests; backend
  102/102 tests with zero skips; root and server checks passed.
- Real PostgreSQL and Mailpit verification passed for deletion policy,
  immediate session denial, email reuse, rate-limit responses, and delivery
  control. Temporary QA database and Mailpit records were removed.
- Android discovery returned no connected emulator/device. The exact native
  exit checks remain listed in `docs/progress.md` and are not waived.

Verify current refs, clean worktree state, local services, test counts, and
device availability instead of assuming this snapshot is still current.

## Read Before Reviewing

Read only the context needed to evaluate the Auth track:

1. `AGENTS.md`
2. The top `Current progress` section of `docs/progress.md`
3. The Auth section and exit definition in `docs/mvp-roadmap.md`
4. Auth/account/privacy sections of `docs/brief.md` and
   `docs/api-and-data-model.md`
5. `docs/backend-integration/opt-setup.md`
6. `server/docs/progress.md` and `server/docs/backend-token-auth.md`
7. Auth-related schema and forward migrations
8. Auth middleware, routes, services, email delivery, rate limiting,
   operational logging, request IDs, errors, and PostgreSQL tests
9. Mobile Auth provider, state machine, API operations, token storage,
   invalid-session handling, and Auth screens/tests
10. `compose.dev.yaml` and guarded local PostgreSQL/Mailpit configuration

Do not load AI nutrition, Recipe Data implementation plans, media plans, Home,
Search, or later-track documents unless a concrete Auth dependency requires it.

## Branch and Worktree

Reuse `codex/mvp-auth-account` and its existing worktree. Do not create a
second Auth branch or worktree. Before any post-review fix, verify the feature
branch contains current `dev`; fast-forward it from `dev` only when the refs
have not diverged. Inspect and preserve unrelated user changes in either
checkout.

## Read-Only First-Pass Review

Review the complete Auth implementation and its tests for at least:

- `/v1` request/response contracts, stable error envelopes, request IDs, and
  safe mobile DTO mapping;
- signup, verification, resend replacement/cooldown, login, hydration refresh,
  invalid-session exit, logout, password reset, and account deletion;
- verified-account gating and the guarantee that no unverified or deleted user
  can enter or remain in private routes;
- SecureStore-only credentials, refresh single-flight behavior, rotation/reuse
  revocation, logout failure handling, and deletion cleanup ordering;
- immediate irreversible tombstoning, email reuse, published-content author
  anonymization, private media/profile cleanup, and 24-month resolved
  moderation-evidence retention;
- transaction boundaries, row-lock ordering, uniqueness handling, and tested
  races for signup, OTP replacement/consumption, reset grants, refresh reuse,
  and deletion versus session use;
- non-enumerating responses, purpose-bound challenges/grants, expiry,
  attempts, cooldowns, revocation, and replay resistance;
- scoped HMAC-keyed rate-limit identities, exact boundary/reset behavior,
  positive delta-seconds `Retry-After`, failure isolation, and the documented
  single-process limitation;
- operational logs that retain useful safe classification/request IDs without
  request bodies, raw emails, passwords, OTPs, challenge IDs, grants, tokens,
  signed URLs, provider details, or database exception prose;
- forward-only schema/migration correctness, guarded development database
  commands, no skipped required coverage, and truthful progress/contracts.

Use evidence from code, tests, migration SQL, and focused read-only commands.
Do not make implementation or documentation changes during this pass.

## Finding Gate and Fix Rules

- Report findings first, ordered by severity, with exact file/line evidence,
  impact, and the missing or incorrect invariant.
- Distinguish actionable defects from later-track scope, optional hardening,
  and unavailable native evidence.
- If findings exist, pause for owner confirmation before editing. Apply only
  confirmed Auth-exit findings and add a regression test first for every
  behavior fix.
- Keep fixes on `codex/mvp-auth-account`; use focused TDD and one intentional
  task-ID or `AUTH-EXIT` commit per coherent fix.
- Re-review every changed area against the confirmed finding before closing it.
- Do not spawn subagents, push, open a pull request, or run Expo web.
- Do not implement `DATA-01`, recipe/media behavior, visible Profile deletion
  UI, or unrelated cleanup.

## Exit Verification

After a clean review or confirmed fixes, run focused tests and then the full
required gate from the Auth worktree:

```powershell
npm.cmd run check
npm.cmd test -- --runInBand
npm.cmd run server:check
npm.cmd run server:test
git diff --check
```

Use the guarded local PostgreSQL database for representative end-to-end Auth
state transitions and concurrency. Use Mailpit for verification/reset delivery
and rate-limit behavior, and remove only uniquely identified QA records.

Re-run Android discovery. If an emulator/device is available, verify every
currently reachable pending Auth-screen flow in `docs/progress.md` with the
native app. Never use Expo web. `PROFILE-06` still owns the visible deletion
entry point, so preserve that conditional device check without treating its
intentionally absent UI as an Auth defect. If no target is available, keep each
exact reachable check pending and state that the Auth track cannot pass its
native exit evidence yet; do not mark the track complete or invent substitute
evidence.

## Documentation, Integration, and Next Goal

When and only when the full Auth exit gate passes:

1. Update `docs/progress.md`, `server/docs/progress.md`, and any corrected Auth
   contract documents with the independently verified state.
2. Mark the Auth delivery track complete without changing completed roadmap
   task definitions.
3. Replace this file with one fresh bounded Recipe Data Goal beginning at
   `DATA-01`, derived from `docs/mvp-roadmap.md` and current approved contracts.
4. Commit the final Auth exit-review handoff on `codex/mvp-auth-account`.
5. Fast-forward the verified feature branch into the main `dev` checkout while
   preserving unrelated main-checkout changes.
6. Verify branch refs and trees are identical and the next Goal is readable
   from the main checkout.

If native evidence or a confirmed defect remains unresolved, do not create the
Recipe Data Goal and do not mark Auth complete. Instead, leave this file as an
exact continuation Goal for the remaining Auth exit work, commit only truthful
progress if appropriate, integrate only a verified bounded checkpoint, and
stop at that Auth boundary.

## Done When

- A strict read-only first pass is reported before any fix is made.
- Every confirmed in-scope finding is regression-tested, fixed, re-reviewed,
  and committed.
- All automated, PostgreSQL, Mailpit, and required native exit evidence passes
  with no skipped required coverage.
- Auth documentation and progress match verified implementation truth.
- The Auth track is marked complete only if its full exit definition passes.
- The Auth worktree is clean and preserved.
- The verified feature branch is fast-forwarded into `dev`; both refs and trees
  are identical.
- A fresh next Goal is readable from `dev`, but no Recipe Data or Profile work
  has begun.

Stop at this boundary. Do not continue into the next Goal.
