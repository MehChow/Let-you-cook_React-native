import { Text } from "@/components/ui/text";
import {
  TOTAL_WIZARD_STEPS,
  WIZARD_STEPPER_LABELS,
} from "@/features/add-recipe/constants";
import { View } from "react-native";

export interface WizardStepIndicatorProps {
  currentStepIndex: number;
}

export function WizardStepIndicator({
  currentStepIndex,
}: WizardStepIndicatorProps) {
  return (
    <View className="px-3 py-2">
      <View className="flex-row items-end justify-between gap-1">
        {Array.from({ length: TOTAL_WIZARD_STEPS }).map((_, i) => {
          const active = i === currentStepIndex;
          const done = i < currentStepIndex;
          const filled = done || active;
          return (
            <View key={i} className="min-w-0 flex-1 items-center gap-1.5">
              <View
                className={`w-full rounded-full ${
                  active
                    ? "h-1.5 bg-sage-800"
                    : filled
                    ? "h-1 bg-sage-700"
                    : "h-1 bg-neutral-200"
                }`}
              />
              <Text
                numberOfLines={1}
                className={`w-full text-center text-[10px] font-semibold ${
                  active
                    ? "font-bold text-sage-700"
                    : done
                    ? "text-sage-600"
                    : "text-neutral-400"
                }`}
              >
                {WIZARD_STEPPER_LABELS[i]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
