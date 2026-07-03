import { Text } from "@/components/ui/text";
import { images } from "@/data/images";
import { useAuth } from "@/features/auth/useAuth";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { AuthBackButton } from "./components/AuthBackButton";
import { AuthFooterLink } from "./components/AuthFooterLink";
import { AuthOtpField } from "./components/AuthOtpField";
import { AuthPrimaryButton } from "./components/AuthPrimaryButton";
import { AuthShell } from "./components/AuthShell";
import { maskEmailAddress } from "./presentation";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unable to verify the code right now.";

export function EmailOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { verifyOtp } = useAuth();
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await verifyOtp(code);
      router.push({
        pathname: "/auth/create-new-password",
        params: email ? { email } : undefined,
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
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
            <Text className="text-center text-4xl font-bold text-sage-900">
              Verify your email
            </Text>
            <Text className="text-center text-base leading-7 text-sage-700">
              Enter the 6-digit code we sent to
            </Text>
            <Text className="text-lg font-semibold text-sage-900">
              {maskEmailAddress(email)}
            </Text>
          </View>
          <Image
            source={images.authEmailOtp}
            contentFit="contain"
            className="h-40 w-full"
          />
        </View>
        <AuthOtpField value={code} onChangeText={setCode} />
        {errorMessage ? (
          <Text className="text-sm text-danger-600">{errorMessage}</Text>
        ) : null}
        <Text className="text-center text-sm text-sage-700">
          Didn&apos;t receive the code?{" "}
          <Text className="font-semibold text-accent-500">Resend in 00:45</Text>
        </Text>
        <AuthPrimaryButton
          label={isSubmitting ? "Verifying..." : "Verify"}
          onPress={() => void handleContinue()}
          disabled={isSubmitting}
        />
        <AuthFooterLink
          actionLabel="Back to login"
          onPress={() => router.replace("/auth/login")}
          showChevron
        />
      </View>
    </AuthShell>
  );
}
