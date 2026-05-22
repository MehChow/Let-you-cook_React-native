import { Text } from "@/components/ui/text";
import type { RecipeDetailIngredientGroup } from "@/features/recipe-detail/types";
import * as React from "react";
import { View } from "react-native";
import { RecipeDetailSection } from "./RecipeDetailSection";

interface RecipeIngredientsSectionProps {
  groups: RecipeDetailIngredientGroup[];
}

export const RecipeIngredientsSection: React.FC<RecipeIngredientsSectionProps> = ({
  groups,
}) => {
  const items = groups.flatMap((group) => group.items);

  return (
    <RecipeDetailSection title="Ingredients">
      <View className="flex-row flex-wrap">
        {items.map((item) => (
          <View key={item.id} className="mb-2 w-1/2 flex-row pr-5">
            <Text className="flex-1 pr-2 text-xs font-bold text-black">
              {item.name}
            </Text>
            <Text className="text-xs font-medium text-neutral-400">
              {item.quantity}
            </Text>
          </View>
        ))}
      </View>
    </RecipeDetailSection>
  );
};
