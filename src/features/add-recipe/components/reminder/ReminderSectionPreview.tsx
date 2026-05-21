import { Reminder as ReminderIcon } from "@/components/Icon";
import { Text } from "@/components/ui/text";
import { colors } from "@/util/twColor";
import { View } from "react-native";

export interface ReminderSectionPreviewProps {
  notes: string;
}

export function ReminderSectionPreview({ notes }: ReminderSectionPreviewProps) {
  return (
    <View className="flex-col">
      <View className="flex-row items-center gap-2">
        <ReminderIcon size={16} color={colors.sage[600]} />
        <Text className="font-semibold text-sage-600">
          {"Chef's notes (optional)"}
        </Text>
      </View>

      <Text className="text-base">
        {notes.trim() ? notes : "No extra notes added"}
      </Text>
    </View>
  );
}
