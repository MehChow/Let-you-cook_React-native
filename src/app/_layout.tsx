import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { queryClient } from "@/lib/queryClient";
import "@/global.css";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";

void SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { isHydrating, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isHydrating) {
      void SplashScreen.hideAsync();
    }
  }, [isHydrating]);

  if (isHydrating) {
    return (
      <View className="flex-1 items-center justify-center bg-app-screen">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="auth" />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="private" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="dark" />
          <RootStack />
          <Toaster position="top-center" />
          <PortalHost />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
