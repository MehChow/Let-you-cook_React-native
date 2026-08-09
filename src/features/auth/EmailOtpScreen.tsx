import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { images } from "@/data/images";
import { useAuth } from "@/features/auth/useAuth";
import { toErrorPresentation } from "@/lib/apiError";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { toast } from "sonner-native";

import { AuthBackButton } from "./components/AuthBackButton";
import { AuthFooterLink } from "./components/AuthFooterLink";
import { AuthOtpField } from "./components/AuthOtpField";
import { AuthPrimaryButton } from "./components/AuthPrimaryButton";
import { AuthShell } from "./components/AuthShell";
import { maskEmailAddress } from "./presentation";
import {
  clearEmailVerificationFlow,
  saveEmailVerificationFlow,
  useEmailVerificationFlow,
} from "./emailVerificationState";
import {
  usePasswordResetCooldown,
  usePasswordResetResume,
  useSendPasswordResetCode,
} from "./useSendPasswordResetCode";

// Maps verification failures through the shared safe presentation policy.
const getErrorMessage = (error: unknown) => {
  const presentation = toErrorPresentation(error);
  return presentation.kind === "unknown" && error instanceof Error
    ? error.message
    : presentation.message;
};

const formatCountdown = (remainingSeconds: number) => {
  const minutes = Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (remainingSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
};

export function EmailOtpScreen() {
  const router = useRouter();
  const { email, purpose } = useLocalSearchParams<{
    email?: string;
    purpose?: string;
  }>();
  const isEmailVerification = purpose === "email-verification";
  const {
    confirmEmailVerification,
    requestEmailVerification,
    verifyOtp,
  } = useAuth();
  const { sendCode, isSending } = useSendPasswordResetCode();
  const passwordResetCooldown = usePasswordResetCooldown();
  const passwordResetFlow = usePasswordResetResume();
  const emailVerification = useEmailVerificationFlow();
  const activeEmail = isEmailVerification
    ? emailVerification.flow?.email
    : email ?? passwordResetFlow.pendingEmail ?? undefined;
  const remainingSeconds = isEmailVerification
    ? emailVerification.remainingSeconds
    : passwordResetCooldown.remainingSeconds;
  const isCoolingDown = isEmailVerification
    ? remainingSeconds > 0
    : passwordResetCooldown.isCoolingDown;
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const isResendPending = isSending || isResending;

  const handleUseAnotherEmail = () => {
    if (isEmailVerification) {
      clearEmailVerificationFlow();
      router.replace("/auth/create-account");
      return;
    }

    router.dismissTo({
      pathname: "/auth/forgot-password",
      params: { mode: "another-email" },
    });
  };

  const handleResend = async () => {
    if (!activeEmail) {
      toast.error("Unable to resend the code without an email address.");
      return;
    }

    try {
      if (isEmailVerification) {
        setIsResending(true);
        const challenge = await requestEmailVerification(activeEmail);
        saveEmailVerificationFlow(activeEmail, challenge);
      } else {
        await sendCode(activeEmail);
      }
      toast.success("A new code was sent.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);
      if (isEmailVerification) {
        const challengeId = emailVerification.flow?.challengeId;
        if (!challengeId) {
          throw new Error("Request a new verification code.");
        }
        await confirmEmailVerification({ challengeId, code });
        clearEmailVerificationFlow();
        router.replace("/private/(tabs)");
      } else {
        const challengeId = passwordResetFlow.pendingChallengeId;
        if (!challengeId) {
          throw new Error("Request a new password reset code.");
        }
        await verifyOtp({ challengeId, code });
        router.push({
          pathname: "/auth/create-new-password",
          params: email ? { email } : undefined,
        });
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <View className="gap-8 pt-2">
        <AuthBackButton onPress={() => router.back()} />
        <View className="items-center gap-4">
          <View className="items-center gap-2">
            <Text className="text-center text-3xl font-bold text-sage-900">
              Verify your email
            </Text>
            <Text className="text-center text-base leading-7 text-sage-700">
              Enter the 6-digit code we sent to
            </Text>
            <Text className="text-lg font-semibold text-sage-900">
              {maskEmailAddress(activeEmail)}
            </Text>
          </View>
          <Image
            source={images.authEmailOtp}
            contentFit="contain"
            style={{
              width: "100%",
              height: 160,
            }}
          />
        </View>
        <AuthOtpField value={code} onChangeText={setCode} />
        <View className="flex-row justify-center">
          <Text className="text-center text-sm text-sage-700">
            Didn&apos;t receive the code?{" "}
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={isCoolingDown || isResendPending}
            onPress={() => void handleResend()}
          >
            <Text
              className={
                isCoolingDown
                  ? "text-sm font-semibold text-accent-500"
                  : "text-sm font-semibold text-sage-600"
              }
            >
              {isResendPending
                ? "Sending..."
                : isCoolingDown
                ? `Resend in ${formatCountdown(remainingSeconds)}`
                : "Resend code"}
            </Text>
          </Pressable>
        </View>

        <View className="gap-2">
          <AuthPrimaryButton
            label={isSubmitting ? "Verifying..." : "Verify"}
            onPress={() => void handleContinue()}
            disabled={isSubmitting}
          />
          <Button
            variant="outline"
            onPress={handleUseAnotherEmail}
            className="h-12 rounded-full border-sage-300 bg-white active:bg-sage-100"
          >
            <Text className="text-base font-semibold text-sage-600">
              Use another email
            </Text>
          </Button>
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
