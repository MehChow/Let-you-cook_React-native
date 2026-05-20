import { Text } from "@/components/ui/text";
import { MAX_STEP_INSTRUCTION_LENGTH } from "@/features/add-recipe/constants";
import { Image } from "expo-image";
import { View } from "react-native";

export interface CookingStepPreviewItem {
  imageUri?: string;
  instruction?: string;
}

export interface CookingStepsPreviewProps {
  steps: CookingStepPreviewItem[];
}

export function CookingStepsPreview({ steps }: CookingStepsPreviewProps) {
  return (
    <View className="gap-4">
      {(steps ?? []).map((step: CookingStepPreviewItem, i: number) => {
        const instructionText = step.instruction?.trim()
          ? step.instruction
          : "No instruction yet";

        return (
          <View
            key={`step-${i}-${step.instruction?.slice(0, 8)}`}
            className="rounded-2xl border border-sage-100 bg-sage-50/50 p-3"
          >
            <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-sage-500">
              Step {i + 1}
            </Text>
            <Text className="text-base">{instructionText}</Text>
            <Text className="mt-1 text-right text-xs text-sage-500">
              {step.instruction?.length ?? 0}/{MAX_STEP_INSTRUCTION_LENGTH}
            </Text>
            {step.imageUri ? (
              <Image
                source={{ uri: step.imageUri }}
                className="mt-2 w-full rounded-xl"
                style={{ aspectRatio: 16 / 9 }}
                contentFit="cover"
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
