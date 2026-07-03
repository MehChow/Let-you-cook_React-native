import { Add, Favorite, Home, Search, User } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { colors } from "@/util/twColor";
import { router, Tabs } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_BOTTOM_GAP = 12;

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.sage[600],
        tabBarInactiveTintColor: colors.sage[400],
        tabBarLabelStyle: { fontSize: 11, fontFamily: "Outfit-SemiBold" },
        tabBarActiveBackgroundColor: "transparent",
        tabBarInactiveBackgroundColor: "transparent",
        tabBarStyle: {
          backgroundColor: "white",
          paddingTop: 8,
          paddingBottom: TAB_BAR_BOTTOM_GAP,
          height: 52 + insets.bottom + TAB_BAR_BOTTOM_GAP,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Icon
              as={Home}
              size={24}
              color={color}
              fill={focused ? color : "transparent"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <Icon
              as={Search}
              size={24}
              color={color}
              fill={focused ? color : "transparent"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarLabel: () => null,
          tabBarButton: ({
            children,
            onPress,
            onLongPress,
            accessibilityLabel,
            accessibilityState,
            testID,
          }) => (
            <View className="items-center justify-center" style={{ width: 70 }}>
              <Pressable
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityLabel={accessibilityLabel}
                accessibilityState={accessibilityState}
                testID={testID}
                className="h-14 w-14 items-center justify-center rounded-full bg-sage-600 active:bg-sage-700"
                style={{ transform: [{ translateY: -18 }], elevation: 10 }}
              >
                {children}
              </Pressable>
            </View>
          ),
          tabBarIcon: () => (
            <Icon as={Add} size={32} color="white" fill="transparent" />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/private/add-recipe");
          },
        }}
      />

      <Tabs.Screen
        name="favourites"
        options={{
          title: "Favourites",
          tabBarIcon: ({ color, focused }) => (
            <Icon
              as={Favorite}
              size={24}
              color={color}
              fill={focused ? color : "transparent"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Icon
              as={User}
              size={24}
              color={color}
              fill={focused ? color : "transparent"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
