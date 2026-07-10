# Forgot-password flow

This document explains the current frontend forgot-password flow and the backend contract it is designed to integrate with.

## Current screens

- `src/features/auth/ForgotPasswordScreen.tsx` collects the email and starts a reset request.
- `src/features/auth/EmailOtpScreen.tsx` displays the OTP form, countdown, resend action, and alternate-email action.
- `src/features/auth/CreateNewPasswordScreen.tsx` collects the replacement password.
- `src/features/auth/useSendPasswordResetCode.ts` owns the TanStack Query mutation, cooldown checks, pending-flow notifications, and resume state.
- `src/features/auth/passwordResetCooldownCore.ts` contains native-free persistence and timestamp logic.
- `src/features/auth/passwordResetCooldown.ts` adapts MMKV to the cooldown core.

## Initial request

When the user submits an email:

1. The mutation rejects immediately if the global password-reset cooldown is active.
2. The frontend persists the email and a `resendAvailableAt` timestamp.
3. The placeholder API call runs through the auth provider.
4. The app navigates to `/auth/email-otp` with the email route parameter.
5. The verify screen displays the masked email and a live countdown.

The current demo starts the local cooldown immediately so the UI responds at once. If the placeholder request fails, the pending flow and cooldown are rolled back. A real backend remains responsible for authoritative rate limiting.

## Persistence and resume

The pending local flow is conceptually:

```ts
{
  email: string;
  resendAvailableAt: number;
}
```

MMKV stores the absolute timestamp and email. The app derives remaining seconds from `Date.now()`, so backgrounding, navigation, and app restarts do not reset the countdown.

When Forgot Password opens normally, an active pending email causes the screen to navigate to Verify Email without calling the send-code API again. This is a resume operation, not a new email request.

## Use another email

The Verify Email screen uses:

```ts
router.dismissTo({
  pathname: "/auth/forgot-password",
  params: { mode: "another-email" },
});
```

`dismissTo` removes the verify screen and reaches the existing forgot-password screen instead of stacking a duplicate route.

The `another-email` mode is temporary navigation state. It suppresses automatic resume for that visit only; it does not delete the pending reset email or bypass the global cooldown. If the user leaves, restarts, or later opens Forgot Password without that mode, the pending Verify Email flow resumes again.

While the cooldown remains active, the forgot-password send button is disabled and shows the remaining time. Once it expires, the user can send a new email, replacing the pending flow.

## Resend behavior

The resend action is disabled during cooldown. When enabled:

1. It calls the same send-code mutation boundary.
2. The local timestamp restarts immediately at one minute for demo responsiveness.
3. The cooldown hook is notified so the visible timer rerenders immediately.
4. A successful request shows a top success toast.
5. A failed request rolls back the local flow and shows an error toast.

The frontend prevents concurrent sends with an in-flight guard. The backend must still enforce the same rule independently.

## Verification and future backend integration

The current placeholder verification method accepts only the code. A real implementation must add an opaque challenge/session identifier returned by the send-code API:

```ts
{
  email: string;
  challengeId: string;
  resendAvailableAt: number;
}
```

The app must persist and reuse `challengeId` when the user resumes the verify screen. Resuming must never send another code. Verification should submit the challenge ID and code to the backend. If resend rotates the challenge, the response must return a replacement ID and the frontend must update the pending flow atomically.

The backend must bind the challenge to the normalized email and password-reset purpose, enforce expiry and attempt limits, hash OTPs, and invalidate the challenge after successful verification. The client email and MMKV timestamp are not authoritative security values.

After successful OTP verification, the frontend clears the pending reset flow before navigating to Create New Password. The flow should also be cleared after final password reset completion or explicit expiry/cancellation.

## Testing expectations

Tests should cover:

- cooldown persistence and expiry;
- immediate cooldown restart after resend;
- failed-send rollback;
- concurrent-send blocking;
- resume navigation without a new send call;
- `another-email` mode suppressing resume for one visit;
- `dismissTo` avoiding duplicate stack entries;
- challenge ID reuse and rotation once the backend contract is available.
