import {
  Add,
  Favorite as FavoriteIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  User as UserIcon,
} from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { colors } from "@/util/twColor";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVE = colors.sage[600];
const INACTIVE = colors.sage[400];

function TabRouteIcon({
  routeName,
  focused,
}: {
  routeName: string;
  focused: boolean;
}) {
  const color = focused ? ACTIVE : INACTIVE;
  const fill = focused ? color : "transparent";
  switch (routeName) {
    case "index":
      return <Icon as={HomeIcon} size={24} color={color} fill={fill} />;
    case "search":
      return <Icon as={SearchIcon} size={24} color={color} fill={fill} />;
    case "favourites":
      return <Icon as={FavoriteIcon} size={24} color={color} fill={fill} />;
    case "profile":
      return <Icon as={UserIcon} size={24} color={color} fill={fill} />;
    default:
      return <Icon as={HomeIcon} size={24} color={color} fill={fill} />;
  }
}

/** Android elevation (shadow* props are iOS-only; this app targets Android). */
const barElevationStyle = { elevation: 6 as const };
const fabElevationStyle = { elevation: 10 as const };

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const addTabFocused = state.routes[state.index]?.name === "add-recipe";

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 overflow-visible"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View className="relative mx-5 overflow-visible">
        <View
          className="h-16 flex-row items-center justify-between rounded-3xl border border-gray-100 bg-white px-2"
          style={barElevationStyle}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const label =
              typeof options.tabBarLabel === "string"
                ? options.tabBarLabel
                : options.title ?? route.name;

            if (route.name === "add-recipe") {
              return <View key={route.key} className="w-14" />;
            }

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={() => navigation.navigate(route.name)}
                className="flex-1 items-center justify-center gap-1 py-2 active:opacity-70"
              >
                <TabRouteIcon routeName={route.name} focused={isFocused} />
                <Text
                  className={`max-w-full text-[11px] ${
                    isFocused
                      ? "font-semibold text-sage-600"
                      : "font-normal text-sage-400"
                  }`}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add recipe"
          onPress={() => navigation.navigate("add-recipe")}
          className="absolute left-1/2 z-2 h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-sage-600 active:opacity-90"
          style={[{ top: -20 }, fabElevationStyle]}
        >
          <Icon
            as={Add}
            size={32}
            color="white"
            fill={addTabFocused ? "white" : "transparent"}
          />
        </Pressable>
      </View>
    </View>
  );
}
