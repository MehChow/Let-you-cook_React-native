import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import {
  MAX_INGREDIENT_GROUPS,
  MAX_INGREDIENTS,
} from "@/features/add-recipe/constants";
import { View } from "react-native";

export const IngredientGroupsCounter = ({
  totalIngredients,
  groupCount,
}: {
  totalIngredients: number;
  groupCount: number;
}) => {
  const ingredientsAtLimit = totalIngredients >= MAX_INGREDIENTS;
  const groupsAtLimit = groupCount >= MAX_INGREDIENT_GROUPS;

  return (
    <View className="flex-row items-center justify-center py-2">
      <View className="flex-1 items-center">
        <Text className="text-xs font-semibold text-neutral-300">
          Ingredients:{" "}
          <Text
            className={`text-xs font-semibold ${
              ingredientsAtLimit ? "text-danger-500" : "text-sage-500"
            }`}
          >
            {totalIngredients} / {MAX_INGREDIENTS}
          </Text>
        </Text>
      </View>

      <Separator orientation="vertical" className="h-full bg-sage-300" />

      <View className="flex-1 items-center">
        <Text className="text-xs font-semibold text-neutral-300">
          Groups:{" "}
          <Text
            className={`text-xs font-semibold ${
              groupsAtLimit ? "text-danger-500" : "text-sage-500"
            }`}
          >
            {groupCount} / {MAX_INGREDIENT_GROUPS}
          </Text>
        </Text>
      </View>
    </View>
  );
};
