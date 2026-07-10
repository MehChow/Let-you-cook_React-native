# Create Account Form Validation Implementation Plan

> **For inline workers:** Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the create-account screen’s placeholder state and no-op submit button with Zod validation, React Hook Form handling, and a local TanStack Query mutation that preserves a clean seam for future backend signup integration.

**Architecture:** Keep the route thin and place the form contract in `src/features/auth/schema.ts`. `CreateAccountScreen` owns form rendering and navigation, while `useCreateAccount` owns the TanStack Query mutation. The mutation is intentionally local and does not call `authApi`, persist tokens, or update the auth session; a later backend task can replace its mutation function without changing the form UI contract.

**Tech Stack:** Expo 56, React Native, React Hook Form, `@hookform/resolvers`, Zod 4, TanStack Query 5, Sonner Native, Jest, Testing Library React Native.

## Global Constraints

- Keep route files thin; modify `src/features/auth/CreateAccountScreen.tsx` for screen composition and behavior.
- Reuse `AuthTextField`, `AuthPrimaryButton`, `AuthShell`, and semantic sage tokens.
- Keep errors in Sonner toasts; do not add inline validation text that shifts the auth layout.
- Use React Hook Form with `mode: "onSubmit"` and `reValidateMode: "onChange"`.
- Name: required after trimming, 1–80 characters.
- Email: required, trimmed, valid, and normalized lowercase before mutation submission.
- Password: 8–20 characters inclusive.
- Confirm password: required and must match password.
- The local mutation must not call `authApi.signUp`, persist tokens, update `AuthProvider`, or claim authentication.
- Local success shows a success toast and navigates to `/auth/login`.
- Preserve unrelated worktree changes, including the existing auth UI asset and route files.
- Do not add backend changes in this frontend-only pass.

---

## File Map

- Create `src/features/auth/schema.ts`: Zod schema, form type, and signup-payload mapper.
- Create `src/features/auth/useCreateAccount.ts`: local TanStack Query mutation.
- Modify `src/features/auth/CreateAccountScreen.tsx`: React Hook Form, controllers, submit state, and toasts.
- Modify `package.json` and `package-lock.json`: add `@hookform/resolvers`.
- Create `__tests__/create-account-schema.test.ts`: pure schema and mapping tests.
- Create `__tests__/create-account-hook.test.tsx`: mutation tests under `QueryClientProvider`.
- Modify `__tests__/auth-screens.test.tsx`: create-account screen behavior tests.

---

### Task 1: Add the resolver dependency and form contract

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/features/auth/schema.ts`
- Create: `__tests__/create-account-schema.test.ts`

**Interfaces:**

- Produce `createAccountSchema`.
- Produce `CreateAccountFormValues = z.infer<typeof createAccountSchema>`.
- Produce `toSignUpInput(values: CreateAccountFormValues): SignUpInput`.

- [ ] **Step 1: Add the resolver dependency**

Run:

```bash
npm install @hookform/resolvers
```

Expected: only the requested resolver dependency and lockfile metadata are added.

- [ ] **Step 2: Write failing schema tests**

Cover:

```ts
it("normalizes valid values", () => {
  const values = createAccountSchema.parse({
    name: "  Mei Lin  ",
    email: "  MEI@EXAMPLE.COM ",
    password: "cook1234",
    confirmPassword: "cook1234",
  });

  expect(toSignUpInput(values)).toEqual({
    displayName: "Mei Lin",
    email: "mei@example.com",
    password: "cook1234",
  });
});

it.each(["", "1234567"])("rejects passwords shorter than 8", (password) => {
  expect(() => createAccountSchema.parse({
    name: "Mei Lin",
    email: "mei@example.com",
    password,
    confirmPassword: password,
  })).toThrow();
});

it("rejects passwords longer than 20", () => {
  const password = "a".repeat(21);
  expect(() => createAccountSchema.parse({
    name: "Mei Lin",
    email: "mei@example.com",
    password,
    confirmPassword: password,
  })).toThrow();
});

it("rejects invalid name, email, and confirmation", () => {
  expect(() => createAccountSchema.parse({
    name: "   ",
    email: "not-an-email",
    password: "cook1234",
    confirmPassword: "different",
  })).toThrow();
});
```

Run:

```bash
npx jest __tests__/create-account-schema.test.ts --runInBand
```

Expected: FAIL because the schema module is not present.

- [ ] **Step 3: Implement the schema and mapper**

Use this shape:

```ts
import type { SignUpInput } from "./api";
import { z } from "zod";

export const createAccountSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name.").max(80),
    email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.")),
    password: z.string().min(8, "Password must be at least 8 characters.").max(20, "Password must be 20 characters or fewer."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export const toSignUpInput = ({
  name,
  email,
  password,
}: CreateAccountFormValues): SignUpInput => ({
  displayName: name,
  email,
  password,
});
```

- [ ] **Step 4: Run the schema tests**

Run `npx jest __tests__/create-account-schema.test.ts --runInBand`.

Expected: PASS.

### Task 2: Add the local TanStack Query mutation

**Files:**

- Create: `src/features/auth/useCreateAccount.ts`
- Create: `__tests__/create-account-hook.test.tsx`

**Interfaces:**

- Consume `SignUpInput` from `src/features/auth/api.ts`.
- Produce `useCreateAccount(): { createAccount: (input: SignUpInput) => Promise<void>; isCreating: boolean }`.

- [ ] **Step 1: Write the failing hook test**

Follow `__tests__/password-reset-send-hook.test.tsx` with a fresh `QueryClientProvider` and retries disabled. Assert that the mutation resolves locally, exposes `isCreating), and does not call `authApi.signUp`.

