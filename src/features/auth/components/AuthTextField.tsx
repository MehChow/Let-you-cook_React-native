import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { colors } from "@/util/twColor";
import type { LucideIcon } from "lucide-react-native";
import { EyeIcon, EyeOffIcon } from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type ReturnKeyTypeOptions,
  type TextInputProps,
} from "react-native";

export interface AuthTextFieldProps {
  label?: string;
  icon: LucideIcon;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
  returnKeyType?: ReturnKeyTypeOptions;
  secureTextEntry?: boolean;
  maxLength?: number;
}

export function AuthTextField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize = "none",
  autoComplete,
  textContentType,
  returnKeyType,
  secureTextEntry = false,
  maxLength,
}: AuthTextFieldProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View className="gap-2">
      {/* Label */}
      {label ? (
        <Text className="text-md font-bold text-sage-600">{label}</Text>
      ) : null}

      {/* Input field */}
      <View className="flex-row items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4">
        <Icon as={icon} className="size-5 text-black" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[400]}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          secureTextEntry={secureTextEntry && isSecure}
          maxLength={maxLength}
          className="min-w-0 flex-1 py-3 text-base font-medium text-sage-800"
        />

        {/* Eye icon */}
        {secureTextEntry ? (
          <Pressable
            onPress={() => setIsSecure((current) => !current)}
            className="p-1 active:opacity-70"
          >
            <Icon
              as={isSecure ? EyeIcon : EyeOffIcon}
              className="size-5 text-neutral-600"
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
