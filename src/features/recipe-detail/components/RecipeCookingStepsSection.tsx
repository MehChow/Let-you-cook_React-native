import { Text } from "@/components/ui/text";
import type { RecipeDetailCookingStep } from "@/features/recipe-detail/types";
import { Image } from "expo-image";
import * as React from "react";
import { View } from "react-native";
import { RecipeDetailSection } from "./RecipeDetailSection";

interface RecipeCookingStepsSectionProps {
  steps: RecipeDetailCookingStep[];
}

export const RecipeCookingStepsSection: React.FC<RecipeCookingStepsSectionProps> = ({
  steps,
}) => (
  <RecipeDetailSection title="Cooking steps">
    <View className="gap-3">
      {steps.map((step, index) => (
        <View key={step.id} className="gap-2">
          <View className="flex-row items-start gap-3">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-sage-700">
              <Text className="text-xs font-bold text-white">{index + 1}</Text>
            </View>
            <Text className="min-w-0 flex-1 text-xs font-medium text-black">
              {step.instruction}
            </Text>
          </View>

          {step.image ? (
            <Image
              source={step.image}
              contentFit="cover"
              cachePolicy="memory-disk"
              className="ml-9 rounded-lg"
              style={{ aspectRatio: 16 / 9 }}
            />
          ) : null}
        </View>
      ))}
    </View>
  </RecipeDetailSection>
);
