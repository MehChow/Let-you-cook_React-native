import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useUniwind } from "uniwind";
import "../global.css";

export default function RootLayout() {
  const { theme } = useUniwind();

  return (
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
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}
