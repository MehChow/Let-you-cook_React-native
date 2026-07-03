# Auth UI Stack Protected Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use inline execution only. Do not use or suggest sub-agents for this repo. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build login, forgot password, email OTP, and create-new-password screens, then wire persistent mock auth through Expo Router `Stack.Protected`.

**Architecture:** Keep routes thin under `src/app/auth/*`, put shared auth UI and state under `src/features/auth`, reuse `authTokenStorage` for persistence, and keep direct auth image imports centralized in `src/data/images.ts`. Login accepts any credentials for now and stores mock token data; the later API swap should happen behind the auth actions/TanStack Query hooks, not inside screens.

**Tech Stack:** Expo 56, Expo Router `Stack.Protected`, `expo-secure-store`, `expo-image`, React Native Reusables primitives, Uniwind/Tailwind v4 tokens, Zustand only if the final implementation benefits from selector-based auth state.

---

## Source Context

- Expo Router v56 Stack docs confirm the app should import `Stack` from `expo-router`; this repo's installed `expo-router` package and current `src/app/_layout.tsx` already expose and use `Stack.Protected`.
- Expo SecureStore v56 recommended package is already installed as `expo-secure-store ~56.0.4`; `src/features/auth/tokenStorage.ts` already wraps it.
- `server/docs/backend-token-auth.md` defines the future server shape: 15-minute JWT access token, 30-day opaque refresh token, store both in SecureStore, refresh on 401 once, and clear tokens when refresh fails.
- Current root layout hardcodes `const isLoggedIn = false`; replace that with real hydrated auth state.
- Current `src/app/index.tsx` duplicates the same hardcoded auth redirect; replace it with the same hydrated auth state or remove the hardcoded fallback behavior.

## File Map

- Modify: `src/data/images.ts` - add `auth` image entries for the five files under `assets/images/auth/`.
- Create: `src/features/auth/authTypes.ts` - shared auth/session interfaces, including a mock token expiry timestamp.
- Create: `src/features/auth/session.ts` - smallest auth session helpers: make mock tokens, check expiry, derive logged-in state.
- Create: `src/features/auth/session.test.ts` - assert token expiry and mock session behavior.
- Create: `src/features/auth/AuthProvider.tsx` - hydrate tokens from SecureStore, expose `isHydrating`, `isLoggedIn`, `login`, `logout`, `sendPasswordResetCode`, `verifyOtp`, and `resetPassword`.
- Create: `src/features/auth/useAuth.ts` - tiny hook that throws if used outside provider.
- Create: `src/features/auth/components/AuthShell.tsx` - shared responsive safe-area layout, background image slot, and card/panel layout.
- Create: `src/features/auth/components/AuthTextField.tsx` - shared icon text/password field.
- Create: `src/features/auth/components/AuthPrimaryButton.tsx` - shared pill primary button using existing tokens.
- Create: `src/features/auth/components/AuthBackButton.tsx` - round back button used on reset flow pages.
- Create: `src/features/auth/components/AuthFooterLink.tsx` - shared link row for "Back to login" and "Create account" text.
- Create: `src/features/auth/LoginScreen.tsx` - page UI and any-credential mock login.
- Create: `src/features/auth/ForgotPasswordScreen.tsx` - email form and route to OTP.
- Create: `src/features/auth/EmailOtpScreen.tsx` - six-digit OTP UI and route to reset password.
- Create: `src/features/auth/CreateNewPasswordScreen.tsx` - reset password UI and route to login or home after updating.
- Modify: `src/app/_layout.tsx` - wrap app in `AuthProvider`; gate auth/private groups with `Stack.Protected`.
- Modify: `src/app/index.tsx` - use auth hydration and redirect to `/private/(tabs)` or `/auth/login`.
- Modify: `src/app/auth/login.tsx` - render `LoginScreen`.
- Create: `src/app/auth/forgot-password.tsx` - render `ForgotPasswordScreen`.
- Create: `src/app/auth/email-otp.tsx` - render `EmailOtpScreen`.
- Create: `src/app/auth/create-new-password.tsx` - render `CreateNewPasswordScreen`.
- Modify: an existing logout surface, likely `src/app/private/(tabs)/profile.tsx` or `src/features/profile/UserHeader.tsx`, only if a logout button already exists or is trivial to add.

## Task 1: Centralize Auth Assets

**Files:**
- Modify: `src/data/images.ts`

- [ ] Add auth image imports to the existing `images` object.

