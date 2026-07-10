import { Text } from "@/components/ui/text";
import { images } from "@/data/images";
import {
  usePasswordResetResume,
  usePasswordResetCooldown,
  useSendPasswordResetCode,
} from "@/features/auth/useSendPasswordResetCode";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MailIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { toast } from "sonner-native";

import { AuthBackButton } from "./components/AuthBackButton";
import { AuthFooterLink } from "./components/AuthFooterLink";
import { AuthPrimaryButton } from "./components/AuthPrimaryButton";
import { AuthShell } from "./components/AuthShell";
import { AuthTextField } from "./components/AuthTextField";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unable to send the code right now.";

const formatCountdown = (remainingSeconds: number) => {
  const minutes = Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (remainingSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
};

export function ForgotPasswordScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { sendCode, isSending } = useSendPasswordResetCode();
  const { remainingSeconds, isCoolingDown } = usePasswordResetCooldown();
  const { pendingEmail, shouldResume } = usePasswordResetResume();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (mode !== "another-email" && shouldResume && pendingEmail) {
      router.replace({
        pathname: "/auth/email-otp",
        params: { email: pendingEmail },
      });
    }
  }, [mode, pendingEmail, router, shouldResume]);

  const handleContinue = async () => {
    try {
      const nextEmail = email.trim();
      await sendCode(nextEmail);
      router.push({
        pathname: "/auth/email-otp",
        params: { email: nextEmail },
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
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
            <Text className="text-center text-3xl font-bold text-sage-900">
              Forgot password?
            </Text>
            <Text className="text-center text-base leading-5 text-sage-700">
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
          <AuthPrimaryButton
            label={
              isSending
                ? "Sending..."
                : isCoolingDown
                  ? `Available in ${formatCountdown(remainingSeconds)}`
                  : "Send code"
            }
            onPress={() => void handleContinue()}
            disabled={isSending || isCoolingDown}
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
