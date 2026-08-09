# User-Owned Native QA Design

## Decision

Android emulator and physical-device QA is user-owned and non-blocking for
Codex work. Codex must not operate an emulator or physical device as part of
normal implementation, verification, review, or exit gates.

## Verification Boundary

Codex remains responsible for all applicable automated evidence, including
lint, typechecking, native-focused Jest tests, backend tests, integration tests,
database checks, and diff validation. Expo web remains an invalid substitute
for native behavior.

When an affected flow benefits from native runtime confirmation, Codex must:

1. provide the user with a concise manual Android QA checklist;
2. label the result as `user-owned; not agent-verified` until the user reports
   evidence; and
3. continue or complete the task without waiting for that report unless the
   user's current prompt explicitly makes manual QA a blocking gate.

Codex must not claim that an unperformed native check passed. User-reported
failures become evidence for a focused diagnosis or follow-up fix.

## Repository Changes

- Update `AGENTS.md` so this policy applies to all future tasks.
- Align the active Auth Goal and progress documents with the new completion
  rule.
- Preserve the existing Auth automated, PostgreSQL, SMTP, and Mailpit evidence;
  do not repeat the completed independent review or its five fixes.
- Close Auth at its documented boundary while retaining the native checklist
  as optional user QA. Do not implement Recipe Data or Profile UI.

## Validation

The documentation update is complete when the durable and active instructions
agree that manual Android QA is user-owned and non-blocking, automated gates
remain required, no native pass is claimed, the Auth track is truthfully
closed, and `git diff --check` passes.
