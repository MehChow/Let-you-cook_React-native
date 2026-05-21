import { Description, Recipe, Serving, Time } from "@/components/Icon";
import { Text } from "@/components/ui/text";
import type { BasicsSectionPreviewValues } from "@/features/add-recipe/hooks/useBasicsSectionField";
import { colors } from "@/util/twColor";
import { View } from "react-native";

export type BasicsSectionPreviewProps = BasicsSectionPreviewValues;

export function BasicsSectionPreview({
  recipeName,
  description,
  cookTimeMinutes,
  servings,
}: BasicsSectionPreviewProps) {
  const recipeNameText = recipeName.trim() ? recipeName : "Untitled recipe";
  const descriptionText = description.trim()
    ? description
    : "No description added yet";
  const cookTimeText = cookTimeMinutes.trim()
    ? `${cookTimeMinutes} min`
    : "No cook time yet";
  const servingsText = servings.trim() ? servings : "No servings yet";

  return (
    <View className="gap-4">
      {/* Recipe Name */}
      <View className="flex-col">
        <View className="flex-row items-center gap-2">
          <Recipe size={16} color={colors.sage[600]} />
          <Text className="text-sage-600 font-semibold">Recipe name</Text>
        </View>
        <Text className="text-base">{recipeNameText}</Text>
      </View>

      {/* Description */}
      <View className="flex-col">
        <View className="mt-2 flex-row items-center gap-2">
          <Description size={16} color={colors.sage[600]} />
          <Text className="text-sage-600 font-semibold">
            Description (optional)
          </Text>
        </View>
        <Text className="text-base">{descriptionText}</Text>
      </View>

      <View className="mt-2 flex-row gap-2">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Time size={16} color={colors.sage[600]} />
            <Text className="text-sage-600 font-semibold">Cook time</Text>
          </View>
          <Text className="text-base">{cookTimeText}</Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Serving size={16} color={colors.sage[600]} />
            <Text className="text-sage-600 font-semibold">Serving</Text>
          </View>
          <Text className="text-base">{servingsText}</Text>
        </View>
      </View>
    </View>
  );
}