```ts
export const images = {
  avatarMock: require("@/assets/mock/icon.webp"),
  todaySpecial: require("@/assets/mock/todays_special.webp"),
  popularRecipe1: require("@/assets/mock/popular_recipe_1.webp"),
  popularRecipe2: require("@/assets/mock/popular_recipe_2.webp"),
  categoryBreakfast: require("@/assets/mock/categories/breakfast.webp"),
  categoryLunch: require("@/assets/mock/categories/lunch.webp"),
  categoryDinner: require("@/assets/mock/categories/dinner.webp"),
  categoryDessert: require("@/assets/mock/categories/dessert.webp"),
  categoryDrinks: require("@/assets/mock/categories/drinks.webp"),
  categoryVegan: require("@/assets/mock/categories/vegan.webp"),
  categoryOther: require("@/assets/mock/categories/other.webp"),
  recipeDetail1: require("@/assets/mock/recipe-detail-1.webp"),
  recipeDetail2: require("@/assets/mock/recipe-detail-2.webp"),
  recipeDetail3: require("@/assets/mock/recipe-detail-3.webp"),
  authLoginBg: require("@/assets/images/auth/login-bg.webp"),
  authLoginBg2: require("@/assets/images/auth/login-bg2.webp"),
  authForgotPassword: require("@/assets/images/auth/forget-password.webp"),
  authForgotPassword2: require("@/assets/images/auth/forget-password2.webp"),
  authEmailOtp: require("@/assets/images/auth/email-otp.webp"),
  authCreateNewPassword: require("@/assets/images/auth/create-new-password.webp"),
} as const;
```

- [ ] Run: `npx tsc --noEmit`

Expected: no TypeScript errors from asset references.

## Task 2: Add Session Helpers

**Files:**
- Create: `src/features/auth/authTypes.ts`
- Create: `src/features/auth/session.ts`
- Create: `src/features/auth/session.test.ts`

- [ ] Create shared session types.

```ts
import type { AuthTokens, AuthUser } from "./api";

export interface StoredAuthSession {
  user: AuthUser;
  tokens: AuthTokens;
  accessTokenExpiresAt: number;
}

export interface MockLoginInput {
  email: string;
  now?: number;
}
```

- [ ] Create mock token and expiry helpers.

```ts
import type { StoredAuthSession, MockLoginInput } from "./authTypes";

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

export const createMockAuthSession = ({
  email,
  now = Date.now(),
}: MockLoginInput): StoredAuthSession => ({
  user: {
    id: "mock-user",
    email: email.trim() || "cook@example.com",
  },
  tokens: {
    accessToken: `mock-access-${now}`,
    refreshToken: `mock-refresh-${now}`,
  },
  accessTokenExpiresAt: now + ACCESS_TOKEN_TTL_MS,
});

export const isAccessTokenExpired = (
  session: Pick<StoredAuthSession, "accessTokenExpiresAt"> | null,
  now = Date.now(),
) => !session || session.accessTokenExpiresAt <= now;
```

- [ ] Add the smallest node tests for the non-trivial branch.

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { createMockAuthSession, isAccessTokenExpired } from "./session";

test("mock auth session expires after 15 minutes", () => {
  const session = createMockAuthSession({
    email: "cook@example.com",
    now: 1_000,
  });

  assert.equal(session.user.email, "cook@example.com");
  assert.equal(session.accessTokenExpiresAt, 901_000);
  assert.equal(isAccessTokenExpired(session, 900_999), false);
  assert.equal(isAccessTokenExpired(session, 901_000), true);
});
```

- [ ] Run the test.

```bash
npx tsx src/features/auth/session.test.ts
```

Expected: PASS.

## Task 3: Add Auth Provider

**Files:**
- Create: `src/features/auth/AuthProvider.tsx`
- Create: `src/features/auth/useAuth.ts`
- Modify: `src/features/auth/tokenStorageCore.ts`

- [ ] Extend token storage only if the provider needs session metadata. The shortest durable option is to add one JSON session key instead of storing user data elsewhere.

```ts
import type { AuthTokens } from "./api";
import type { StoredAuthSession } from "./authTypes";

const ACCESS_TOKEN_KEY = "letyoucook.auth.access-token";
const REFRESH_TOKEN_KEY = "letyoucook.auth.refresh-token";
const SESSION_KEY = "letyoucook.auth.session";

