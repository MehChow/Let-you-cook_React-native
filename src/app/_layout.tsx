import "@/global.css";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";

void SplashScreen.preventAutoHideAsync();

const isLoggedIn = false;

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />

        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="auth/login" />
        </Stack.Protected>

        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen
            name="private/(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="private/add-recipe/index" />
          <Stack.Screen name="private/add-recipe/preview" />
          <Stack.Screen name="private/recipe/[recipeId]" />
          <Stack.Screen
            name="private/recipe/[recipeId]/reviews"
            options={{
              presentation: "formSheet",
              sheetAllowedDetents: [0.6],
              sheetExpandsWhenScrolledToEdge: false,
              sheetCornerRadius: 24,
            }}
          />
          <Stack.Screen
            name="private/modal"
            options={{
              presentation: "formSheet",
              sheetAllowedDetents: [0.7],
              // Prevent the scroll view "pull down" gesture from being interpreted
              // as a sheet drag-to-dismiss.
              sheetExpandsWhenScrolledToEdge: false,
              sheetCornerRadius: 24,
            }}
          />
          <Stack.Screen
            name="private/filters"
            options={{
              presentation: "formSheet",
              sheetAllowedDetents: [0.62],
              sheetExpandsWhenScrolledToEdge: false,
              sheetCornerRadius: 24,
            }}
          />
        </Stack.Protected>
      </Stack>
      <Toaster />
      <PortalHost />
    </GestureHandlerRootView>
  );
}
