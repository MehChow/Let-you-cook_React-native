# Mobile Error Mapping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Parse standardized API errors and map all request failures to stable mobile presentation data.

**Architecture:** A pure `src/lib/apiError.ts` boundary owns transport parsing and presentation classification; feature code remains responsible for toast, field, retry, session, and navigation effects.

**Tech Stack:** Expo SDK 56, TypeScript 6, Jest 29.

### Task 1: Implement and prove the reusable mapping

**Files:** `src/lib/apiError.ts`, `__tests__/api-error.test.ts`

- [x] Write failing tests for envelope parsing, malformed fallback, request IDs,
  Retry-After, cancellation, offline, validation, auth, status, and unknown maps.
- [x] Run focused RED and record exact evidence.
- [x] Implement the minimal strict error model/parser/presentation mapper.
- [x] Run focused GREEN, root check, and diff check.
- [x] Commit as `API-07: Map API failures to UI states`.

### Task 2: Document, review, and close

**Files:** `docs/api-and-data-model.md`, `docs/mvp-roadmap.md`,
`docs/progress.md`, `server/docs/progress.md`, and API-07 SDD ledger.

- [x] Record behavior and RED/GREEN evidence.
- [x] Review exact `dev..HEAD` and resolve Critical/Important findings.
- [x] Run focused, full root/server, check, and diff gates.
- [ ] Check API-07, commit closure, merge to `dev`, repeat gates, and clean up.

## Completion Conditions

API-07 is complete only when malformed or hostile inputs cannot leak unsafe
messages, callers receive stable actionable categories and metadata, review is
clean, all gates pass, and the verified merge is recorded.
