# User-Owned Native QA Auth Exit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make manual Android QA user-owned and non-blocking, close the fully automated and backend-verified Auth track without claiming a native pass, and leave a complete Recipe Data handoff without implementing it.

**Architecture:** This is a documentation-only policy and delivery-state change. `AGENTS.md` owns the durable rule; `docs/progress.md` and `server/docs/progress.md` own current truth; `docs/current-goal.md` becomes the next bounded `DATA-01` through `DATA-03` execution contract. Existing Auth code and its completed independent review remain untouched.

**Tech Stack:** Markdown, Git, PowerShell, existing npm verification commands

## Global Constraints

- Codex must not operate an Android emulator or physical device for normal QA.
- Manual Android QA is user-owned and non-blocking unless a current prompt explicitly makes it a gate.
- Automated lint, typecheck, test, integration, database, and diff checks remain required when applicable.
- Never claim an unperformed native check passed; label it `user-owned; not agent-verified`.
- Do not repeat the completed Auth independent review or its five fixes.
- Do not implement Recipe Data or Profile UI in this Goal.
- Preserve the unrelated `.idea` changes in the main `dev` checkout.
- Do not use Expo web, spawn subagents, push, or open a pull request.

---

### Task 1: Adopt the policy and close the Auth boundary

**Files:**
- Modify: `AGENTS.md`
- Modify: `docs/progress.md`
- Modify: `server/docs/progress.md`
- Modify: `docs/current-goal.md`

**Interfaces:**
- Consumes: the approved policy in `docs/superpowers/specs/2026-08-09-user-owned-native-qa-design.md` and completed Auth evidence recorded at `55a3818`.
- Produces: one durable QA rule, one truthful Auth-complete status, and one standalone Recipe Data Goal covering only `DATA-01` through `DATA-03`.

- [ ] **Step 1: Update the durable verification policy**

Replace the emulator/device requirement in `AGENTS.md` with rules that require
applicable automated checks, prohibit Codex-operated emulator/physical-device
QA, keep Expo web invalid, require a concise manual checklist for affected
native flows, label the checklist `user-owned; not agent-verified`, and make it
non-blocking unless the current prompt explicitly says otherwise.

- [ ] **Step 2: Mark Auth complete without claiming native execution**

Update `docs/progress.md` and `server/docs/progress.md` to record:

- `AUTH-01` through `AUTH-11`, the independent review, and all five fixes are complete;
- automated checks and the real PostgreSQL/SMTP/Mailpit exit run passed;
- the Android checklist was not executed by Codex and remains `user-owned; not agent-verified`;
- this checklist is non-blocking under the approved policy;
- the next track is Recipe Data on `codex/mvp-recipe-data`;
- Profile UI remains out of scope.

Keep the exact six-item manual Auth checklist available to the user and keep
`docs/progress.md` below 140 lines.

- [ ] **Step 3: Replace the completed Auth Goal with the next bounded contract**

Rewrite `docs/current-goal.md` as a standalone new-chat prompt for
`DATA-01` through `DATA-03` only:

- add recipe lifecycle/version/publication timestamps;
- add curated categories and ordered development seeds;
- add normalized tags and enforce the five-tag maximum;
- use `codex/mvp-recipe-data` in an isolated worktree created from current `dev`;
- require schema, forward migration, tests, progress updates, task-ID commits,
  bounded review, fast-forward integration, and preservation of unrelated work;
- stop after the verified `DATA-01` through `DATA-03` checkpoint;
- do not begin media, Recipe UI, Profile UI, later Recipe Data tasks, or native QA.

- [ ] **Step 4: Verify documentation consistency**

Run:

```powershell
rg -n "native exit pending|remaining Android-native|Discover an Android target|do not mark Auth complete|reachable native" AGENTS.md docs/current-goal.md docs/progress.md server/docs/progress.md
rg -n "user-owned; not agent-verified|codex/mvp-recipe-data|DATA-01|DATA-03" AGENTS.md docs/current-goal.md docs/progress.md server/docs/progress.md
(Get-Content docs/progress.md).Count
git diff --check
git status --short
```

Expected: the stale-state search returns no matches; the new-state search
finds the durable policy, Auth handoff, and Recipe Data Goal; progress remains
under 140 lines; diff check passes; only intended documentation files are
modified.

- [ ] **Step 5: Prove the verified code tree did not change**

Run:

```powershell
git diff --name-only 55a3818..HEAD
git diff --name-only 55a3818 -- . ':(exclude)AGENTS.md' ':(exclude)docs/**' ':(exclude)server/docs/**'
```

Expected: only policy/design/plan/handoff documentation differs from the full
Auth checkpoint, and no application, backend, migration, test, or package file
differs. Do not rerun the completed independent review or manufacture redundant
automated evidence.

- [ ] **Step 6: Commit the Auth exit handoff**

```powershell
git add -- AGENTS.md docs/current-goal.md docs/progress.md server/docs/progress.md docs/superpowers/plans/2026-08-09-user-owned-native-qa-auth-exit.md
git commit -m "AUTH-EXIT: Adopt user-owned native QA"
```

- [ ] **Step 7: Fast-forward into `dev` and verify identity**

From the main checkout, first confirm its only changes are the preserved `.idea`
files, then run:

```powershell
git merge --ff-only codex/mvp-auth-account
git rev-parse dev
git rev-parse codex/mvp-auth-account
git rev-parse 'dev^{tree}'
git rev-parse 'codex/mvp-auth-account^{tree}'
git status --short
```

Expected: both refs and both trees are identical; the main checkout still has
only its unrelated `.idea` changes; the Auth worktree is clean and preserved.

- [ ] **Step 8: Stop at the boundary**

Return a copy-paste-ready prompt containing the exact contents of
`docs/current-goal.md`. Do not create the Recipe Data branch/worktree and do not
execute any Recipe Data or Profile UI work.
