import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";
import { RecipeDetailSection } from "./RecipeDetailSection";

interface RecipeReminderSectionProps {
  reminder?: string;
}

export const RecipeReminderSection: React.FC<RecipeReminderSectionProps> = ({
  reminder,
}) => {
  if (!reminder?.trim()) return null;

  return (
    <RecipeDetailSection title="Reminder">
      <View className="gap-1">
        {reminder.split("\n").map((line, index) => (
          <Text key={`${line}-${index}`} className="text-xs font-medium text-black">
            {index + 1}. {line}
          </Text>
        ))}
      </View>
    </RecipeDetailSection>
  );
};
