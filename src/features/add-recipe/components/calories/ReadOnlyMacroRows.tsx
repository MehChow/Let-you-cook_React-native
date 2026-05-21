import { Text } from "@/components/ui/text";
import type { NutritionSummaryRow } from "@/features/add-recipe/hooks/useCaloriesSection";
import { cn } from "@/lib/utils";
import { View } from "react-native";

export interface ReadOnlyMacroRowsProps {
  rows: NutritionSummaryRow[];
  compact?: boolean;
}

export function ReadOnlyMacroRows({
  rows,
  compact = false,
}: ReadOnlyMacroRowsProps) {
  return (
    <View className={cn("flex-1", compact ? "gap-3" : "gap-4")}>
      {rows.map((row) => (
        <View
          key={row.key}
          className={cn("flex-row items-center", compact ? "gap-2" : "gap-3")}
        >
          <View
            className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4", "rounded-full")}
            style={{ backgroundColor: row.color }}
          />
          <Text
            className={cn(
              "min-w-0 flex-1 font-medium text-black",
              compact ? "text-[16px] leading-[18px]" : "text-[18px]",
            )}
          >
            {row.label}
          </Text>
          <Text
            className={cn(
              "font-bold text-black",
              compact ? "text-[16px]" : "text-[18px]",
            )}
          >
            {row.gramsText}
          </Text>
        </View>
      ))}
    </View>
  );
}
