import { ChevronLeft, Preview as PreviewIcon } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { colors } from "@/util/twColor";
import { Pressable, View } from "react-native";

export interface WizardTopBarProps {
  /** Center title: "Create Recipe" in wizard mode, "Preview" in preview mode */
  title: string;
  previewActive: boolean;
  onExit: () => void;
  onTogglePreview: () => void;
}

export function WizardTopBar({
  title,
  previewActive,
  onExit,
  onTogglePreview,
}: WizardTopBarProps) {
  return (
    <View className="px-3 py-4">
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close add recipe"
          hitSlop={12}
          onPress={onExit}
          className="h-9 w-9 items-center justify-center rounded-full bg-white active:opacity-80"
          style={{ elevation: 2 }}
        >
          <Icon as={ChevronLeft} size={16} color={colors.sage[500]} />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-bold">{title}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            previewActive ? "Leave preview" : "Preview recipe"
          }
          hitSlop={12}
          onPress={onTogglePreview}
          className="h-9 w-9 items-center justify-center rounded-full bg-white active:opacity-80"
          style={{ elevation: 2 }}
        >
          <Icon
            as={PreviewIcon}
            size={16}
            color={colors.sage[500]}
            fill={previewActive ? colors.sage[600] : "transparent"}
          />
        </Pressable>
      </View>
    </View>
  );
}
