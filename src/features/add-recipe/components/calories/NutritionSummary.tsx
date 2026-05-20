import { AI, Check, Delete } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
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
  primaryActionDestructive?: boolean;
  primaryActionIcon?: React.ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  statusBannerLabel?: string;
  statusBannerTone?: "success" | "warning";
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
  primaryActionDestructive = false,
  primaryActionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  statusBannerLabel,
  statusBannerTone = "success",
  compact = false,
}: NutritionSummaryProps) {
  const isEditable = !!inputRows && !!onChangeInputValue;
  const statusColors =
    statusBannerTone === "warning"
      ? {
          border: "border-[#e7c278]",
          background: "bg-[#fff7e8]",
          pill: "bg-[#d48a14]",
          text: "text-[#8a5a09]",
        }
      : {
          border: "border-[#b9dfc5]",
          background: "bg-[#eef8f1]",
          pill: "bg-[#21a34a]",
          text: "text-sage-600",
        };

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

          {statusBannerLabel ? (
            <View
              className={cn(
                "flex-row items-center justify-center gap-2 rounded-xl px-3 py-2.5",
                statusColors.border,
                statusColors.background,
              )}
            >
              <View className={cn("rounded-full p-1.5", statusColors.pill)}>
                {statusBannerTone === "warning" ? (
                  <AI size={12} color="#ffffff" />
                ) : (
                  <Check size={12} color="#ffffff" />
                )}
              </View>
              <Text className={cn("text-sm font-semibold", statusColors.text)}>
                {statusBannerLabel}
              </Text>
            </View>
          ) : null}

          {secondaryActionLabel && onSecondaryAction && !statusBannerLabel ? (
            <Button
              onPress={onSecondaryAction}
              className="h-8 rounded-xl bg-[#c33333]"
            >
              <Delete size={14} color="#ffffff" />
              <Text className="text-xs font-semibold text-white">
                {secondaryActionLabel}
              </Text>
            </Button>
          ) : null}

          {(statusBannerLabel || secondaryActionLabel) && !compact ? (
            <Separator className="bg-neutral-200" />
          ) : null}

          {isEditable && !hideVisualization ? (
            <Separator className="bg-neutral-200" />
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

          {primaryActionLabel && onPrimaryAction ? (
            <Button
              onPress={onPrimaryAction}
              disabled={primaryActionDisabled}
              className={cn(
                "h-8 rounded-xl",
                primaryActionDestructive ? "bg-[#c33333]" : "bg-sage-700",
              )}
            >
              {primaryActionLoading ? (
                <ActivityIndicator size={16} color="#ffffff" />
              ) : primaryActionIcon ? (
                primaryActionIcon
              ) : null}
              <Text className="text-xs font-semibold text-white">
                {primaryActionLabel}
              </Text>
            </Button>
          ) : null}

          {secondaryActionLabel && onSecondaryAction && statusBannerLabel ? (
            <Button
              onPress={onSecondaryAction}
              className="h-8 rounded-xl bg-[#c33333]"
            >
              <Delete size={14} color="#ffffff" />
              <Text className="text-xs font-semibold text-white">
                {secondaryActionLabel}
              </Text>
            </Button>
          ) : null}

        </View>
      </CardContent>
    </Card>
  );
}
