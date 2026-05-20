import { Text } from "@/components/ui/text";
import type { NutritionSummaryRow } from "@/features/add-recipe/hooks/useCaloriesSection";
import { View } from "react-native";

export interface ReadOnlyMacroRowsProps {
  rows: NutritionSummaryRow[];
}

export function ReadOnlyMacroRows({ rows }: ReadOnlyMacroRowsProps) {
  return (
    <View className="flex-1 gap-4">
      {rows.map((row) => (
        <View key={row.key} className="flex-row items-center gap-3">
          <View
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: row.color }}
          />
          <Text className="min-w-0 flex-1 text-[18px] font-medium text-black">
            {row.label}
          </Text>
          <Text className="text-[18px] font-bold text-black">
            {row.gramsText}
          </Text>
        </View>
      ))}
    </View>
  );
}
