# Password Reset Resend Cooldown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. The repository requires inline execution; do not dispatch sub-agents.

**Goal:** Replace the hardcoded password-reset resend label with a globally persisted one-minute cooldown, a guarded placeholder API mutation, and success feedback.

**Architecture:** Store one absolute `availableAt` timestamp in MMKV through a thin native adapter. Keep all cooldown calculations in a native-free core module. Route both initial send and resend through one TanStack Query mutation that checks the cooldown before calling the placeholder API and starts the cooldown only after success.

**Tech Stack:** Expo SDK 56, React Native 0.85, TypeScript, TanStack Query 5, react-native-mmkv 4, Jest, Testing Library React Native, sonner-native.

## Global Constraints

- Use the existing auth feature structure under `src/features/auth`.
- Keep native-backed storage out of native-free Jest targets.
- Use absolute timestamps, never persisted decrementing seconds.
- Apply one cooldown for the password-reset purpose across email addresses on the app installation.
- Start or restart the cooldown only after a successful send-code API result.
- Keep the server-side cooldown requirement documented separately; MMKV is not a security control.
- Use existing semantic sage/accent styling and the existing top-centered `Toaster`.
- Follow TDD: write each failing test, run it red, add the minimum implementation, then run it green.
- Do not add a backend implementation or an email provider in this frontend task.

## File Map

- Create `src/lib/queryClient.ts`: one app-level `QueryClient` instance.
- Modify `src/app/_layout.tsx`: provide the query client around the existing app providers.
- Create `src/features/auth/passwordResetCooldownCore.ts`: pure timestamp and storage operations.
- Create `src/features/auth/passwordResetCooldown.ts`: MMKV adapter for the core storage interface.
- Modify `src/features/auth/api.ts`: add the placeholder `sendPasswordResetCode` API method and input type.
- Modify `src/features/auth/AuthProvider.tsx`: delegate the existing auth context method to the API method.
- Create `src/features/auth/useSendPasswordResetCode.ts`: guarded `useMutation` and cooldown state hook.
- Modify `src/features/auth/ForgotPasswordScreen.tsx`: use the mutation for the initial send.
- Modify `src/features/auth/EmailOtpScreen.tsx`: render live cooldown state and trigger resend.
- Modify `__tests__/auth-api.test.ts`: cover the placeholder API boundary.
- Create `__tests__/password-reset-cooldown.test.ts`: cover pure cooldown behavior.
- Create `__tests__/password-reset-send-hook.test.tsx`: cover mutation guards and cooldown writes.
- Modify `__tests__/auth-screens.test.tsx`: cover resend copy, success toast, and blocked resend.

### Task 1: Add app-level TanStack Query provider

**Files:**
- Create: `src/lib/queryClient.ts`
- Modify: `src/app/_layout.tsx`

**Interfaces:**
- Produce `queryClient: QueryClient` for the root provider.

- [ ] **Step 1: Define the provider verification in the hook test**

The provider is exercised by `__tests__/password-reset-send-hook.test.tsx`. That test must render the hook under `QueryClientProvider` with a fresh `QueryClient` and retries disabled. This setup fails until the provider and hook dependencies are present, so no duplicate provider-only test is needed.

- [ ] **Step 2: Implement the query client and root provider**

Create the singleton:

```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();
```

Wrap the existing `AuthProvider` in `QueryClientProvider` without changing the existing splash, router, toaster, or portal behavior.

- [ ] **Step 3: Run the type check**

Run: `npx tsc --noEmit`

Expected: exit code `0`.

### Task 2: Build and test the native-free cooldown core

**Files:**
- Create: `src/features/auth/passwordResetCooldownCore.ts`
- Create: `__tests__/password-reset-cooldown.test.ts`

**Interfaces:**

```ts
export interface CooldownStorage {
  getNumber(key: string): number | undefined;
  set(key: string, value: number): void;
  remove(key: string): void;
}

export const PASSWORD_RESET_COOLDOWN_MS = 60_000;
export const PASSWORD_RESET_COOLDOWN_KEY = "auth.password-reset.available-at";
export function readPasswordResetAvailableAt(storage: CooldownStorage): number | null;
export function getPasswordResetRemainingSeconds(availableAt: number | null, now: number): number;
export function canSendPasswordResetCode(storage: CooldownStorage, now: number): boolean;
export function startPasswordResetCooldown(storage: CooldownStorage, now: number): number;
```

- [ ] **Step 1: Write failing tests**

Cover these exact behaviors:

```ts
it("returns zero when no cooldown is stored");
it("rounds an active cooldown up to the next whole second");
it("allows sending at and after the available timestamp");
it("persists a timestamp exactly sixty seconds after the supplied time");
it("treats stale timestamps as expired");
```

Use an in-memory `CooldownStorage` test double and fixed `now` values.

- [ ] **Step 2: Run the focused test to verify RED**

Run: `npm test -- --runInBand __tests__/password-reset-cooldown.test.ts`

Expected: FAIL because the core module does not exist yet.

- [ ] **Step 3: Implement the minimal pure core**

Read invalid, missing, and expired timestamps as `null`; calculate remaining seconds with `Math.max(0, Math.ceil((availableAt - now) / 1000))`; and write `now + PASSWORD_RESET_COOLDOWN_MS` when starting a cooldown.

- [ ] **Step 4: Run the focused test to verify GREEN**

Run: `npm test -- --runInBand __tests__/password-reset-cooldown.test.ts`

Expected: all cooldown tests pass.

### Task 3: Add the MMKV adapter and placeholder API

