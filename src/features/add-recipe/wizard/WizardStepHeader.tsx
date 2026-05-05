import { Text } from "@/components/ui/text";
import { View } from "react-native";

export interface WizardStepHeaderProps {
  /** e.g. "STEP 1 — THE BASICS" */
  preTitle: string;
  title: string;
  description?: string;
  /** e.g. `3 / 20` for ingredient or step caps */
  counterLabel?: string;
}

export function WizardStepHeader({
  preTitle,
  title,
  description,
  counterLabel,
}: WizardStepHeaderProps) {
  return (
    <View className="pt-3 pb-6 gap-1">
      <View className="flex-row items-start justify-between gap-2">
        <Text className="text-xs font-bold uppercase tracking-wide text-neutral-500">
          {preTitle}
        </Text>
        {counterLabel ? (
          <Text className="text-xs font-semibold text-sage-500">
            {counterLabel}
          </Text>
        ) : null}
      </View>
      <Text className="text-lg font-bold">{title}</Text>
      {description ? (
        <Text className="text-[10px] font-semibold text-neutral-400">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
