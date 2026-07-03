import { Text } from "@/components/ui/text";
import { images } from "@/data/images";
import { useAuth } from "@/features/auth/useAuth";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { MailIcon } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { AuthBackButton } from "./components/AuthBackButton";
import { AuthFooterLink } from "./components/AuthFooterLink";
import { AuthPrimaryButton } from "./components/AuthPrimaryButton";
import { AuthShell } from "./components/AuthShell";
import { AuthTextField } from "./components/AuthTextField";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unable to send the code right now.";

export function ForgotPasswordScreen() {
  const router = useRouter();
  const { sendPasswordResetCode } = useAuth();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      const nextEmail = email.trim();
      await sendPasswordResetCode(nextEmail);
      router.push({ pathname: "/auth/email-otp", params: { email: nextEmail } });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      decoration={
        <Image
          source={images.authForgotPassword2}
          contentFit="contain"
          style={{
            width: 112,
            height: 112,
            opacity: 0.8,
            position: "absolute",
            right: 12,
            bottom: 12,
          }}
        />
      }
    >
      <View className="gap-8 pt-2">
        <AuthBackButton onPress={() => router.back()} />
        <View className="items-center gap-4">
          <View className="items-center gap-2">
            <Text className="text-center text-4xl font-bold text-sage-900">
              Forgot password?
            </Text>
            <Text className="text-center text-base leading-7 text-sage-700">
              No worries! Enter your email and we&apos;ll send you a code to
              reset your password.
            </Text>
          </View>
          <Image
            source={images.authForgotPassword}
            contentFit="contain"
            style={{
              width: 224,
              height: 192,
            }}
          />
        </View>
        <View className="gap-4">
          <AuthTextField
            label="Email"
            icon={MailIcon}
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
          />
          {errorMessage ? (
            <Text className="text-sm text-danger-600">{errorMessage}</Text>
          ) : null}
          <AuthPrimaryButton
            label={isSubmitting ? "Sending..." : "Send code"}
            onPress={() => void handleContinue()}
            disabled={isSubmitting}
          />
        </View>
        <AuthFooterLink
          actionLabel="Back to login"
          onPress={() => router.replace("/auth/login")}
          showChevron
        />
      </View>
    </AuthShell>
  );
}
