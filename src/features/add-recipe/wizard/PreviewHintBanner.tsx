import { Edit } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { colors } from "@/util/twColor";
import { View } from "react-native";

export function PreviewHintBanner() {
  return (
    <View className="mx-4 mb-3 flex-row items-center gap-2 rounded-xl bg-sage-200/80 px-3 py-2.5">
      <Icon as={Edit} size={18} color={colors.sage[700]} />
      <Text className="flex-1 text-sm">
        Tap any section to jump back and edit it.
      </Text>
    </View>
  );
}
