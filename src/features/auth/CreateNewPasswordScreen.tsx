import { Check } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { images } from "@/data/images";
import { useAuth } from "@/features/auth/useAuth";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LockIcon } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { AuthBackButton } from "./components/AuthBackButton";
import { AuthFooterLink } from "./components/AuthFooterLink";
import { AuthPrimaryButton } from "./components/AuthPrimaryButton";
import { AuthShell } from "./components/AuthShell";
import { AuthTextField } from "./components/AuthTextField";
import { getPasswordStrength } from "./presentation";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unable to update your password right now.";

export function CreateNewPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordStrength = getPasswordStrength(password);

  const handleResetPassword = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await resetPassword({ password, confirmPassword });
      router.replace("/auth/login");
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
          source={images.authCreateNewPassword}
          contentFit="contain"
          style={{
            width: 144,
            height: 144,
            opacity: 0.8,
            position: "absolute",
            right: 0,
            bottom: 12,
          }}
        />
      }
    >
      <View className="gap-8 pt-2">
        <AuthBackButton onPress={() => router.back()} />
        <View className="items-center gap-2">
          <Text className="text-center text-4xl font-bold text-sage-900">
            Create new password
          </Text>
          <Text className="text-center text-base leading-7 text-sage-700">
            Choose a strong password to keep your account safe.
          </Text>
        </View>
        <View className="gap-4">
          <AuthTextField
            label="New password"
            icon={LockIcon}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter new password"
            autoComplete="new-password"
            textContentType="newPassword"
            secureTextEntry
          />
          <AuthTextField
            label="Confirm password"
            icon={LockIcon}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            autoComplete="new-password"
            textContentType="newPassword"
            secureTextEntry
          />
          <View className="gap-3">
            <Text className="text-base font-semibold text-sage-900">
              Password strength
            </Text>
            <View className="flex-row gap-2">
              {Array.from({ length: 4 }, (_, index) => (
                <View
                  key={index}
                  className={
                    index < passwordStrength.activeSegments
                      ? "h-1.5 flex-1 rounded-full bg-sage-700"
                      : "h-1.5 flex-1 rounded-full bg-sage-200"
                  }
                />
              ))}
            </View>
            <Text className="text-sm font-semibold text-sage-700">
              {passwordStrength.label}
            </Text>
            <View className="flex-row items-center gap-3 rounded-2xl bg-sage-100 px-4 py-3">
              <View className="size-8 items-center justify-center rounded-full bg-white">
                <Icon as={Check} className="size-4 text-sage-700" />
              </View>
              <Text className="min-w-0 flex-1 text-sm leading-5 text-sage-700">
                Use 8+ characters with a mix of letters, numbers and symbols.
              </Text>
            </View>
          </View>
        </View>
        {errorMessage ? (
          <Text className="text-sm text-danger-600">{errorMessage}</Text>
        ) : null}
        <AuthPrimaryButton
          label={isSubmitting ? "Updating..." : "Update password"}
          onPress={() => void handleResetPassword()}
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
