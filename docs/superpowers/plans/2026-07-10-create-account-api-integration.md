# Create Account API Integration Implementation Plan

> **For agentic workers:** Execute this plan inline in the current workspace. Do not use sub-agents. Steps use checkbox syntax for tracking.

**Goal:** Replace the create-account mock flow with `POST /auth/signup`, persist the returned server session, and keep frontend/backend password validation aligned.

**Architecture:** Keep the existing Hono signup route, frontend `authApi`, React Query mutation, and SecureStore storage boundaries. The mutation returns the backend `AuthResponse`; `AuthProvider` converts that response into the existing stored-session shape and owns persistence/state updates. No shared folder is added in this pass because the current contract has one frontend consumer and one backend validator with no type-generation setup.

**Tech Stack:** Expo 56, React Native, Expo Router, TanStack Query, SecureStore, Hono, Zod, Jest, Node test runner.

## Global Constraints

- Forgot-password, email delivery, login integration, and refresh-on-hydration are out of scope.
- Preserve the current create-account form, validation messages, toast behavior, and `/private/(tabs)` navigation.
- Do not overwrite unrelated user changes already committed before this task.
- Do not use `useMemo`, `useCallback`, or `React.memo` outside `src/components/ui`.
- Use existing dependencies and existing API/storage wrappers; add no packages.
- Backend password validation must enforce the frontend contract: minimum 8 and maximum 20 characters.

---

### Task 1: Align the backend signup password contract

**Files:**
- Modify: `server/src/routes/auth.ts`
- Create: `server/src/auth/signup-validation.test.ts`

**Interfaces:**
- Produces: `POST /auth/signup` rejects passwords longer than 20 characters before database work, while accepting passwords from 8 through 20 characters.

- [ ] **Step 1: Write the failing route validation test**

Add a Node test that calls the Hono app directly, so no database row is needed for validation failures:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { app } from "../app";

test("signup rejects passwords longer than 20 characters", async () => {
  const response = await app.request("/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "long-password@example.com",
      password: "a".repeat(21),
      displayName: "Long Password",
    }),
  });

  assert.equal(response.status, 400);
});
```

- [ ] **Step 2: Run the test and confirm the failure**

Run:

```text
npx tsx --env-file=server/.env --test server/src/auth/signup-validation.test.ts
```

Expected: FAIL because the current backend schema accepts a 21-character password and reaches database work.

- [ ] **Step 3: Add the backend maximum**

Change the backend auth body schema in `server/src/routes/auth.ts` from:

```ts
password: z.string().min(8),
```

to:

```ts
password: z.string().min(8).max(20),
```

- [ ] **Step 4: Run the focused test and confirm it passes**

Run the same command. Expected: PASS with status `400`.

- [ ] **Step 5: Commit the backend contract change**

```text
git add server/src/routes/auth.ts server/src/auth/signup-validation.test.ts
git commit -m "fix(auth): align signup password limits"
```

### Task 2: Wire the create-account mutation to the real API

**Files:**
- Modify: `src/features/auth/useCreateAccount.ts`
- Modify: `__tests__/create-account-hook.test.tsx`

**Interfaces:**
- Consumes: `SignUpInput` from `src/features/auth/api.ts`.
- Produces: `createAccount(input): Promise<AuthResponse>` backed by `authApi.signUp(input)`.

- [ ] **Step 1: Replace the local-resolution test with an API mutation test**

Mock only the existing `authApi.signUp` boundary and assert that the mutation returns its response:

```ts
jest.mock("@/features/auth/api", () => ({
  authApi: { signUp: jest.fn() },
}));

const response = {
  user: { id: "user-1", email: "mei@example.com" },
  tokens: { accessToken: "access", refreshToken: "refresh" },
};

it("creates an account through the auth API", async () => {
  const { authApi } = jest.requireMock("@/features/auth/api") as {
    authApi: { signUp: jest.Mock };
  };
  authApi.signUp.mockResolvedValueOnce(response);

  const { result } = renderHook(() => useCreateAccount(), {
    wrapper: createWrapper(),
  });

  await act(async () => {
    await expect(result.current.createAccount(input)).resolves.toEqual(response);
  });

  expect(authApi.signUp).toHaveBeenCalledWith(input);
});
```

- [ ] **Step 2: Run the hook test and confirm it fails**

Run:

```text
npx jest __tests__/create-account-hook.test.tsx --runInBand
```

Expected: FAIL because the current mutation resolves `void` without calling `authApi.signUp`.

- [ ] **Step 3: Implement the minimal mutation wrapper**

Use the existing API singleton and return its response:

```ts
import { useMutation } from "@tanstack/react-query";

import { authApi, type SignUpInput } from "./api";

