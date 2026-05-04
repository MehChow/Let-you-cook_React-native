import CustomTabBar from "@/components/CustomTabBar";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      tabBar={(props) => <CustomTabBar {...props} />}
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        // Allow screens to render behind the floating tab bar.
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
        },
        // Prevent content overlap with the status bar.
        sceneStyle: { paddingTop: insets.top },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
        }}
      />

      <Tabs.Screen
        name="add-recipe"
        options={{
          title: "Add Recipe",
        }}
      />

      <Tabs.Screen
        name="favourites"
        options={{
          title: "Favourites",
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
