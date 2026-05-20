import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import {
  Controller,
  useFormContext,
  type Control,
  type FieldPathByValue,
} from "react-hook-form";
import { TextInput, View, type KeyboardTypeOptions } from "react-native";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";

export interface AddRecipeTextFieldProps {
  control: Control<AddRecipeFormValues>;
  name: FieldPathByValue<AddRecipeFormValues, string | undefined>;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  trailingAccessory?: ReactNode;
  inputClassName?: string;
  trailingClassName?: string;
  containerClassName?: string;
  placeholderTextColor?: string;
  formatText?: (text: string) => string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export function AddRecipeTextField({
  control,
  name,
  placeholder,
  keyboardType,
  maxLength,
  trailingAccessory,
  inputClassName,
  trailingClassName,
  containerClassName,
  placeholderTextColor = "#75948c",
  formatText,
  autoCapitalize = "sentences",
}: AddRecipeTextFieldProps) {
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

        const input = (
          <TextInput
            value={value ?? ""}
            onChangeText={handleChangeText}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            keyboardType={keyboardType}
            maxLength={maxLength}
            autoCapitalize={autoCapitalize}
            underlineColorAndroid="transparent"
            className={cn(
              trailingAccessory
                ? "min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-base"
                : "rounded-xl border border-sage-200 bg-white px-3 text-base",
              inputClassName,
            )}
          />
        );

        if (!trailingAccessory) {
          return input;
        }

        return (
          <View
            className={cn(
              "flex-row items-center rounded-xl border border-sage-200 bg-white px-3 py-3",
              containerClassName,
            )}
          >
            {input}
            <View className={cn("pl-1", trailingClassName)}>
              {trailingAccessory}
            </View>
          </View>
        );
      }}
    />
  );
}