export function useCreateAccount() {
  const mutation = useMutation({ mutationFn: (input: SignUpInput) => authApi.signUp(input) });

  return {
    createAccount: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
}
```

- [ ] **Step 4: Run the hook test and confirm it passes**

Run the same Jest command. Expected: PASS.

- [ ] **Step 5: Commit the mutation change**

```text
git add src/features/auth/useCreateAccount.ts __tests__/create-account-hook.test.tsx
git commit -m "feat(auth): connect account creation API"
```

### Task 3: Establish and persist a real server session

**Files:**
- Modify: `src/features/auth/session.ts`
- Modify: `src/features/auth/AuthProvider.tsx`
- Modify: `__tests__/auth-session.test.ts`

**Interfaces:**
- Consumes: `AuthResponse` from `src/features/auth/api.ts`.
- Produces: `establishSession(response: AuthResponse): Promise<void>` through `useAuth()`.

- [ ] **Step 1: Write the failing pure session test**

Add a test for decoding a JWT expiry and falling back safely:

```ts
import { createAuthSession } from "@/features/auth/session";

const token = [
  "header",
  Buffer.from(JSON.stringify({ exp: 1_700_000_000 })).toString("base64url"),
  "signature",
].join(".");

it("creates a stored session from server auth response", () => {
  expect(
    createAuthSession({
      user: { id: "user-1", email: "mei@example.com" },
      tokens: { accessToken: token, refreshToken: "refresh" },
    }, 1_000),
  ).toEqual({
    user: { id: "user-1", email: "mei@example.com" },
    tokens: { accessToken: token, refreshToken: "refresh" },
    accessTokenExpiresAt: 1_700_000_000_000,
  });
});
```

- [ ] **Step 2: Run the session test and confirm it fails**

Run:

```text
npx jest __tests__/auth-session.test.ts --runInBand
```

Expected: FAIL because `createAuthSession` does not exist.

- [ ] **Step 3: Implement the pure session conversion**

Add `createAuthSession(response: AuthResponse, now = Date.now())` in `session.ts`. Decode only the JWT payload with base64url handling; if decoding fails or `exp` is not finite, use `now + 15 * 60 * 1000`. Keep `createMockAuthSession` for existing login behavior because login integration is explicitly out of scope.

Add `establishSession(response: AuthResponse): Promise<void>` to the provider context. It should call `createAuthSession`, `authTokenStorage.saveSession`, then update React state. Do not change the existing mock `login` implementation in this task.

- [ ] **Step 4: Run the session test and focused type checks**

Run:

```text
npx jest __tests__/auth-session.test.ts --runInBand
npx tsc --noEmit
```

Expected: PASS and no TypeScript errors.

- [ ] **Step 5: Commit the session boundary change**

```text
git add src/features/auth/session.ts src/features/auth/AuthProvider.tsx __tests__/auth-session.test.ts
git commit -m "feat(auth): persist server signup session"
```

### Task 4: Replace mock post-signup login in the screen

**Files:**
- Modify: `src/features/auth/CreateAccountScreen.tsx`
- Modify: `__tests__/auth-screens.test.tsx`

**Interfaces:**
- Consumes: `createAccount(input): Promise<AuthResponse>` and `establishSession(response)` from `useAuth()`.
- Produces: successful signup persists the API response before navigating.

- [ ] **Step 1: Update screen tests to require real session establishment**

Change the mocked auth context to expose `establishSession`, make the mocked account mutation resolve with an `AuthResponse`, and assert:

```ts
expect(mockCreateAccount).toHaveBeenCalledWith({
  displayName: "Mei Lin",
  email: "mei@example.com",
  password: "cook1234",
});
expect(mockEstablishSession).toHaveBeenCalledWith(authResponse);
expect(mockLogin).not.toHaveBeenCalled();
expect(mockReplace).toHaveBeenCalledWith("/private/(tabs)");
```

Add a rejection test asserting the error toast appears and neither `establishSession` nor navigation is called.

- [ ] **Step 2: Run the screen tests and confirm the new expectation fails**

Run:

```text
npx jest __tests__/auth-screens.test.tsx --runInBand
```

Expected: FAIL because the screen currently calls `login()` and the test mutation mock resolves no response.

- [ ] **Step 3: Implement the screen change**

Replace `const { login } = useAuth()` with `const { establishSession } = useAuth()`. Capture the mutation result:

```ts
const response = await createAccount(toSignUpInput(values));
await establishSession(response);
toast.success("Account created.");
router.replace("/private/(tabs)");
```

Do not touch forgot-password handlers or route behavior.

- [ ] **Step 4: Run the screen tests and focused auth tests**

Run:

```text
npx jest __tests__/auth-screens.test.tsx __tests__/auth-api.test.ts __tests__/api-client.test.ts --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit the screen integration**

```text
git add src/features/auth/CreateAccountScreen.tsx __tests__/auth-screens.test.tsx
git commit -m "feat(auth): use server signup session"
```

### Task 5: Verify the complete scoped change

**Files:**
- No source changes expected.

- [ ] **Step 1: Run frontend focused tests**

```text
npm test -- --runInBand __tests__/create-account-schema.test.ts __tests__/create-account-hook.test.tsx __tests__/auth-session.test.ts __tests__/auth-screens.test.tsx __tests__/auth-api.test.ts __tests__/api-client.test.ts
```

Expected: all selected suites pass.

- [ ] **Step 2: Run frontend check**

```text
npm run check
```

Expected: lint and TypeScript checks pass.

- [ ] **Step 3: Run backend checks**

```text
npm run server:check
npm run server:test
```

Expected: backend type-check and tests pass. If `server:test` repeats the known sandbox `tsx` IPC `EPERM` pipe error, report it as an environment limitation and retain the passing direct validation test evidence.

- [ ] **Step 4: Inspect the final diff**

```text
git status --short
git diff HEAD~4 --stat
```

Confirm only the signup integration, backend password-boundary test, plan/spec documents, and their focused tests changed; forgot-password files remain untouched.
```

