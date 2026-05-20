import { Text } from "@/components/ui/text";
import type { NutritionInputRow } from "@/features/add-recipe/hooks/useCaloriesSection";
import { TextInput, View } from "react-native";

export interface EditableMacroRowsProps {
  rows: NutritionInputRow[];
  onChangeValue: (
    fieldName: NutritionInputRow["fieldName"],
    nextValue: string,
  ) => void;
}

export function EditableMacroRows({
  rows,
  onChangeValue,
}: EditableMacroRowsProps) {
  return (
    <View className="min-w-0 flex-1 gap-4">
      {rows.map((row) => (
        <View key={row.key} className="min-w-0 flex-row items-center gap-2">
          <View
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: row.color }}
          />
          <Text className="min-w-0 flex-1 text-[18px] font-medium text-black">
            {row.label}
          </Text>
          <View className="w-[44px] flex-row items-end justify-end gap-1">
            <View className="w-[28px] border-b border-neutral-500">
              <TextInput
                value={row.value}
                onChangeText={(value) => onChangeValue(row.fieldName, value)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#9aa6a2"
                textAlign="right"
                className="w-full px-0 py-0.5 text-right text-[18px] font-bold text-black"
              />
            </View>
            <Text className="pb-0.5 text-[18px] font-medium text-black">g</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
