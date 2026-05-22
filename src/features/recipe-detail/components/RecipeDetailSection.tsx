import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";

interface RecipeDetailSectionProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const RecipeDetailSection: React.FC<RecipeDetailSectionProps> = ({
  action,
  children,
  title,
}) => (
  <View className="border-b border-neutral-200 py-4">
    <View className="mb-3 flex-row items-center justify-between gap-3">
      <Text className="text-base font-semibold text-sage-700 underline">
        {title}
      </Text>
      {action}
    </View>
    {children}
  </View>
);
