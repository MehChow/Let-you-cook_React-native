import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import {
  Controller,
  useFormContext,
  type Control,
  type FieldPathByValue,
} from "react-hook-form";
import { TextInput, View } from "react-native";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { Text } from "@/components/ui/text";

export interface AddRecipeCounterTextAreaProps {
  control: Control<AddRecipeFormValues>;
  name: FieldPathByValue<AddRecipeFormValues, string | undefined>;
  placeholder: string;
  maxLength: number;
  inputClassName?: string;
  counterClassName?: string;
  wrapperClassName?: string;
  placeholderTextColor?: string;
  counterPrefix?: ReactNode;
  formatText?: (text: string) => string;
}

export function AddRecipeCounterTextArea({
  control,
  name,
  placeholder,
  maxLength,
  inputClassName,
  counterClassName,
  wrapperClassName,
  placeholderTextColor = "#75948c",
  counterPrefix,
  formatText,
}: AddRecipeCounterTextAreaProps) {
  const { clearErrors } = useFormContext<AddRecipeFormValues>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => {
        const handleChangeText = (text: string) => {
          clearErrors(name);
          onChange(formatText ? formatText(text) : text);
        };

        return (
          <View className={cn("relative", wrapperClassName)}>
            <TextInput
              value={value ?? ""}
              onChangeText={handleChangeText}
              onBlur={onBlur}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              multiline
              textAlignVertical="top"
              maxLength={maxLength}
              className={cn(
                "min-h-28 rounded-xl border border-sage-200 bg-white px-3 pb-7 text-base",
                inputClassName,
              )}
            />
            <View pointerEvents="none" className="absolute bottom-2 right-3">
              <Text className={cn("text-xs text-sage-500", counterClassName)}>
                {counterPrefix}
                {(value ?? "").length} / {maxLength}
              </Text>
            </View>
          </View>
        );
      }}
    />
  );
}
