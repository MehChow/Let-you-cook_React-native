import { Text } from "@/components/ui/text";
import { images } from "@/data/images";
import { useAuth } from "@/features/auth/useAuth";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LockIcon, MailIcon } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { toast } from "sonner-native";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    try {
      setIsSubmitting(true);
      await login({ email, password });
      router.replace("/private/(tabs)");
    } catch (error) {
      toast.error(getErrorMessage(error));
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
            label={isSubmitting ? "Signing in..." : "Log in"}
            onPress={() => void handleLogin()}
            disabled={isSubmitting}
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
            onPress={() => toast.info("Account creation is not part of this demo yet.")}
          />
        </View>
      </View>
    </AuthShell>
  );
}