export interface AuthTokenStore {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

export const createAuthTokenStorage = (store: AuthTokenStore) => ({
  getTokens: async (): Promise<AuthTokens | null> => {
    const [accessToken, refreshToken] = await Promise.all([
      store.getItemAsync(ACCESS_TOKEN_KEY),
      store.getItemAsync(REFRESH_TOKEN_KEY),
    ]);

    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  },
  saveTokens: (tokens: AuthTokens) =>
    Promise.all([
      store.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
      store.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
    ]).then(() => undefined),
  clearTokens: () =>
    Promise.all([
      store.deleteItemAsync(ACCESS_TOKEN_KEY),
      store.deleteItemAsync(REFRESH_TOKEN_KEY),
      store.deleteItemAsync(SESSION_KEY),
    ]).then(() => undefined),
  getSession: async (): Promise<StoredAuthSession | null> => {
    const value = await store.getItemAsync(SESSION_KEY);
    return value ? (JSON.parse(value) as StoredAuthSession) : null;
  },
  saveSession: (session: StoredAuthSession) =>
    Promise.all([
      store.setItemAsync(SESSION_KEY, JSON.stringify(session)),
      store.setItemAsync(ACCESS_TOKEN_KEY, session.tokens.accessToken),
      store.setItemAsync(REFRESH_TOKEN_KEY, session.tokens.refreshToken),
    ]).then(() => undefined),
});
```

- [ ] Update `tokenStorage.test.ts` to assert `saveSession`, `getSession`, and `clearTokens`.

```ts
await storage.saveSession({
  user: { id: "mock-user", email: "cook@example.com" },
  tokens: { accessToken: "access", refreshToken: "refresh" },
  accessTokenExpiresAt: 123,
});

assert.deepEqual(await storage.getSession(), {
  user: { id: "mock-user", email: "cook@example.com" },
  tokens: { accessToken: "access", refreshToken: "refresh" },
  accessTokenExpiresAt: 123,
});
```

- [ ] Create provider using plain React state. Do not add Zustand unless selectors become necessary.

```tsx
import * as SplashScreen from "expo-splash-screen";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import type { StoredAuthSession } from "./authTypes";
import { createMockAuthSession, isAccessTokenExpired } from "./session";
import { authTokenStorage } from "./tokenStorage";

interface AuthContextValue {
  isHydrating: boolean;
  isLoggedIn: boolean;
  session: StoredAuthSession | null;
  login(input: { email: string; password: string }): Promise<void>;
  logout(): Promise<void>;
  sendPasswordResetCode(email: string): Promise<void>;
  verifyOtp(code: string): Promise<void>;
  resetPassword(input: { password: string; confirmPassword: string }): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isHydrating, setIsHydrating] = useState(true);
  const [session, setSession] = useState<StoredAuthSession | null>(null);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      const storedSession = await authTokenStorage.getSession();
      const validSession = isAccessTokenExpired(storedSession) ? null : storedSession;

      if (!validSession) {
        await authTokenStorage.clearTokens();
      }

      if (mounted) {
        setSession(validSession);
        setIsHydrating(false);
        await SplashScreen.hideAsync();
      }
    };

    void hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const login: AuthContextValue["login"] = async ({ email }) => {
    const nextSession = createMockAuthSession({ email });
    await authTokenStorage.saveSession(nextSession);
    setSession(nextSession);
  };

  const logout = async () => {
    await authTokenStorage.clearTokens();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isHydrating,
        isLoggedIn: !isAccessTokenExpired(session),
        session,
        login,
        logout,
        sendPasswordResetCode: async () => undefined,
        verifyOtp: async () => undefined,
        resetPassword: async () => undefined,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
};
```

- [ ] If using the separate hook file, re-export the hook there:

```ts
export { useAuth } from "./AuthProvider";
```

- [ ] Run:

```bash
npx tsx src/features/auth/tokenStorage.test.ts
npx tsx src/features/auth/session.test.ts
```

Expected: both pass.

## Task 4: Wire Stack.Protected

**Files:**
- Modify: `src/app/_layout.tsx`
- Modify: `src/app/index.tsx`

- [ ] Wrap the existing stack in `AuthProvider` and replace the hardcoded guard.

```tsx
import "@/global.css";
import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";

void SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { isHydrating, isLoggedIn } = useAuth();

  if (isHydrating) {
    return (
      <View className="bg-app-screen flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/email-otp" />
        <Stack.Screen name="auth/create-new-password" />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="private/(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="private/add-recipe/index" />
        <Stack.Screen name="private/add-recipe/preview" />
        <Stack.Screen name="private/recipe/[recipeId]" />
        <Stack.Screen
          name="private/recipe/[recipeId]/reviews"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [0.6],
            sheetExpandsWhenScrolledToEdge: false,
            sheetCornerRadius: 24,
          }}
        />
        <Stack.Screen
          name="private/modal"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [0.7],
            sheetExpandsWhenScrolledToEdge: false,
            sheetCornerRadius: 24,
          }}
        />
        <Stack.Screen
          name="private/filters"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [0.62],
            sheetExpandsWhenScrolledToEdge: false,
            sheetCornerRadius: 24,
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootStack />
        <Toaster />
        <PortalHost />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
