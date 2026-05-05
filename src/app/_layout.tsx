import { NAV_THEME } from "@/lib/theme";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import * as Font from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUniwind } from "uniwind";
import "../global.css";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme } = useUniwind();
  const [fontsLoaded, fontError] = Font.useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
    "Inter-ExtraBold": Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={NAV_THEME[theme ?? "light"]}>
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
        <PortalHost />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
