import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

interface RecipeMetaItemProps {
  icon: LucideIcon;
  value: string;
  label: string;
}

export const RecipeMetaItem: React.FC<RecipeMetaItemProps> = ({
  icon,
  label,
  value,
}) => (
  <View className="min-w-[56px] flex-row items-center gap-1.5">
    <Icon as={icon} className="size-4 text-sage-600" />
    <View>
      <Text className="text-[10px] font-semibold text-sage-600">{value}</Text>
      <Text className="text-[9px] font-medium text-neutral-400">{label}</Text>
    </View>
  </View>
);
