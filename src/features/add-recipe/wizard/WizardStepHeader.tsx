import { Text } from "@/components/ui/text";
import { View } from "react-native";

export interface WizardStepHeaderProps {
  preTitle: string;
  title: string;
  description?: string;
}

export function WizardStepHeader({
  preTitle,
  title,
  description,
}: WizardStepHeaderProps) {
  return (
    <View className="gap-1 py-3">
      <Text className="text-xs uppercase tracking-wide text-neutral-500">
        {preTitle}
      </Text>
      <Text className="text-lg font-semibold">{title}</Text>
      {description ? (
        <Text className=" text-[12px] font-semibold text-neutral-400">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
