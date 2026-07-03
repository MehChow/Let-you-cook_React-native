import { Text } from "@/components/ui/text";
import { images } from "@/data/images";
import { useAuth } from "@/features/auth/useAuth";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LockIcon, MailIcon } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { AuthFooterLink } from "./components/AuthFooterLink";
import { AuthPrimaryButton } from "./components/AuthPrimaryButton";
import { AuthShell } from "./components/AuthShell";
import { AuthTextField } from "./components/AuthTextField";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unable to log in right now.";

export function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await login({ email, password });
      router.replace("/private/(tabs)");
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
          source={images.authLoginBg2}
          contentFit="contain"
          className="absolute bottom-2 left-0 h-24 w-24 opacity-80"
        />
      }
    >
      <View className="gap-6 pt-4">
        <View className="relative min-h-[220px] justify-center pr-36">
          <Image
            source={images.authLoginBg}
            contentFit="contain"
            className="absolute -right-10 -top-10 h-[260px] w-[260px]"
          />
          <Text className="text-5xl font-bold leading-[52px] text-sage-900">
            Welcome{"\n"}back
          </Text>
          <Text className="mt-3 text-xl text-sage-600">
            Ready to cook again?
          </Text>
        </View>
        <View className="overflow-hidden rounded-[32px] bg-app-card px-6 py-6 shadow-sm shadow-black/10">
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
            <AuthTextField
              label="Password"
              icon={LockIcon}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              secureTextEntry
            />
            <Pressable
              onPress={() => router.push("/auth/forgot-password")}
              className="self-end active:opacity-70"
            >
              <Text className="text-sm font-semibold text-sage-700">
                Forgot password?
              </Text>
            </Pressable>
            {errorMessage ? (
              <Text className="text-sm text-danger-600">{errorMessage}</Text>
            ) : null}
            <AuthPrimaryButton
              label={isSubmitting ? "Signing in..." : "Log in"}
              onPress={() => void handleLogin()}
              disabled={isSubmitting}
            />
          </View>
          <View className="my-5 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-sage-200" />
            <Text className="text-sm text-sage-500">or</Text>
            <View className="h-px flex-1 bg-sage-200" />
          </View>
          <Pressable
            onPress={() =>
              setErrorMessage("Google sign-in is not part of this demo yet.")
            }
            className="h-14 flex-row items-center justify-center gap-3 rounded-full border border-sage-200 bg-white active:opacity-80"
          >
            <Text className="text-lg font-bold text-sage-700">G</Text>
            <Text className="text-base font-semibold text-sage-900">
              Continue with Google
            </Text>
          </Pressable>
          <View className="mt-8">
            <AuthFooterLink
              label="New here?"
              actionLabel="Create account"
              onPress={() =>
                setErrorMessage("Account creation is not part of this demo yet.")
              }
            />
          </View>
        </View>
      </View>
    </AuthShell>
  );
}
