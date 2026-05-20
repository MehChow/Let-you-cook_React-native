import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export function ReminderSuggestionsCard() {
  return (
    <Card className="gap-0 rounded-2xl bg-sage-200 py-4 border-0">
      <CardContent className="px-6">
        <View className="gap-3">
          <Text className="text-base font-semibold text-black">
            Suggested notes to include
          </Text>

          <View className="pl-4">
            <Text className="text-sm leading-5 text-sage-600 font-medium">
              • Ingredient substitutions
            </Text>
            <Text className="text-sm leading-5 text-sage-600 font-medium">
              • Storage and reheating tips
            </Text>
            <Text className="text-sm leading-5 text-sage-600 font-medium">
              • Prep-ahead instructions
            </Text>
            <Text className="text-sm leading-5 text-sage-600 font-medium">
              • Allergy information
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}
