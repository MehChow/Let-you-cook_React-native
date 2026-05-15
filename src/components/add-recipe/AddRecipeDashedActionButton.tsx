import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

export interface AddRecipeDashedActionButtonProps {
  label: string;
  helperText?: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  leftAccessory?: ReactNode;
}

export function AddRecipeDashedActionButton({
  label,
  helperText,
  onPress,
  disabled,
  className,
  labelClassName,
  helperTextClassName,
  leftAccessory,
}: AddRecipeDashedActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        "self-stretch items-center justify-center rounded-2xl border border-dashed border-sage-400 px-4 py-4 active:bg-sage-50 disabled:opacity-40",
        className,
      )}
    >
      <View className="flex-row items-center gap-1">
        {leftAccessory}
        <Text className={cn("text-sm font-semibold text-sage-700", labelClassName)}>
          {label}
        </Text>
      </View>
      {helperText ? (
        <Text className={cn("mt-1 text-xs text-neutral-500", helperTextClassName)}>
          {helperText}
        </Text>
      ) : null}
    </Pressable>
  );
}
