import CustomTabBar from "@/components/CustomTabBar";
import { Add, Home, User } from "@/components/Icon";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      initialRouteName="index"
      screenOptions={{ tabBarActiveTintColor: "blue", headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Home
              size={28}
              color={color}
              fill={focused ? color : "transparent"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="add-recipe"
        options={{
          title: "Add Recipe",
          tabBarIcon: ({ color, focused }) => (
            <Add
              size={28}
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
            <User
              size={28}
              color={color}
              fill={focused ? color : "transparent"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
