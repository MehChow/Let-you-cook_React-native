import { Text } from "@/components/ui/text";
import { colors } from "@/util/twColor";
import { useRef } from "react";
import { Pressable, TextInput, View } from "react-native";

interface AuthOtpFieldProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function AuthOtpField({ value, onChangeText }: AuthOtpFieldProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");

  return (
    <Pressable onPress={() => inputRef.current?.focus()} className="gap-3">
      <Text className="text-base font-semibold text-sage-900">
        Enter 6-digit code
      </Text>
      <View className="flex-row gap-2">
        {digits.map((digit, index) => (
          <View
            key={index}
            className="h-16 flex-1 items-center justify-center rounded-2xl border border-sage-200 bg-white"
          >
            <Text className="text-2xl font-bold text-sage-800">{digit}</Text>
          </View>
        ))}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/\D/g, ""))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={6}
        placeholder="123456"
        placeholderTextColor={colors.sage[300]}
        className="absolute h-0 w-0 opacity-0"
      />
    </Pressable>
  );
}
