# Password reset resend cooldown

## Scope

Add the frontend behavior for the forgot-password verification flow. The send-code API remains a placeholder, but it is isolated behind a future-ready API function and invoked through TanStack Query. The cooldown is global to the app installation, not scoped to an email address.

## Behavior

- A successful initial send starts a 60-second cooldown.
- A resend attempt reads the persisted cooldown before making the placeholder API call.
- While the cooldown is active, no API call is made and the action remains disabled.
- A successful resend restarts the full 60-second cooldown and shows a top success toast.
- A failed send does not start or extend the cooldown.
- The verify screen calculates remaining time from an absolute timestamp, so backgrounding, navigation, and relaunching do not reset the timer.
- At zero, the copy changes to an enabled `Resend code` action.

## Design

### Cooldown core

Create a native-free `passwordResetCooldownCore.ts` module with pure operations for reading the available-at timestamp, checking whether a send is allowed, starting a cooldown, and calculating remaining seconds. It accepts a small storage interface so Jest can test persistence and boundary behavior without loading MMKV.

Create a thin MMKV adapter in `passwordResetCooldown.ts`. It stores one absolute timestamp under a feature-specific key. No interval or decrementing value is persisted.

### API and TanStack Query

Add a placeholder `sendPasswordResetCode` function to the auth API surface. It validates the email and resolves as a successful send until the backend email route exists.

Add a `useSendPasswordResetCode` mutation hook. The mutation checks the cooldown before calling the API, starts the cooldown only after a successful API result, and exposes the existing error to the screens. Both the forgot-password initial send and verify-screen resend use this same mutation boundary.

### Screen integration

The forgot-password screen uses the mutation for its existing `Send code` action. The verify screen reads the persisted timestamp on mount, refreshes its display once per second while active, and uses the same mutation for resend. Resend success calls `toast.success` with a concise confirmation. Existing error handling and visual styling remain unchanged.

## Testing

- Core tests cover no stored timestamp, active cooldown, expiry, persistence, and exact one-minute formatting inputs.
- API tests cover the placeholder request boundary.
- Hook/screen tests cover the initial send starting cooldown, blocked resend not calling the API, successful resend restarting cooldown and showing a success toast, and the enabled action after expiry.
- Run the focused Jest tests, then `npm run check`.

## Future backend integration

The placeholder API function is the only send-code dependency used by the mutation. It can later call a real backend endpoint without changing screen code. The backend must independently enforce a server-side cooldown and return a rate-limit error; MMKV is only a client-side guard and cannot provide security or cross-device enforcement.
