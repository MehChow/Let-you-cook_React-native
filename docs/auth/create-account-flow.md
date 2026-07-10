# Create account flow

## Scope

The create-account screen now has client-side validation, React Hook Form handling, a TanStack Query mutation boundary, local session persistence, and direct navigation to the home screen.

This is still a frontend/demo flow. The mutation does not call the backend signup endpoint. The post-submit login uses the existing local mock session behavior so the user is treated as logged in during this phase.

## Entry points

- Route: `src/app/auth/create-account.tsx`
- Screen: `src/features/auth/CreateAccountScreen.tsx`
- Form contract: `src/features/auth/schema.ts`
- Local mutation: `src/features/auth/useCreateAccount.ts`
- Auth/session provider: `src/features/auth/AuthProvider.tsx`
- Home route: `src/app/private/(tabs)/index.tsx`

## User flow

1. The user opens `/auth/create-account` and enters name, email, password, and confirmation.
2. Pressing `Create account` runs the Zod resolver through React Hook Form.
3. Validation failures show the first available message through the global Sonner toast. The form does not render inline errors.
4. Valid values are normalized and passed to `useCreateAccount`:
   - name is trimmed;
   - email is trimmed and lowercased;
   - password is passed unchanged.
5. The local TanStack Query mutation resolves without a network request.
6. The screen calls `useAuth().login({ email, password })`. In the current demo provider this creates and persists a mock session.
7. The screen shows `Account created.` and replaces the route with `/private/(tabs)`.

Interrupted and alternate paths:

- Back navigation uses `AuthBackButton` and returns to the previous auth route.
- The footer replaces the current route with `/auth/login`.
- While the mutation is pending, the button is disabled and reads `Creating...`.
- If the local mutation or local login rejects, an error toast is shown and navigation does not occur.
- App restart hydrates the stored local session through `AuthProvider`; an expired mock session is cleared and the user returns to the auth flow.

## Architecture and data flow

| Responsibility | Source path | Notes |
| --- | --- | --- |
| Route entry | `src/app/auth/create-account.tsx` | Thin Expo Router route that renders `CreateAccountScreen`. |
| Form UI | `src/features/auth/CreateAccountScreen.tsx` | Owns fields, submit handling, toasts, and navigation. |
| Validation and mapping | `src/features/auth/schema.ts` | Defines `createAccountSchema`, `CreateAccountFormValues`, and `toSignUpInput`. |
| Mutation boundary | `src/features/auth/useCreateAccount.ts` | Uses `useMutation`; current `createLocalAccount` is intentionally client-only. |
| Session persistence | `src/features/auth/AuthProvider.tsx` | Current `login` creates a mock session and saves it. |
| Secure storage binding | `src/features/auth/tokenStorage.ts` | Connects the storage core to `expo-secure-store`. |
| Storage behavior | `src/features/auth/tokenStorageCore.ts` | Stores session JSON plus access and refresh token values. |
| Destination | `src/app/private/(tabs)/index.tsx` | Home screen reached after local signup/login. |

The data path is:

```text
AuthTextField
  -> Controller/useForm
  -> createAccountSchema
  -> toSignUpInput
  -> useCreateAccount
  -> local mutation
  -> useAuth().login
  -> AuthProvider mock session
  -> authTokenStorage.saveSession
  -> /private/(tabs)
```

## Persistence and lifecycle

The create-account mutation itself stores nothing. Session persistence happens in `AuthProvider.login` through `authTokenStorage.saveSession`.

Current storage keys in `src/features/auth/tokenStorageCore.ts`:

- `letyoucook.auth.session`
- `letyoucook.auth.access-token`
- `letyoucook.auth.refresh-token`

The mock session is created by `createMockAuthSession` in `src/features/auth/session.ts` with a 15-minute access-token expiry timestamp. On app startup, `AuthProvider` reads the stored session, clears it if `isAccessTokenExpired` returns true, and exposes `isLoggedIn` to the protected route tree.

The password is used for the local login call but is not persisted as a password. The stored values are mock session/token values and must not be treated as server-issued credentials.

## API/backend integration

### Current frontend behavior

`useCreateAccount` does not call `authApi.signUp` or any HTTP endpoint. `src/features/auth/api.ts` already defines the future-compatible input shape:

```ts
interface SignUpInput {
  email: string;
  password: string;
  displayName?: string;
}
```

The current local mapper produces `{ displayName, email, password }`, but the returned value is consumed only by the local mutation.

### Future backend handoff

The backend contract is documented in `server/docs/backend-token-auth.md` and the current server route is `server/src/routes/auth.ts`:

- Endpoint: `POST /auth/signup`
- Current server input: email, password, optional display name.
- Current server validation: valid email, password minimum 8, display name maximum 80.
- Current server response: user data and an access/refresh token pair.

The future integration should replace the `createLocalAccount` function in `src/features/auth/useCreateAccount.ts` with `authApi.signUp(input)`. Before relying on the client’s 8–20 password range as a complete contract, update the server schema to enforce the 20-character maximum as well.

The later auth integration must also decide whether signup immediately establishes the server session. If it does, persist the returned token pair and user data through the auth session boundary. If it does not, navigate to login after successful signup instead of calling local `login`.

The intended server-backed startup behavior is described in `server/docs/backend-token-auth.md`: store tokens in SecureStore, validate access-token expiry server-side, refresh once on an eligible `401`, and clear tokens when refresh fails.

## Failure and edge cases

- Empty name: validation toast `Enter your name.`
- Invalid email: validation toast from the email schema.
- Password shorter than 8 characters: rejected.
- Password longer than 20 characters: rejected.
- Mismatched confirmation: validation toast `Passwords do not match.`
- Duplicate presses: the primary button is disabled while `isCreating` is true.
- Local mutation failure: error toast; no home navigation.
- Local login failure: error toast; no home navigation.
- Back navigation before submission: returns through the existing auth stack; no session is created.
- App restart after successful local signup: the provider restores the stored mock session until its local expiry timestamp.

## Testing

Focused coverage lives in:

- `__tests__/create-account-schema.test.ts`: normalization, name/email validation, password 8–20 boundaries, and confirmation failure.
- `__tests__/create-account-hook.test.tsx`: local TanStack Query mutation resolution and cleanup.
- `__tests__/auth-screens.test.tsx`: rendering, invalid submission, normalized payload, local success/login/home navigation, pending UI, and failure toast behavior.

Verification commands:

```bash
npx jest __tests__/create-account-schema.test.ts __tests__/create-account-hook.test.tsx __tests__/auth-screens.test.tsx --runInBand --forceExit
npm run check
npm test -- --runInBand --forceExit
npx expo export --platform android
```

## Limitations and follow-up

Confirmed current limitations:

- Signup is local-only; no `POST /auth/signup` request is made.
- The current login/session is mock-backed rather than based on server-issued token validity.
- The current local session uses a 15-minute mock expiry and is not a substitute for refresh-token handling.
- The backend currently does not enforce the frontend’s 20-character password maximum.
- The global Jest setup still emits an open-handle warning, so the verified test command uses `--forceExit`.

The next backend integration should preserve the form schema and screen contract while replacing only the mutation implementation and the local post-create login/session behavior.
