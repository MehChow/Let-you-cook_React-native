import { Text } from "@/components/ui/text";
import { AnimatedRingSegment } from "@/features/add-recipe/components/calories/AnimatedRingSegment";
import { SEGMENT_EASING } from "@/features/add-recipe/components/calories/calorieRing.constants";
import type { NutritionSummaryRow } from "@/features/add-recipe/hooks/useCaloriesSection";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

export interface NutritionRingProps {
  rows: NutritionSummaryRow[];
  totalCalories: number;
  compact?: boolean;
}

const DEFAULT_RING_SIZE = 144;
const DEFAULT_STROKE_WIDTH = 9;
const COMPACT_RING_SIZE = 128;
const COMPACT_STROKE_WIDTH = 8;

export function NutritionRing({
  rows,
  totalCalories,
  compact = false,
}: NutritionRingProps) {
  const scaleValue = useSharedValue(0.92);
  const ringSize = compact ? COMPACT_RING_SIZE : DEFAULT_RING_SIZE;
  const strokeWidth = compact ? COMPACT_STROKE_WIDTH : DEFAULT_STROKE_WIDTH;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    scaleValue.value = withTiming(totalCalories > 0 ? 1 : 0.92, {
      duration: 300,
      easing: SEGMENT_EASING,
    });
  }, [scaleValue, totalCalories]);

  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  let startRatio = 0;

  return (
    <View className="items-center justify-center">
      <View className="items-center justify-center">
        <Svg
          width={ringSize}
          height={ringSize}
          style={{ transform: [{ rotate: "-90deg" }] }}
        >
          <Circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke="#b0b6b3"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {rows.map((row) => {
            const segment = (
              <AnimatedRingSegment
                key={row.key}
                color={row.color}
                ratio={row.ratio}
                startRatio={startRatio}
                circumference={circumference}
                radius={radius}
                ringSize={ringSize}
                strokeWidth={strokeWidth}
              />
            );
            startRatio += row.ratio;
            return segment;
          })}
        </Svg>

        <Animated.View
          style={labelStyle}
          className="absolute items-center justify-center"
        >
          <Text
            className={cn(
              "font-bold leading-none text-black",
              compact ? "text-[24px]" : "text-[28px]",
            )}
          >
            {totalCalories}
          </Text>
          <Text
            className={cn(
              "mt-1 font-semibold text-sage-600",
              compact ? "text-xs" : "text-sm",
            )}
          >
            kcal
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}
