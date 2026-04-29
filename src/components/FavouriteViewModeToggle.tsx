import { Grid, List } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export type FavouriteViewMode = "grid" | "list";

export interface FavouriteViewModeToggleProps {
  mode: FavouriteViewMode;
  onModeChange: (mode: FavouriteViewMode) => void;
  className?: string;
}

/** Figma: sage-700 track */
const TRACK_CLASS = "bg-sage-700";

// Segmented pill geometry (sliding white stadium behind the selected icon).
const TRACK_HEIGHT = 32;
const TRACK_WIDTH = 80;
const PAD_H = 3;
const PAD_V = 3;
const PILL_WIDTH = (TRACK_WIDTH - 2 * PAD_H) / 2;
const PILL_HEIGHT = TRACK_HEIGHT - 2 * PAD_V;
const PILL_RADIUS = PILL_HEIGHT / 2;

const FavouriteViewModeToggle: React.FC<FavouriteViewModeToggleProps> = ({
  mode,
  onModeChange,
  className,
}) => {
  const modeIndex = useSharedValue(mode === "grid" ? 0 : 1);

  React.useEffect(() => {
    modeIndex.value = withTiming(mode === "grid" ? 0 : 1, {
      duration: 220,
    });
  }, [mode]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: PILL_RADIUS,
    top: PAD_V,
    left: PAD_H,
    transform: [
      {
        translateX: modeIndex.value * PILL_WIDTH,
      },
    ],
  }));

  return (
    <View
      className={cn("relative", TRACK_CLASS, className)}
      style={[
        {
          elevation: 3,
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
        },
      ]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Recipe view layout"
    >
      <View className="absolute inset-0 overflow-hidden rounded-full">
        <View className="absolute inset-0 flex-row">
          <Animated.View
            pointerEvents="none"
            className="absolute bg-white"
            style={indicatorStyle}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Grid view"
            accessibilityState={{ selected: mode === "grid" }}
            onPress={() => onModeChange("grid")}
            className="z-10 flex-1 items-center justify-center active:opacity-90"
          >
            <Icon
              as={Grid}
              className={cn(
                "size-4",
                mode === "grid" ? "text-sage-700" : "text-white"
              )}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="List view"
            accessibilityState={{ selected: mode === "list" }}
            onPress={() => onModeChange("list")}
            className="z-10 flex-1 items-center justify-center active:opacity-90"
          >
            <Icon
              as={List}
              className={cn(
                "size-4",
                mode === "list" ? "text-sage-700" : "text-white"
              )}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default FavouriteViewModeToggle;
