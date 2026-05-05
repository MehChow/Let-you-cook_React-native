import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface WizardFooterActionsProps {
  showStepBack: boolean;
  primaryLabel: string;
  onStepBack: () => void;
  onPrimary: () => void;
  primaryDisabled?: boolean;
}

export function WizardFooterActions({
  showStepBack,
  primaryLabel,
  onStepBack,
  onPrimary,
  primaryDisabled,
}: WizardFooterActionsProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-t border-sage-200/80 bg-sage-100 px-4 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      <View className="flex-row gap-3">
        {showStepBack ? (
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-xl border-sage-300 bg-white"
            onPress={onStepBack}
          >
            <Text className="text-base font-semibold text-sage-700">Back</Text>
          </Button>
        ) : null}
        <Button
          variant="default"
          className={`h-12 rounded-xl bg-sage-600 active:bg-sage-700 ${showStepBack ? "flex-1" : "w-full"}`}
          onPress={onPrimary}
          disabled={primaryDisabled}
        >
          <Text className="text-base font-semibold text-white">{primaryLabel}</Text>
        </Button>
      </View>
    </View>
  );
}
