import { Description, Recipe, Serving, Time } from "@/components/Icon";
import { Text } from "@/components/ui/text";
import { MAX_DESCRIPTION_LENGTH } from "@/features/add-recipe/constants";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { useFormContext, useWatch } from "react-hook-form";
import { View } from "react-native";

export function BasicsSectionPreview() {
  const { control } = useFormContext<AddRecipeFormValues>();
  const previewRecipeName = useWatch({ control, name: "recipeName" });
  const previewDescription = useWatch({ control, name: "description" });
  const previewCookTime = useWatch({ control, name: "cookTimeMinutes" });
  const previewServings = useWatch({ control, name: "servings" });

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <Recipe size={18} color="#426159" />
        <Text className="text-sm font-semibold">Recipe name</Text>
      </View>
      <Text className="text-base">{previewRecipeName || "—"}</Text>
      <View className="mt-2 flex-row items-center gap-2">
        <Description size={18} color="#426159" />
        <Text className="text-sm font-semibold">Description (optional)</Text>
      </View>
      <Text className="text-base">{previewDescription?.trim() ? previewDescription : "—"}</Text>
      <Text className="text-right text-xs text-sage-500">
        {previewDescription?.length ?? 0} / {MAX_DESCRIPTION_LENGTH}
      </Text>
      <View className="mt-2 flex-row gap-2">
        <View className="flex-1">
          <View className="mb-1.5 flex-row items-center gap-2">
            <Time size={18} color="#426159" />
            <Text className="text-sm font-semibold">Cook time</Text>
          </View>
          <Text className="rounded-xl border border-sage-200 bg-white px-3 py-3 text-base">
            {previewCookTime ? `${previewCookTime} min` : "—"}
          </Text>
        </View>
        <View className="flex-1">
          <View className="mb-1.5 flex-row items-center gap-2">
            <Serving size={18} color="#426159" />
            <Text className="text-sm font-semibold">Serving</Text>
          </View>
          <Text className="rounded-xl border border-sage-200 bg-white px-3 py-3 text-base">
            {previewServings || "—"}
          </Text>
        </View>
      </View>
    </View>
  );
}
