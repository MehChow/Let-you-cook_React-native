import { AI, Check, Delete } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { EditableMacroRows } from "@/features/add-recipe/components/calories/EditableMacroRows";
import { NutritionRing } from "@/features/add-recipe/components/calories/NutritionRing";
import { ReadOnlyMacroRows } from "@/features/add-recipe/components/calories/ReadOnlyMacroRows";
import type {
  NutritionInputRow,
  NutritionSummaryRow,
} from "@/features/add-recipe/hooks/useCaloriesSection";
import { cn } from "@/lib/utils";
import { ActivityIndicator, View } from "react-native";

export interface NutritionSummaryProps {
  title: string;
  description?: string;
  rows: NutritionSummaryRow[];
  totalCalories: number;
  hideVisualization?: boolean;
  inputRows?: NutritionInputRow[];
  onChangeInputValue?: (
    fieldName: NutritionInputRow["fieldName"],
    nextValue: string,
  ) => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionDisabled?: boolean;
  primaryActionLoading?: boolean;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  successBannerLabel?: string;
  compact?: boolean;
}

export function NutritionSummary({
  title,
  description,
  rows,
  totalCalories,
  hideVisualization = false,
  inputRows,
  onChangeInputValue,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionDisabled,
  primaryActionLoading = false,
  secondaryActionLabel,
  onSecondaryAction,
  successBannerLabel,
  compact = false,
}: NutritionSummaryProps) {
  const isEditable = !!inputRows && !!onChangeInputValue;

  return (
    <Card
      className={cn(
        "gap-0 rounded-2xl border border-neutral-200 bg-white py-4",
        compact && "py-3",
      )}
    >
      <CardContent className={cn("px-5", compact && "px-4")}>
        <View className={cn("gap-4", compact && "gap-3")}>
          <View className="items-center gap-2">
            <View className="p-3 bg-sage-100 rounded-full">
              <Icon as={AI} className="bg-sage-600 text-sage-600 size-4" />
            </View>
            <Text className="font-semibold text-black">{title}</Text>
            {description ? (
              <Text className="text-center text-[10px] text-neutral-400">
                {description}
              </Text>
            ) : null}
          </View>

          {successBannerLabel ? (
            <View className="flex-row items-center justify-center gap-2 rounded-xl border border-[#b9dfc5] bg-[#eef8f1] px-3 py-2.5">
              <View className="rounded-full bg-[#21a34a] p-1.5">
                <Check size={12} color="#ffffff" />
              </View>
              <Text className="text-sm font-semibold text-sage-600">
                Analysis complete
              </Text>
            </View>
          ) : null}

          {secondaryActionLabel && onSecondaryAction && !successBannerLabel ? (
            <Button
              onPress={onSecondaryAction}
              className="h-12 rounded-xl bg-[#c33333]"
            >
              <Delete size={16} color="#ffffff" />
              <Text className="text-sm font-semibold text-white">
                {secondaryActionLabel}
              </Text>
            </Button>
          ) : null}

          {(successBannerLabel || secondaryActionLabel) && !compact ? (
            <View className="h-px bg-neutral-200" />
          ) : null}

          {!hideVisualization ? (
            <View className="flex-row items-center gap-4">
              <NutritionRing rows={rows} totalCalories={totalCalories} />
              {isEditable ? (
                <EditableMacroRows
                  rows={inputRows}
                  onChangeValue={onChangeInputValue}
                />
              ) : (
                <ReadOnlyMacroRows rows={rows} />
              )}
            </View>
          ) : null}

          {secondaryActionLabel && onSecondaryAction && successBannerLabel ? (
            <Button
              onPress={onSecondaryAction}
              className="h-12 rounded-xl bg-[#c33333]"
            >
              <Delete size={16} color="#ffffff" />
              <Text className="text-sm font-semibold text-white">
                {secondaryActionLabel}
              </Text>
            </Button>
          ) : null}

          {primaryActionLabel && onPrimaryAction ? (
            <Button
              onPress={onPrimaryAction}
              disabled={primaryActionDisabled}
              className="rounded-xl bg-sage-700 h-8"
            >
              {primaryActionLoading ? (
                <ActivityIndicator size={16} color="#ffffff" />
              ) : null}
              <Text className="text-xs font-semibold text-white">
                {primaryActionLabel}
              </Text>
            </Button>
          ) : null}
        </View>
      </CardContent>
    </Card>
  );
}
