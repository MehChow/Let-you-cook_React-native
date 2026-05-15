import { Description, Recipe, Serving, Time } from "@/components/Icon";
import { Text } from "@/components/ui/text";
import type { BasicsSectionPreviewValues } from "@/features/add-recipe/hooks/useBasicsSectionField";
import { MAX_DESCRIPTION_LENGTH } from "@/features/add-recipe/constants";
import { View } from "react-native";

export interface BasicsSectionPreviewProps extends BasicsSectionPreviewValues {}

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
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <Recipe size={18} color="#426159" />
        <Text className="text-sm font-semibold">Recipe name</Text>
      </View>
      <Text className="text-base">{recipeNameText}</Text>

      <View className="mt-2 flex-row items-center gap-2">
        <Description size={18} color="#426159" />
        <Text className="text-sm font-semibold">Description (optional)</Text>
      </View>
      <Text className="text-base">{descriptionText}</Text>
      <Text className="text-right text-xs text-sage-500">
        {description.length} / {MAX_DESCRIPTION_LENGTH}
      </Text>

      <View className="mt-2 flex-row gap-2">
        <View className="flex-1">
          <View className="mb-1.5 flex-row items-center gap-2">
            <Time size={18} color="#426159" />
            <Text className="text-sm font-semibold">Cook time</Text>
          </View>
          <Text className="rounded-xl border border-sage-200 bg-white px-3 py-3 text-base">
            {cookTimeText}
          </Text>
        </View>
        <View className="flex-1">
          <View className="mb-1.5 flex-row items-center gap-2">
            <Serving size={18} color="#426159" />
            <Text className="text-sm font-semibold">Serving</Text>
          </View>
          <Text className="rounded-xl border border-sage-200 bg-white px-3 py-3 text-base">
            {servingsText}
          </Text>
        </View>
      </View>
    </View>
  );
}