**Files:**
- Create: `src/features/auth/passwordResetCooldown.ts`
- Modify: `src/features/auth/api.ts`
- Modify: `src/features/auth/AuthProvider.tsx`
- Modify: `__tests__/auth-api.test.ts`

**Interfaces:**

```ts
export interface PasswordResetCodeInput {
  email: string;
}

sendPasswordResetCode(input: PasswordResetCodeInput): Promise<{ ok: true }>;
```

The adapter must expose the same `CooldownStorage` shape using `createMMKV()` and the feature key from the core module. The API placeholder must validate a trimmed email and resolve `{ ok: true }` without making a network request until the backend endpoint exists.

- [ ] **Step 1: Write the failing API test**

Assert that `createAuthApi(...).sendPasswordResetCode({ email: "cook@example.com" })` accepts the input and returns `{ ok: true }`, and that a blank email rejects with the existing validation message.

- [ ] **Step 2: Run the API test to verify RED**

Run: `npm test -- --runInBand __tests__/auth-api.test.ts`

Expected: FAIL because the method is not present.

- [ ] **Step 3: Implement the API method, provider delegation, and MMKV adapter**

Keep the provider method name stable for existing screens. Delegate it to the API surface so future integration replaces one boundary rather than screen code.

- [ ] **Step 4: Run API and type checks**

Run: `npm test -- --runInBand __tests__/auth-api.test.ts`

Expected: all API tests pass.

Run: `npx tsc --noEmit`

Expected: exit code `0`.

### Task 4: Add the guarded TanStack mutation and cooldown hook

**Files:**
- Create: `src/features/auth/useSendPasswordResetCode.ts`
- Create: `__tests__/password-reset-send-hook.test.tsx`

**Interfaces:**

```ts
export function useSendPasswordResetCode(): {
  sendCode: (email: string) => Promise<void>;
  isSending: boolean;
};

export function usePasswordResetCooldown(): {
  remainingSeconds: number;
  isCoolingDown: boolean;
};
```

The mutation must:

1. Read the persisted timestamp before calling the API.
2. Reject with `Please wait before requesting another code.` while active.
3. Reject concurrent calls through a module-level in-flight guard.
4. Call `useAuth().sendPasswordResetCode` only when allowed.
5. Start the cooldown after success and clear the in-flight guard in `finally`.

The cooldown hook must read MMKV on mount and refresh once per second only while active. It must derive each value from `Date.now()` so reopening or backgrounding does not reset the state.

- [ ] **Step 1: Write failing hook tests**

Cover: active cooldown blocks the API, successful send writes a 60-second timestamp, failed send does not write one, and two concurrent calls produce one API call.

- [ ] **Step 2: Run the hook test to verify RED**

Run: `npm test -- --runInBand __tests__/password-reset-send-hook.test.tsx`

Expected: FAIL because the hook module does not exist.

- [ ] **Step 3: Implement the minimal mutation and hook**

Use `useMutation` from `@tanstack/react-query`; use the shared MMKV adapter only inside the hook module; and make the hook test provide a fresh `QueryClient` with retries disabled.

- [ ] **Step 4: Run the hook test to verify GREEN**

Run: `npm test -- --runInBand __tests__/password-reset-send-hook.test.tsx`

Expected: all hook tests pass.

### Task 5: Wire the forgot-password and verify screens

**Files:**
- Modify: `src/features/auth/ForgotPasswordScreen.tsx`
- Modify: `src/features/auth/EmailOtpScreen.tsx`
- Modify: `__tests__/auth-screens.test.tsx`

**Interfaces:**
- Consume `useSendPasswordResetCode` and `usePasswordResetCooldown` from Task 4.

- [ ] **Step 1: Write failing screen tests**

Assert that the verify screen initially displays `Resend in 01:00` when the persisted timestamp is one minute away, pressing the disabled countdown does not call the mutation, and pressing enabled `Resend code` calls the mutation and shows `toast.success("A new code was sent.")`.

- [ ] **Step 2: Run the screen test to verify RED**

Run: `npm test -- --runInBand __tests__/auth-screens.test.tsx`

Expected: FAIL because the screen still renders hardcoded `Resend in 00:45`.

- [ ] **Step 3: Implement screen wiring**

Replace the fixed text with a `Pressable` secondary action. Format seconds as `MM:SS`, use accent text while cooling down, use sage text when enabled, and retain the current layout and copy. The forgot-password screen should await `sendCode(nextEmail)` before navigating.

- [ ] **Step 4: Run screen tests to verify GREEN**

Run: `npm test -- --runInBand __tests__/auth-screens.test.tsx`

Expected: all auth screen tests pass, including existing error-toast coverage.

### Task 6: Add backend integration guidance and verify the full frontend

**Files:**
- Create: `docs/backend-integration/opt-setup.md`

- [ ] **Step 1: Write the backend helper guideline**

Document the future `POST /auth/password-reset/request` contract, server-authoritative cooldown behavior, normalized email/purpose keying, atomic rate-limit checks, generic responses to avoid account enumeration, suggested `429` metadata, OTP hashing/expiry, and the mobile integration point.

- [ ] **Step 2: Run all focused tests**

Run: `npm test -- --runInBand __tests__/password-reset-cooldown.test.ts __tests__/password-reset-send-hook.test.tsx __tests__/auth-api.test.ts __tests__/auth-screens.test.tsx`

Expected: all selected suites pass with zero failures.

- [ ] **Step 3: Run the full app check**

Run: `npm run check`

Expected: Expo lint and TypeScript complete with exit code `0`.

- [ ] **Step 4: Review the final diff**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors; only the intended feature files are changed in addition to pre-existing user changes.
