import { Text } from "@/components/ui/text";
import type { RecipeDetailNutrition } from "@/features/recipe-detail/types";
import * as React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { RecipeDetailSection } from "./RecipeDetailSection";

interface RecipeNutritionSectionProps {
  nutrition: RecipeDetailNutrition;
}

const RING_SIZE = 150;
const STROKE_WIDTH = 8;

export const RecipeNutritionSection: React.FC<RecipeNutritionSectionProps> = ({
  nutrition,
}) => {
  const radius = (RING_SIZE - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalMacroGrams = nutrition.macros.reduce(
    (sum, macro) => sum + macro.grams,
    0,
  );
  const segmentStartRatios: number[] = [];
  let currentRatio = 0;
  for (const macro of nutrition.macros) {
    const ratio = totalMacroGrams > 0 ? macro.grams / totalMacroGrams : 0;
    segmentStartRatios.push(currentRatio);
    currentRatio += ratio;
  }

  const sourceBadge = (
    <View className="rounded-full bg-sage-500 px-4 py-1">
      <Text className="text-[10px] font-bold uppercase text-white">
        {nutrition.source}
      </Text>
    </View>
  );

  return (
    <RecipeDetailSection title="Nutritional information" action={sourceBadge}>
      <View className="flex-row items-center justify-between gap-5 py-2">
        <View className="items-center justify-center">
          <Svg
            width={RING_SIZE}
            height={RING_SIZE}
            style={{ transform: [{ rotate: "-90deg" }] }}
          >
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={radius}
              stroke="#e3e3e4"
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {nutrition.macros.map((macro, index) => {
              const ratio =
                totalMacroGrams > 0 ? macro.grams / totalMacroGrams : 0;
              const dashOffset = circumference * (1 - ratio);
              const rotation = (segmentStartRatios[index] ?? 0) * 360;

              return (
                <Circle
                  key={macro.key}
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={radius}
                  stroke={macro.color}
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="butt"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  fill="none"
                  origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                  rotation={rotation}
                />
              );
            })}
          </Svg>

          <View className="absolute flex-row items-end justify-center gap-1">
            <Text className="text-[32px] font-bold text-sage-800">
              {nutrition.totalCalories}
            </Text>
            <Text className="mb-1 text-xs font-bold text-sage-800">kcal</Text>
          </View>
        </View>

        <View className="min-w-0 flex-1 gap-5">
          {nutrition.macros.map((macro) => (
            <View key={macro.key} className="flex-row items-center gap-3">
              <View
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: macro.color }}
              />
              <Text className="flex-1 text-base font-semibold text-black">
                {macro.label}
              </Text>
              <Text className="text-base font-bold text-black">
                {macro.grams}g
              </Text>
            </View>
          ))}
        </View>
      </View>
    </RecipeDetailSection>
  );
};
