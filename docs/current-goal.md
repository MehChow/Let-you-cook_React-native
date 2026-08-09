# Current Goal: Complete Authentication Native Exit Evidence

Use this document as the complete prompt in a new top-level Codex Goal-mode
task with Sol High.

## Outcome

Complete the remaining Android-native evidence for the independently reviewed
`AUTH-01` through `AUTH-11` track. Resolve only confirmed native Auth defects,
then close and integrate the Auth track if every currently reachable native
check passes.

Stop after the Auth exit checkpoint is integrated into `dev` and a fresh
Recipe Data Goal beginning at `DATA-01` is recorded. Do not execute Recipe Data
or begin Profile UI.

## Verified Starting State

- Workspace: `C:\Let-you-cook_React-native`
- Integration branch: `dev`
- Feature branch: `codex/mvp-auth-account`
- Preserved worktree:
  `C:\Let-you-cook_React-native\.worktrees\mvp-auth-account`
- The independent Auth review is complete. Its five confirmed findings were
  fixed and re-reviewed in these checkpoints:
  - `90c5a84` - authoritative validated mobile session rotation;
  - `8abdcad` - refresh-token families, constraints/indexes, and family-scoped
    reuse revocation;
  - `14bd4bd` - bounded/expiring in-memory Auth rate-limit buckets;
  - `11d91d1` - account-first password-reset/deletion lock ordering.
- Fresh automated exit evidence at that checkpoint:
  - `npm.cmd run check`: passed;
  - `npm.cmd test -- --runInBand`: 21 suites/122 tests passed;
  - `npm.cmd run server:check`: passed;
  - `npm.cmd run server:test`: 104/104 passed with zero skips;
  - `git diff --check`: passed.
- Migration `server/drizzle/0004_common_krista_starr.sql` applied successfully
  to the guarded local development database.
- A real PostgreSQL/SMTP/Mailpit exit run passed signup/verification,
  unverified-login denial, reset delivery/cooldown/rate limiting, password
  replacement, refresh-family replay isolation, deletion, immediate old-token
  denial, and email reuse. Its uniquely prefixed database and Mailpit records
  were removed and verified at zero.
- Android discovery returned no connected emulator/device, so Auth is not yet
  marked complete and no Recipe Data Goal was created.

Verify refs, clean worktree state, local services, and device availability
instead of assuming this snapshot is still current. Preserve unrelated user
changes in the main checkout.

## Read Before Acting

Read only the context needed for this native exit continuation:

1. `AGENTS.md`
2. The top `Current progress` section of `docs/progress.md`
3. The Auth exit definition in `docs/mvp-roadmap.md`
4. Auth/account sections of `docs/brief.md`
5. `docs/backend-integration/opt-setup.md`
6. `server/docs/progress.md` and `server/docs/backend-token-auth.md`
7. Mobile Auth provider/state/API/storage and the affected Auth screens/tests
8. `docs/notes.md` only if native runtime or styling fails

Do not load Recipe Data plans, AI nutrition, media, Home, Search, or later-track
documents unless a concrete Auth dependency requires it.

## Branch and Scope Rules

- Reuse `codex/mvp-auth-account` and its existing worktree. Do not create a new
  Auth branch or worktree.
- Before any write, verify the feature branch contains current `dev`; fast-
  forward only when refs have not diverged.
- Do not repeat the completed independent code review or redo the five fixes.
- Do not spawn subagents, push, open a pull request, or use Expo web.
- Do not implement visible Profile deletion UI; `PROFILE-06` owns that entry
  point.

## Required Android Evidence

Run `agent-device.cmd devices --platform android` first.

If a target is available, use the native Android app and uniquely prefixed QA
accounts/messages to verify every currently reachable check:

1. Signup stays outside private routes until confirmation, then confirmation
   persists the first session and lands on Home.
2. Resend cooldown and replaced challenge state remain correct across leaving
   the screen and a full app relaunch.
3. Unverified login cannot enter the private route tree.
4. Password-reset completion exits an already live old session.
5. The old password is denied, the replacement password logs in, and the new
   session survives relaunch without replaying a consumed refresh token.
6. If a visible deletion entry point already exists, successful deletion clears
   SecureStore/Auth state, exits private routes, remains signed out after
   relaunch, and both old refresh and still-live access tokens are denied. If
   the entry point is still intentionally absent, record this exact conditional
   check under `PROFILE-06`; do not create the UI or treat its absence as an
   Auth defect.

Use Mailpit only for the uniquely prefixed verification/reset messages and
remove only those messages and exact QA database rows afterward. Never reset a
broad database or mailbox for this Goal.

If native behavior fails, diagnose it systematically, report the exact defect,
and obtain owner confirmation before editing. Add a regression test first,
make one coherent `AUTH-EXIT` commit per confirmed fix, re-review the changed
area, and rerun all affected native evidence.

If no Android target is available again, do not mark Auth complete and do not
create the Recipe Data Goal. Keep the exact checks pending, update progress only
when it adds truthful new evidence, integrate only a verified bounded
checkpoint, and stop at the Auth boundary.

## Verification and Closure

If code changes, run the complete gate before closure:

```powershell
npm.cmd run check
npm.cmd test -- --runInBand
npm.cmd run server:check
npm.cmd run server:test
git diff --check
```

If the verified code tree is unchanged, confirm the recorded automated
checkpoint still matches the branch and run focused checks needed for the
native evidence plus `git diff --check`; do not manufacture redundant evidence.

When and only when all currently reachable native Auth checks pass:

1. Update `docs/progress.md` and `server/docs/progress.md` with the native exit
   evidence and cleanup result.
2. Mark the Auth delivery track complete without changing completed roadmap
   task definitions.
3. Replace this file with one fresh bounded Recipe Data Goal beginning at
   `DATA-01`, derived from `docs/mvp-roadmap.md` and approved contracts.
4. Commit the final `AUTH-EXIT` handoff on `codex/mvp-auth-account`.
5. Fast-forward the verified feature branch into the main `dev` checkout while
   preserving unrelated main-checkout changes.
6. Verify both refs and trees are identical and the next Goal is readable from
   the main checkout.

## Done When

- Every currently reachable Android Auth exit check passes on a native target.
- Any confirmed defect is regression-tested, fixed, re-reviewed, and committed.
- PostgreSQL/Mailpit QA records are removed by exact unique identifiers.
- Auth documentation matches verified truth and the track is marked complete
  only after the native exit requirement passes.
- The Auth worktree is clean and preserved.
- The verified feature branch is fast-forwarded into `dev`; refs and trees are
  identical.
- A fresh Recipe Data Goal is readable from `dev`, but has not been executed.

Stop at this boundary. Do not continue into the next Goal.
