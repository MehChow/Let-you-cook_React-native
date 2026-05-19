import { Text } from "@/components/ui/text";
import { AnimatedRingSegment } from "@/features/add-recipe/components/calories/AnimatedRingSegment";
import {
  RADIUS,
  RING_SIZE,
  SEGMENT_EASING,
  STROKE_WIDTH,
} from "@/features/add-recipe/components/calories/calorieRing.constants";
import type { NutritionSummaryRow } from "@/features/add-recipe/hooks/useCaloriesSection";
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
}

export function NutritionRing({ rows, totalCalories }: NutritionRingProps) {
  const scaleValue = useSharedValue(0.92);

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
          width={RING_SIZE}
          height={RING_SIZE}
          style={{ transform: [{ rotate: "-90deg" }] }}
        >
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke="#b0b6b3"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {rows.map((row) => {
            const segment = (
              <AnimatedRingSegment
                key={row.key}
                color={row.color}
                ratio={row.ratio}
                startRatio={startRatio}
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
          <Text className="text-[28px] font-bold leading-none text-black">
            {totalCalories}
          </Text>
          <Text className="mt-1 text-sm font-semibold text-sage-600">kcal</Text>
        </Animated.View>
      </View>
    </View>
  );
}
