# Create account flow

## Scope

The create-account screen has client-side validation, React Hook Form handling, a TanStack Query mutation boundary, server signup through `POST /auth/signup`, SecureStore-backed session persistence, and direct navigation to the home screen.

Forgot-password, email delivery, login integration, and refresh-on-hydration remain out of scope. Login still uses the existing local demo behavior.

## Entry points

- Route: `src/app/auth/create-account.tsx`
- Screen: `src/features/auth/CreateAccountScreen.tsx`
- Form contract: `src/features/auth/schema.ts`
- Signup mutation: `src/features/auth/useCreateAccount.ts`
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
5. The TanStack Query mutation calls `authApi.signUp` and receives the server user and token pair.
6. The screen calls `useAuth().establishSession(response)`, which derives the JWT expiry and persists the real session through SecureStore.
7. The screen shows `Account created.` and replaces the route with `/private/(tabs)`.

Interrupted and alternate paths:

- Back navigation uses `AuthBackButton` and returns to the previous auth route.
- The footer replaces the current route with `/auth/login`.
- While the mutation is pending, the button is disabled and reads `Creating...`.
- If the API mutation or session persistence rejects, an error toast is shown and navigation does not occur.
- App restart hydrates the stored session through `AuthProvider`; an expired session is currently cleared because refresh-on-hydration is out of scope.

## Architecture and data flow

| Responsibility         | Source path                                 | Notes                                                                          |
| ---------------------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| Route entry            | `src/app/auth/create-account.tsx`           | Thin Expo Router route that renders `CreateAccountScreen`.                     |
| Form UI                | `src/features/auth/CreateAccountScreen.tsx` | Owns fields, submit handling, toasts, and navigation.                          |
| Validation and mapping | `src/features/auth/schema.ts`               | Defines `createAccountSchema`, `CreateAccountFormValues`, and `toSignUpInput`. |
| Mutation boundary      | `src/features/auth/useCreateAccount.ts`     | Uses `useMutation` and calls `authApi.signUp`.                                 |
| Session persistence    | `src/features/auth/AuthProvider.tsx`        | `establishSession` converts the server response and saves it.                  |
| Secure storage binding | `src/features/auth/tokenStorage.ts`         | Connects the storage core to `expo-secure-store`.                              |
| Storage behavior       | `src/features/auth/tokenStorageCore.ts`     | Stores session JSON plus access and refresh token values.                      |
| Destination            | `src/app/private/(tabs)/index.tsx`          | Home screen reached after successful signup.                                   |

The data path is:

```text
AuthTextField
  -> Controller/useForm
  -> createAccountSchema
  -> toSignUpInput
  -> useCreateAccount
  -> authApi.signUp
  -> POST /auth/signup
  -> useAuth().establishSession
  -> AuthProvider server session
  -> authTokenStorage.saveSession
  -> /private/(tabs)
```

## Persistence and lifecycle

The create-account mutation returns the backend response but stores nothing itself. Session persistence happens in `AuthProvider.establishSession` through `authTokenStorage.saveSession`.

Current storage keys in `src/features/auth/tokenStorageCore.ts`:

- `letyoucook.auth.session`
- `letyoucook.auth.access-token`
- `letyoucook.auth.refresh-token`

The server session is created by `createAuthSession` in `src/features/auth/session.ts`. It derives the access-token expiry from the JWT `exp` claim and falls back to 15 minutes if the token cannot be decoded. On app startup, `AuthProvider` reads the stored session, clears it if `isAccessTokenExpired` returns true, and exposes `isLoggedIn` to the protected route tree. Refresh-on-hydration is a later task.

The password is sent only to the signup API and is not persisted. The stored access and refresh tokens are server-issued credentials.

## API/backend integration

### Current frontend behavior

`useCreateAccount` calls `authApi.signUp`. `src/features/auth/api.ts` defines the input and response shapes:

```ts
interface SignUpInput {
  email: string;
  password: string;
  displayName?: string;
}

interface AuthResponse {
  user: { id: string; email: string };
  tokens: { accessToken: string; refreshToken: string };
}
```

The mapper produces `{ displayName, email, password }`; the mutation sends it to the backend and returns the `AuthResponse` to the screen.

### Backend contract

The backend contract is documented in `server/docs/backend-token-auth.md` and the current server route is `server/src/routes/auth.ts`:

- Endpoint: `POST /auth/signup`
- Current server input: email, password, optional display name.
- Current server validation: valid email, password minimum 8, display name maximum 80.
- Current server response: user data and an access/refresh token pair.

The server validates passwords from 8 through 20 characters. Signup immediately establishes the server session by returning the token pair and user data; the client persists them through the auth session boundary.

The intended server-backed startup behavior is described in `server/docs/backend-token-auth.md`: store tokens in SecureStore, validate access-token expiry server-side, refresh once on an eligible `401`, and clear tokens when refresh fails.

## Failure and edge cases

- Empty name: validation toast `Enter your name.`
- Invalid email: validation toast from the email schema.
- Password shorter than 8 characters: rejected.
- Password longer than 20 characters: rejected.
- Mismatched confirmation: validation toast `Passwords do not match.`
- Duplicate presses: the primary button is disabled while `isCreating` is true.
- API or session-persistence failure: error toast; no home navigation.
- Duplicate email: backend `409` message `Email is already registered` is shown through the error toast.
- Back navigation before submission: returns through the existing auth stack; no session is created.
- App restart after successful signup: the provider restores the stored server session until its access token expires; refresh-on-hydration is not yet implemented.

## Testing

Focused coverage lives in:

- `__tests__/create-account-schema.test.ts`: normalization, name/email validation, password 8–20 boundaries, and confirmation failure.
- `__tests__/create-account-hook.test.tsx`: API-backed TanStack Query mutation and cleanup.
- `__tests__/auth-session.test.ts`: server session conversion and JWT expiry handling.
- `__tests__/auth-screens.test.tsx`: rendering, invalid submission, normalized payload, server-session/home navigation, pending UI, and failure toast behavior.
- `server/src/auth/signup-validation.test.ts`: backend maximum password validation.

Verification commands:

```bash
npx jest __tests__/create-account-schema.test.ts __tests__/create-account-hook.test.tsx __tests__/auth-screens.test.tsx --runInBand --forceExit
npm run check
npm test -- --runInBand --forceExit
npx expo export --platform android
```

## Limitations and follow-up

Confirmed current limitations:

- Login remains mock-backed rather than based on server-issued token validity.
- Refresh-on-hydration and protected feature API usage are not yet implemented.
- The global Jest setup still emits an open-handle warning, so the verified test command uses `--forceExit`.

The next auth integration should preserve this form and session contract while wiring login and then refresh-on-hydration.
