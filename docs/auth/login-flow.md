# Local login flow

## Scope

The login screen now has a backend-ready form boundary while remaining local-only. It validates and normalizes credentials with Zod and React Hook Form, sends them through a TanStack Query mutation, and creates the existing mock session only when the configured demo credentials match.

No login request is sent to the backend, and the password is not persisted.

## Entry points

- Route: `src/app/auth/login.tsx`
- Screen: `src/features/auth/LoginScreen.tsx`
- Form contract: `src/features/auth/schema.ts`
- Local mutation: `src/features/auth/useLogin.ts`
- Session provider: `src/features/auth/AuthProvider.tsx`
- Destination: `src/app/private/(tabs)/index.tsx`

## User flow

1. The user opens `/auth/login` and enters an email and password.
2. Pressing `Log in` runs `loginSchema` through the React Hook Form resolver.
3. The email is trimmed and lowercased. The password is passed through unchanged.
4. Valid values are passed to `useLogin`, which compares them with the configured local demo credential.
5. When the comparison succeeds, `useAuth().login` creates and persists the mock session.
6. The route is replaced with `/private/(tabs)`.

Failure and alternate paths:

- Invalid email format or an empty password shows the first validation error through the global Sonner toast.
- A credential mismatch shows the generic `Invalid credentials.` toast and does not create a session or navigate.
- The login button is disabled and reads `Signing in...` while the local mutation is pending.
- `Forgot password?` navigates to `/auth/forgot-password`.
- `Create account` navigates to `/auth/create-account`.
- Google sign-in remains an informational placeholder.

## Architecture and data flow

| Responsibility | Source path | Notes |
| --- | --- | --- |
| Route entry | `src/app/auth/login.tsx` | Thin Expo Router route. |
| Form UI | `src/features/auth/LoginScreen.tsx` | Owns fields, submit handling, feedback, and navigation. |
| Validation and mapping | `src/features/auth/schema.ts` | Defines `loginSchema`, `LoginFormValues`, and `toLoginInput`. |
| Mutation boundary | `src/features/auth/useLogin.ts` | Uses `useMutation`; currently compares against the local demo credential. |
| Session persistence | `src/features/auth/AuthProvider.tsx` | Creates and saves the mock session after validation. |
| Storage binding | `src/features/auth/tokenStorage.ts` | Connects session storage to `expo-secure-store`. |

The data path is:

```text
AuthTextField
  -> Controller/useForm
  -> loginSchema
  -> toLoginInput
  -> useLogin
  -> local credential check
  -> useAuth().login
  -> AuthProvider mock session
  -> authTokenStorage.saveSession
  -> /private/(tabs)
```

## Persistence and lifecycle

`useLogin` does not store credentials. On successful login, `AuthProvider.login` creates a mock session and stores it through the existing token storage boundary.

The storage keys are defined in `src/features/auth/tokenStorageCore.ts`:

- `letyoucook.auth.session`
- `letyoucook.auth.access-token`
- `letyoucook.auth.refresh-token`

On app startup, `AuthProvider` hydrates the stored session. Expired mock sessions are cleared and the user returns to the auth flow.

## API/backend integration

The current frontend mutation is deliberately client-only. Future integration should replace the implementation inside `useLogin` with the backend login call while preserving the screen contract:

```ts
interface AuthCredentials {
  email: string;
  password: string;
}
```

The backend should validate the credentials, return the authenticated user and token pair, and remain authoritative for account existence and password correctness. The client must not treat the local demo comparison as production authentication.

## Security boundaries

- The demo credential is development-only behavior and must be removed when the backend login mutation is connected.
- Do not persist the submitted password.
- Production authentication must use server-issued tokens and server-side credential validation.
- The generic error avoids revealing whether the email or password was incorrect.

## Testing

Focused coverage lives in:

- `__tests__/login-hook.test.tsx`: accepts the demo credential and rejects mismatches.
- `__tests__/auth-screens.test.tsx`: form rendering, validation, generic failure toast, normalization, session login, and navigation.

Verification commands:

```bash
npx jest __tests__/login-hook.test.tsx __tests__/auth-screens.test.tsx --runInBand --forceExit
npm run check
git diff --check
```

## Limitations and follow-up

- Login is local-only; no backend endpoint is called.
- The local credential is fixed in `src/features/auth/useLogin.ts`.
- The existing session is a mock session with local expiry, not a server-validated access/refresh-token flow.
- Backend integration should replace only the mutation/session seam after the server login contract is finalized.
