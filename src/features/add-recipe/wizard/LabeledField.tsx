import { Text } from "@/components/ui/text";
import type { LucideIcon } from "lucide-react-native";
import type { ComponentType, ReactNode } from "react";
import { View } from "react-native";

export interface LabeledFieldProps {
  label: string;
  icon: LucideIcon;
  children: ReactNode;
  errorMessage?: string;
}

export function LabeledField({
  label,
  icon: IconComponent,
  children,
  errorMessage,
}: LabeledFieldProps) {
  const IconMark = IconComponent as ComponentType<{
    size?: number;
    color?: string;
  }>;
  return (
    <View className="mb-4 gap-1">
      <View className="flex-row items-center gap-2">
        <IconMark size={18} color="#426159" />
        <Text className="text-sm font-bold">{label}</Text>
      </View>
      {children}
      {errorMessage ? (
        <Text className="pl-1 text-[11px] font-medium text-danger-500">
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}
