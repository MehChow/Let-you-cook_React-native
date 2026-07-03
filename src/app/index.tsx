// src/app/index.tsx
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [loading, setLoading] = useState(true);
  // Replace with your real hook, e.g., const { isLoggedIn } = useAuth();
  const isLoggedIn = false;

  useEffect(() => {
    // Hide splash screen once your auth state is verified
    const prepare = async () => {
      setLoading(false);
      await SplashScreen.hideAsync();
    };
    prepare();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Fallback anchor redirect based on the exact same guard conditions
  return isLoggedIn ? (
    <Redirect href="/private/(tabs)" />
  ) : (
    <Redirect href="/auth/login" />
  );
}
