import { Text } from "@/components/ui/text";
import { images } from "@/data/images";
import { toErrorPresentation } from "@/lib/apiError";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LockIcon, MailIcon, UserIcon } from "lucide-react-native";
import { View } from "react-native";
import { useEffect } from "react";

import { AuthBackButton } from "./components/AuthBackButton";
import { AuthFooterLink } from "./components/AuthFooterLink";
import { AuthPrimaryButton } from "./components/AuthPrimaryButton";
import { AuthShell } from "./components/AuthShell";
import { AuthTextField } from "./components/AuthTextField";
import { createAccountSchema, toSignUpInput, type CreateAccountFormValues } from "./schema";
import { useCreateAccount } from "./useCreateAccount";
import {
  saveEmailVerificationFlow,
  useEmailVerificationFlow,
} from "./emailVerificationState";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner-native";

// Maps account-creation failures through the shared safe presentation policy.
const getErrorMessage = (error: unknown) => {
  const presentation = toErrorPresentation(error);
  return presentation.kind === "unknown" && error instanceof Error
    ? error.message
    : presentation.message;
};

export function CreateAccountScreen() {
  const router = useRouter();
  const { createAccount, isCreating } = useCreateAccount();
  const { flow: pendingVerification } = useEmailVerificationFlow();
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

  useEffect(() => {
    if (pendingVerification) {
      router.replace({
        pathname: "/auth/email-otp",
        params: { purpose: "email-verification" },
      });
    }
  }, [pendingVerification, router]);

  const handleSubmit = form.handleSubmit(
    async (values) => {
      try {
        const response = await createAccount(toSignUpInput(values));
        saveEmailVerificationFlow(values.email, response);
        toast.success("Check your email for the verification code.");
        router.replace({
          pathname: "/auth/email-otp",
          params: { purpose: "email-verification" },
        });
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
    (errors) => {
      const firstError = [
        errors.name,
        errors.email,
        errors.password,
        errors.confirmPassword,
      ].find((error) => error?.message);
      const message = firstError?.message;

      toast.error(typeof message === "string" ? message : "Check your account details.");
    },
  );

  return (
    <AuthShell
      decoration={
        <Image
          source={images.authCreateAccount}
          contentFit="contain"
          style={{
            width: 150,
            height: 150,
            opacity: 0.5,
            position: "absolute",
            right: -10,
            bottom: -6,
            transform: [{ rotate: "8deg" }],
          }}
        />
      }
    >
      <View className="gap-7 pt-2">
        <AuthBackButton onPress={() => router.back()} />

        {/* Header */}
        <View className="items-center gap-2">
          <Text className="text-center text-3xl font-bold text-sage-900">
            Create your account
          </Text>
          <Text className="text-center text-base leading-5 text-sage-700">
            Start your delicious journey with us.
          </Text>
        </View>

        {/* Account fields */}
        <View className="gap-4">
          <Controller
            control={form.control}
            name="name"
            render={({ field }) => (
              <AuthTextField
                label="Name"
                icon={UserIcon}
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Your name"
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
              />
            )}
          />
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
                autoComplete="new-password"
                textContentType="newPassword"
                secureTextEntry
              />
            )}
          />
          <Controller
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <AuthTextField
                label="Confirm password"
                icon={LockIcon}
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
                textContentType="newPassword"
                secureTextEntry
              />
            )}
          />
        </View>

        <AuthPrimaryButton
          label={isCreating ? "Creating..." : "Create account"}
          onPress={() => void handleSubmit()}
          disabled={isCreating}
        />
        <AuthFooterLink
          label="Already have an account?"
          actionLabel="Log in"
          onPress={() => router.replace("/auth/login")}
        />
      </View>
    </AuthShell>
  );
}