```

- [ ] Replace `src/app/index.tsx` with a small redirect based on hydrated auth state.

```tsx
import { useAuth } from "@/features/auth/useAuth";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isHydrating, isLoggedIn } = useAuth();

  if (isHydrating) {
    return (
      <View className="bg-app-screen flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={isLoggedIn ? "/private/(tabs)" : "/auth/login"} />;
}
```

- [ ] Run: `npx tsc --noEmit`

Expected: no route or provider type errors.

## Task 5: Build Shared Auth UI Components

**Files:**
- Create: `src/features/auth/components/AuthShell.tsx`
- Create: `src/features/auth/components/AuthTextField.tsx`
- Create: `src/features/auth/components/AuthPrimaryButton.tsx`
- Create: `src/features/auth/components/AuthBackButton.tsx`
- Create: `src/features/auth/components/AuthFooterLink.tsx`

- [ ] Implement a responsive shell that uses `expo-image` and existing tokens only.

```tsx
import { Image, type ImageSource } from "expo-image";
import type { PropsWithChildren, ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AuthShellProps extends PropsWithChildren {
  hero?: ReactNode;
  bottomImage?: ImageSource;
  showCard?: boolean;
}

export function AuthShell({ children, hero, bottomImage, showCard = false }: AuthShellProps) {
  return (
    <SafeAreaView className="bg-app-screen flex-1" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="min-h-full px-6 py-6"
        >
          <View className="mx-auto min-h-full w-full max-w-[440px] justify-between gap-8">
            {hero}
            <View
              className={
                showCard
                  ? "bg-app-card rounded-[28px] px-6 py-8 shadow-lg shadow-black/10"
                  : "gap-6"
              }
            >
              {children}
            </View>
          </View>
        </ScrollView>
        {bottomImage ? (
          <Image
            source={bottomImage}
            contentFit="contain"
            className="absolute bottom-0 right-0 h-32 w-32 opacity-80"
          />
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

- [ ] Implement `AuthTextField` with `TextInput`, lucide icons, `secureTextEntry`, and no new form dependency.

- [ ] Implement `AuthPrimaryButton` as a wrapper around `Button` with class names like `bg-sage-800 rounded-full h-14`.

- [ ] Implement `AuthBackButton` using the existing `Button` and `ChevronLeft` from `lucide-react-native`.

- [ ] Implement `AuthFooterLink` as a `Pressable` + `Text` row using `text-app-profile`.

## Task 6: Login Screen

**Files:**
- Create: `src/features/auth/LoginScreen.tsx`
- Modify: `src/app/auth/login.tsx`

- [ ] Implement the screen:
  - Background food image from `images.authLoginBg`.
  - "Welcome back" heading.
  - Email and password fields.
  - Forgot password link to `/auth/forgot-password`.
  - Login button calls `login({ email, password })`, then `router.replace("/private/(tabs)")`.
  - Google button is visual-only for now.
  - Create account link can be visual-only until signup exists.

```tsx
import { AuthPrimaryButton } from "@/features/auth/components/AuthPrimaryButton";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { AuthTextField } from "@/features/auth/components/AuthTextField";
import { useAuth } from "@/features/auth/useAuth";
import { images } from "@/data/images";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

export function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    await login({ email, password });
    setIsSubmitting(false);
    router.replace("/private/(tabs)");
  };

  return (
    <AuthShell
      showCard
      hero={
        <View className="min-h-64 justify-center">
          <Text className="max-w-48 text-4xl font-bold text-sage-900">
            Welcome back
          </Text>
          <Text className="mt-3 text-base font-medium text-sage-600">
            Ready to cook again?
          </Text>
          <Image
            source={images.authLoginBg}
            contentFit="contain"
            className="absolute right-[-24px] top-0 h-56 w-56"
          />
        </View>
      }
    >
      <View className="gap-4">
        <AuthTextField label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" />
        <AuthTextField label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" secureTextEntry />
        <Pressable onPress={() => router.push("/auth/forgot-password")}>
          <Text className="text-right font-semibold text-app-profile">Forgot password?</Text>
        </Pressable>
        <AuthPrimaryButton disabled={isSubmitting} onPress={submit}>
          Log in
        </AuthPrimaryButton>
      </View>
    </AuthShell>
  );
}
```

- [ ] Route file stays thin:

```tsx
import { LoginScreen } from "@/features/auth/LoginScreen";

export default LoginScreen;
```

## Task 7: Forgot Password Screen

**Files:**
- Create: `src/features/auth/ForgotPasswordScreen.tsx`
- Create: `src/app/auth/forgot-password.tsx`

- [ ] Implement:
  - Back button.
  - Center title/subtitle.
  - Envelope image from `images.authForgotPassword`.
  - Email field.
  - Send code button calls `sendPasswordResetCode(email)` and routes to `/auth/email-otp?email=<encoded>`.
  - Back to login link.

- [ ] Keep logic local; no API call yet.

```tsx
const submit = async () => {
  await sendPasswordResetCode(email);
  router.push({ pathname: "/auth/email-otp", params: { email } });
};
```

## Task 8: Email OTP Screen

**Files:**
- Create: `src/features/auth/EmailOtpScreen.tsx`
- Create: `src/app/auth/email-otp.tsx`

- [ ] Implement six single-character inputs backed by `const [code, setCode] = useState(["", "", "", "", "", ""])`.

- [ ] Use `useLocalSearchParams<{ email?: string }>()` and show a masked email.

```ts
const maskEmail = (email?: string) => {
  if (!email || !email.includes("@")) return "your email";
  const [name, domain] = email.split("@");
  return `${name.slice(0, 3)}***@${domain}`;
};
```

- [ ] Verify button calls `verifyOtp(code.join(""))` and routes to `/auth/create-new-password?email=<encoded>`.

- [ ] Resend text can be static for now; skip countdown unless the design fidelity requires it.

## Task 9: Create New Password Screen

**Files:**
- Create: `src/features/auth/CreateNewPasswordScreen.tsx`
- Create: `src/app/auth/create-new-password.tsx`

- [ ] Implement:
  - Back button.
  - Title/subtitle.
  - Two password fields.
  - Password strength display from a tiny local helper.
  - Update password button validates both fields match, calls `resetPassword`, then routes to `/auth/login`.

```ts
const getPasswordStrength = (password: string) => {
  if (password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)) {
    return "Strong";
  }
  if (password.length >= 6) {
    return "Medium";
  }
  return "Weak";
};
```

- [ ] Use `images.authCreateNewPassword` as the bottom/right decoration if it matches the extracted design asset.

## Task 10: Add Logout Hookup

**Files:**
- Inspect first: `src/app/private/(tabs)/profile.tsx`, `src/features/profile/UserHeader.tsx`
- Modify the smallest existing profile surface that can host logout.

- [ ] If a settings/logout action already exists, wire it to `useAuth().logout()`.

```tsx
const { logout } = useAuth();
const router = useRouter();

const handleLogout = async () => {
  await logout();
  router.replace("/auth/login");
};
```

- [ ] If no logout surface exists, add one understated `Button` to the profile screen. Do not create a settings screen just for logout.

## Task 11: Verification

**Files:**
- All files touched above.

- [ ] Run auth unit tests:

```bash
npx tsx src/features/auth/session.test.ts
npx tsx src/features/auth/tokenStorage.test.ts
```

Expected: both pass.

- [ ] Run existing auth API tests:

```bash
npx tsx src/features/auth/api.test.ts
```

Expected: pass.

- [ ] Run project check:

```bash
npm run check
```

Expected: lint and TypeScript pass.

- [ ] Manual text-only flow:
  - Fresh launch with no tokens redirects `/` to `/auth/login`.
  - Any email/password logs in and lands on `/private/(tabs)`.
  - Force an expired stored session by setting `accessTokenExpiresAt` in the past; relaunch redirects to login and clears tokens.
  - Logout clears tokens and redirects to login.
  - Forgot password -> OTP -> create new password routes work without backend.

## Deferred On Purpose

- Real `/auth/login`, `/auth/forgot-password`, `/auth/verify-email`, and `/auth/reset-password` calls are deferred until TanStack Query integration. Keep all future API work behind provider actions/hooks.
- Access-token refresh-on-401 belongs in one shared API client wrapper, per `server/docs/backend-token-auth.md`; do not implement refresh inside screens.
- Signup UI is out of scope even though the design has a create-account link.
- Resend-code countdown is optional polish; add it only if the static OTP screen feels incomplete after the core flow works.

## Self-Review

- Spec coverage: all four requested screens, persistent login, logout/expired-token return to login, `Stack.Protected`, auth images, token-auth doc, and future TanStack Query boundary are covered.
- Placeholder scan: no `TBD` or broad "handle edge cases" items remain.
- Type consistency: `StoredAuthSession`, `AuthContextValue`, and token storage methods are defined before use.
