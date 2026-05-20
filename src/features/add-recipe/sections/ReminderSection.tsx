import { ReminderNotesCard } from "@/features/add-recipe/components/reminder/ReminderNotesCard";
import { ReminderSectionPreview } from "@/features/add-recipe/components/reminder/ReminderSectionPreview";
import { ReminderSuggestionsCard } from "@/features/add-recipe/components/reminder/ReminderSuggestionsCard";
import { useReminderSection } from "@/features/add-recipe/hooks/useReminderSection";
import { View } from "react-native";

export interface ReminderSectionProps {
  mode: "edit" | "preview";
}

export function ReminderSection({ mode }: ReminderSectionProps) {
  const { control, notes, notesError } = useReminderSection();

  if (mode === "preview") {
    return <ReminderSectionPreview notes={notes} />;
  }

  return (
    <View className="gap-3 pb-2">
      <ReminderNotesCard control={control} errorMessage={notesError} />
      <ReminderSuggestionsCard />
    </View>
  );
}
