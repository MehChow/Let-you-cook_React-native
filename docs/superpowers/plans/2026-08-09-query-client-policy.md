# Query Client Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Route typed mobile calls through authenticated, cancellable transport and configure safe query retries.

**Architecture:** The existing auth client remains the only token/refresh owner and becomes fetch-compatible. Hono RPC injects it. TanStack Query owns only query retry scheduling.

**Tech Stack:** Expo SDK 56, TypeScript 6, Hono 4, TanStack Query 5, Jest 29.

## Constraints

- Work only on `codex/mvp-query-client`.
- Follow `docs/superpowers/specs/2026-08-09-query-client-policy-design.md`.
- Do not change routes, session lifecycle, UI error mapping, or server behavior.
- Preserve purpose comments and RED-GREEN-REFACTOR.
- Never run Expo web.

### Task 1: Authenticated cancellable typed transport

**Files:** `src/lib/apiClientCore.ts`, `src/lib/apiClient.ts`,
`src/lib/typedApiClient.ts`, `__tests__/api-client.test.ts`,
`__tests__/typed-api-client.test.ts`

- [ ] Add failing tests for typed bearer injection and cancellation propagation.
- [ ] Run focused RED and record the exact failure.
- [ ] Make `request` fetch-compatible with replayable Request clones.
- [ ] Inject `apiClient.request` into the typed singleton.
- [ ] Run focused GREEN and root type-check.
- [ ] Commit as `API-06: Authenticate and cancel typed requests`.

### Task 2: Conservative TanStack Query defaults

**Files:** `src/lib/queryClient.ts`, `__tests__/query-client.test.ts`

- [ ] Add failing tests for abort, transient HTTP/network, non-transient HTTP,
  retry limit, delay cap, and mutation no-retry defaults.
- [ ] Run focused RED and record the exact failure.
- [ ] Add exported retry/delay predicates and configure the singleton defaults.
- [ ] Run focused GREEN and root type-check.
- [ ] Commit as `API-06: Configure query retry policy`.

### Task 3: Documentation, review, and closure

**Files:** `docs/api-and-data-model.md`, `docs/mvp-roadmap.md`,
`docs/progress.md`, `server/docs/progress.md`,
`.superpowers/sdd/2026-08-09-query-client-policy/progress.md`

- [ ] Record RED/GREEN evidence and the auth/cancellation/retry boundary.
- [ ] Review exact `dev..HEAD`; resolve every Critical/Important finding.
- [ ] Run focused tests, root/server checks, all root/server tests, and diff check.
- [ ] Check API-06 only after all gates pass and commit documentation.
- [ ] Fast-forward merge to `dev`, repeat merged-result gates, and clean up.

## Completion Conditions

API-06 is complete only when a typed protected request obtains its token from
the shared storage-backed transport, cancellation reaches every caller-owned
attempt, only safe transient queries retry under the documented bound,
mutations do not retry, review is clean, all gates pass, and merged verification
is recorded.
