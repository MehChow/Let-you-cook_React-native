import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
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
      style={{ paddingBottom: Math.max(insets.bottom, 20) }}
    >
      <View className="flex-row items-center gap-3">
        {showStepBack ? (
          <View style={{ flex: 1 }}>
            <Button
              variant="outline"
              className="h-12 w-full rounded-full border-sage-300 bg-white"
              onPress={onStepBack}
            >
              <Text className="text-center text-base font-semibold leading-6 text-sage-700">
                Back
              </Text>
            </Button>
          </View>
        ) : null}

        <View style={{ flex: 1 }}>
          <Button
            variant="default"
            className={cn(
              "h-12 w-full rounded-full bg-sage-600 active:bg-sage-700",
            )}
            onPress={onPrimary}
            disabled={primaryDisabled}
          >
            <Text className="text-center text-base font-semibold leading-6 text-white">
              {primaryLabel}
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
