import { Text } from "@/components/ui/text";
import {
  formatIngredientQuantity,
  type IngredientUnitOption,
} from "@/features/add-recipe/constants";
import { View } from "react-native";

export interface IngredientPreviewRow {
  name?: string;
  quantityAmount?: string;
  quantityUnit?: IngredientUnitOption;
}

export interface IngredientPreviewGroup {
  groupName?: string;
  items?: IngredientPreviewRow[];
}

export interface IngredientsPreviewProps {
  groups: IngredientPreviewGroup[];
}

export function IngredientsPreview({ groups }: IngredientsPreviewProps) {
  return (
    <View className="gap-3">
      {groups.map((g, gi) => (
        <View
          key={`group-preview-${gi}-${g.groupName?.slice(0, 12) ?? ""}`}
          className="rounded-2xl border border-sage-100 bg-sage-100/50 p-3"
        >
          <Text className="mb-2 font-bold text-sage-700">
            {g.groupName?.trim() ? g.groupName : "Group name"}
          </Text>

          <View className="flex-row border-b border-sage-200 pb-2">
            <Text className="flex-1 text-xs font-bold uppercase text-sage-500">
              Ingredient
            </Text>
            <Text className="w-24 text-xs font-bold uppercase text-sage-500">
              Quantity
            </Text>
          </View>

          {(g.items ?? []).map((row: IngredientPreviewRow, i: number) => (
            <View
              key={`group-${gi}-row-${i}-${row.name}-${row.quantityAmount}-${row.quantityUnit}`}
              className="flex-row border-b border-sage-100 py-2"
            >
              <Text className="flex-1 pr-2 text-base">
                {row.name?.trim() ? row.name : "Ingredient"}
              </Text>
              <Text className="w-24 text-base">
                {formatIngredientQuantity(
                  row.quantityAmount,
                  row.quantityUnit,
                ) || "Quantity"}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
