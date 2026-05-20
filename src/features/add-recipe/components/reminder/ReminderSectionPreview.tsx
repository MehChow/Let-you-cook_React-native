import { Reminder as ReminderIcon } from "@/components/Icon";
import { Text } from "@/components/ui/text";
import { MAX_CHEF_NOTES_LENGTH } from "@/features/add-recipe/constants";
import { View } from "react-native";

export interface ReminderSectionPreviewProps {
  notes: string;
}

export function ReminderSectionPreview({ notes }: ReminderSectionPreviewProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <ReminderIcon size={18} color="#426159" />
        <Text className="text-sm font-semibold">
          {"Chef's notes (optional)"}
        </Text>
      </View>
      <Text className="text-base text-black">
        {notes.trim() ? notes : "No extra notes added"}
      </Text>
      <Text className="text-right text-xs text-sage-500">
        {notes.length} / {MAX_CHEF_NOTES_LENGTH}
      </Text>
    </View>
  );
}
