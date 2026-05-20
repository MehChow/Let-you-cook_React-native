import "@/global.css";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import { useUniwind } from "uniwind";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme } = useUniwind();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack initialRouteName="(tabs)">
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-recipe/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-recipe/preview"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="modal"
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
          name="filters"
          options={{
            headerShown: false,
            presentation: "formSheet",
            sheetAllowedDetents: [0.62],
            sheetExpandsWhenScrolledToEdge: false,
            sheetCornerRadius: 24,
          }}
        />
      </Stack>
      <Toaster />
      <PortalHost />
    </GestureHandlerRootView>
  );
}
