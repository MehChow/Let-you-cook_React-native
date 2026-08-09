import { Text } from "@/components/ui/text";
import { images } from "@/data/images";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError, toErrorPresentation } from "@/lib/apiError";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LockIcon, MailIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { toast } from "sonner-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { AuthFooterLink } from "./components/AuthFooterLink";
import { AuthPrimaryButton } from "./components/AuthPrimaryButton";
import { AuthShell } from "./components/AuthShell";
import { AuthTextField } from "./components/AuthTextField";
import { loginSchema, toLoginInput, type LoginFormValues } from "./schema";
import { useLogin } from "./useLogin";
import { saveEmailVerificationFlow } from "./emailVerificationState";

// Maps login failures while preserving deliberate local validation messages.
const getErrorMessage = (error: unknown) => {
  const presentation = toErrorPresentation(error);
  return presentation.kind === "unknown" && error instanceof Error
    ? error.message
    : presentation.message;
};

// Renders real credential login and establishes the returned session.
export function LoginScreen() {
  const router = useRouter();
  const { establishSession, requestEmailVerification } = useAuth();
  const { login: requestLogin, isLoggingIn } = useLogin();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Submits normalized credentials and enters the private application.
  const handleSubmit = form.handleSubmit(
    async (values) => {
      const input = toLoginInput(values);
      try {
        const response = await requestLogin(input);
        await establishSession(response);
        router.replace("/private/(tabs)");
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.code === "email_verification_required"
        ) {
          try {
            const challenge = await requestEmailVerification(input.email);
            saveEmailVerificationFlow(input.email, challenge);
            router.replace({
              pathname: "/auth/email-otp",
              params: { purpose: "email-verification" },
            });
            return;
          } catch (requestError) {
            toast.error(getErrorMessage(requestError));
            return;
          }
        }
        toast.error(getErrorMessage(error));
      }
    },
    (errors) => {
      const message = errors.email?.message ?? errors.password?.message;
      toast.error(typeof message === "string" ? message : "Check your login details.");
    },
  );

  return (
    <AuthShell
      decoration={
        <Image
          source={images.authLoginBg2}
          contentFit="contain"
          style={{
            width: 100,
            height: 100,
            opacity: 0.75,
            position: "absolute",
            bottom: 2,
            left: 2,
          }}
        />
      }
    >
      {/* Header */}
      <View className="relative min-h-55 justify-center pr-36">
        <Image
          source={images.authLoginBg}
          contentFit="contain"
          style={{
            height: 400,
            width: 400,
            position: "absolute",
            right: -35,
            top: -50,
          }}
        />
        <Text className="text-3xl font-bold text-sage-800">
          Welcome{"\n"}back
        </Text>
        <Text className="mt-3 text-base font-semibold text-sage-400">
          Ready to cook again?
        </Text>
      </View>

      {/* Login card */}
      <View className="overflow-hidden rounded-4xl bg-app-card/80 px-6 py-6 shadow-lg shadow-black/10">
        <View className="gap-4">
          <Controller
            control={form.control}
            name="email"
            render={({ field }) => (
              <AuthTextField
                label="Email"
                icon={MailIcon}
                value={field.value}
                onChangeText={field.onChange}
                placeholder="name@example.com"
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
              />
            )}
          />
          <Controller
            control={form.control}
            name="password"
            render={({ field }) => (
              <AuthTextField
                label="Password"
                icon={LockIcon}
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Enter your password"
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                secureTextEntry
              />
            )}
          />

          {/* Forgot password */}
          <Pressable
            onPress={() => router.push("/auth/forgot-password")}
            className="self-end active:opacity-70"
          >
            <Text className="text-sm font-semibold text-sage-500">
              Forgot password?
            </Text>
          </Pressable>
          {/* Login button */}
          <AuthPrimaryButton
            label={isLoggingIn ? "Signing in..." : "Log in"}
            onPress={() => void handleSubmit()}
            disabled={isLoggingIn}
          />
        </View>

        {/* Or separator */}
        <View className="my-5 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-neutral-200" />
          <Text className="text-sm text-neutral-400">or</Text>
          <View className="h-px flex-1 bg-neutral-200" />
        </View>

        {/* Google login button */}
        <Pressable
          onPress={() => toast.info("Google sign-in is not part of this demo yet.")}
          className="h-14 flex-row items-center justify-center gap-3 rounded-full border border-sage-200 bg-white active:opacity-80"
        >
          <Image
            source={images.authGoogleLogin}
            contentFit="contain"
            style={{
              height: 24,
              width: 24,
            }}
          />
          <Text className="text-base font-semibold text-sage-900">
            Continue with Google
          </Text>
        </Pressable>

        {/* Create new account helper */}
        <View className="mt-8">
          <AuthFooterLink
            label="New here?"
            actionLabel="Create account"
            onPress={() => router.push("/auth/create-account")}
          />
        </View>
      </View>
    </AuthShell>
  );
}