- [ ] **Step 2: Implement the local mutation**

Use:

```ts
import { useMutation } from "@tanstack/react-query";
import type { SignUpInput } from "./api";

const createLocalAccount = async (_input: SignUpInput): Promise<void> => {
  await Promise.resolve();
};

export function useCreateAccount() {
  const mutation = useMutation({ mutationFn: createLocalAccount });

  return {
    createAccount: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
}
```

Do not import `useAuth`, `authApi`, SecureStore, or navigation. The future backend pass should replace only `createLocalAccount` with `authApi.signUp(input)`.

- [ ] **Step 3: Run the hook test**

Run `npx jest __tests__/create-account-hook.test.tsx --runInBand`.

Expected: PASS.

### Task 3: Refactor the screen to React Hook Form

**Files:**

- Modify: `src/features/auth/CreateAccountScreen.tsx`

**Interfaces:**

- Consume `createAccountSchema`, `CreateAccountFormValues`, `toSignUpInput`, and `useCreateAccount`.
- Preserve the existing screen copy, decoration, shared components, and route file.

- [ ] **Step 1: Replace local state with form state**

Configure:

```ts
const form = useForm<CreateAccountFormValues>({
  resolver: zodResolver(createAccountSchema),
  defaultValues: {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
  mode: "onSubmit",
  reValidateMode: "onChange",
});
```

Use `Controller` for each `AuthTextField`, passing `field.value` and `field.onChange`. Keep the existing input metadata and password visibility controls.

- [ ] **Step 2: Connect submit to the local mutation**

Use:

```ts
const { createAccount, isCreating } = useCreateAccount();

const handleSubmit = form.handleSubmit(
  async (values) => {
    try {
      await createAccount(toSignUpInput(values));
      toast.success("Account created. You can now log in.");
      router.replace("/auth/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },
  (errors) => {
    const firstMessage = Object.values(errors)[0]?.message;
    toast.error(typeof firstMessage === "string" ? firstMessage : "Check your account details.");
  },
);
```

Pass `onPress={() => void handleSubmit()}` to `AuthPrimaryButton`, set `disabled={isCreating}`, and display `Creating...` while pending.

- [ ] **Step 3: Run the TypeScript check**

Run `npx tsc --noEmit`.

Expected: no new TypeScript errors.

### Task 4: Add screen and hook behavior coverage

**Files:**

- Modify: `__tests__/auth-screens.test.tsx`
- Modify: `__tests__/create-account-hook.test.tsx` if needed to complete pending-state coverage.

**Interfaces:**

- Test public behavior, not React Hook Form internals.

- [ ] **Step 1: Add the screen import and hook mock**

Import `CreateAccountScreen`. Mock `useCreateAccount` with a `createAccount` spy and mutable `isCreating`. Add `authCreateAccount` to the test image map if required by the existing `images` mock.

- [ ] **Step 2: Test rendering and validation blocking**

Assert the approved heading, four fields, and button. Press submit with empty values and assert a validation toast while `createAccount` remains uncalled.

- [ ] **Step 3: Test normalized submission**

Fill the fields with name/email whitespace and uppercase email, submit, and assert:

```ts
expect(mockCreateAccount).toHaveBeenCalledWith({
  displayName: "Mei Lin",
  email: "mei@example.com",
  password: "cook1234",
});
```

- [ ] **Step 4: Test pending, success, and failure**

Assert `Creating...` and disabled state while pending. Resolve the mutation and assert the success toast plus `router.replace("/auth/login")`. Reject it with an `Error` and assert an error toast with no navigation.

- [ ] **Step 5: Run focused tests**

Run:

```bash
npx jest __tests__/create-account-schema.test.ts __tests__/create-account-hook.test.tsx __tests__/auth-screens.test.tsx --runInBand
```

Expected: PASS.

### Task 5: Verify the repository and preserve the backend seam

**Files:**

- No backend files.
- Do not update `server/docs/progress.md` because this pass intentionally does not integrate a backend request.

- [ ] **Step 1: Run the full checks**

Run:

```bash
npm run check
npm test -- --runInBand
npx expo export --platform android
```

Expected: lint, TypeScript, root tests, and Expo Android export all pass.

- [ ] **Step 2: Review the scoped diff**

Run:

```bash
git diff --check
git diff -- package.json package-lock.json src/features/auth/schema.ts src/features/auth/useCreateAccount.ts src/features/auth/CreateAccountScreen.tsx __tests__/create-account-schema.test.ts __tests__/create-account-hook.test.tsx __tests__/auth-screens.test.tsx
```

Confirm that no backend call, token persistence, auth-session update, unrelated auth refactor, or accidental asset change was introduced.

## Future Backend Integration Boundary

1. Replace `createLocalAccount` with `authApi.signUp(input)`.
2. Update the server signup schema to enforce the same password maximum of 20 characters; it currently enforces only the minimum.
3. Decide whether signup authenticates the user or requires a later login.
4. If signup authenticates the user, add token/session persistence separately in `AuthProvider` or a dedicated auth mutation boundary.
5. Keep the Zod schema tests unchanged and replace only the local mutation tests with API success/error coverage.

