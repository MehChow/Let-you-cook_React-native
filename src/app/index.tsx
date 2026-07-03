import { useAuth } from "@/features/auth/useAuth";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isHydrating, isLoggedIn } = useAuth();

  if (isHydrating) {
    return (
      <View className="flex-1 items-center justify-center bg-app-screen">
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={isLoggedIn ? "/private/(tabs)" : "/auth/login"} />;
}
