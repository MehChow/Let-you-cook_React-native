import { AddRecipeDashedActionButton } from "@/components/add-recipe/AddRecipeDashedActionButton";
import { Text } from "@/components/ui/text";
import { AddRecipeSectionCounter } from "@/features/add-recipe/components/AddRecipeSectionCounter";
import { IngredientGroupCard } from "@/features/add-recipe/components/ingredient-groups/IngredientGroupCard";
import { MAX_INGREDIENT_GROUPS, MAX_INGREDIENTS } from "@/features/add-recipe/constants";
import { useIngredientGroupsField } from "@/features/add-recipe/hooks/useIngredientGroupsField";
import { useKeyboardAwareFieldScroll } from "@/features/add-recipe/hooks/useKeyboardAwareFieldScroll";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { prepareIngredientGroupsForPreview } from "@/features/add-recipe/utils/previewHelpers";
import { useFormContext, useWatch } from "react-hook-form";
import { ScrollView, View } from "react-native";

export interface IngredientsSectionProps {
  mode: "edit" | "preview";
  bottomContentPadding?: number;
  keyboardHeight?: number;
}

export function IngredientsSection({
  mode,
  bottomContentPadding,
  keyboardHeight,
}: IngredientsSectionProps) {
  const { control } = useFormContext<AddRecipeFormValues>();
  const groups = useWatch({ control, name: "ingredientGroups" });
  const {
    groupFields,
    groupCount,
    totalIngredients,
    canAddGroup,
    canAddIngredient,
    onAddGroup,
    onRemoveGroup,
  } = useIngredientGroupsField();
  const { scrollRef, onScroll, onInputFocus } =
    useKeyboardAwareFieldScroll(keyboardHeight);

  if (mode === "preview") {
    const completedGroups = prepareIngredientGroupsForPreview(groups);

    return (
      <View className="gap-3">
        {completedGroups.map((g, gi) => (
          <View
            key={`group-preview-${gi}-${g.groupName?.slice(0, 12) ?? ""}`}
            className="rounded-2xl border border-sage-100 bg-sage-50/50 p-3"
          >
            <Text className="mb-2 text-sm font-bold text-sage-700">
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

            {(g.items ?? []).map((row, i) => (
              <View
                key={`group-${gi}-row-${i}-${row.name}-${row.quantityAmount}-${row.quantityUnit}`}
                className="flex-row border-b border-sage-100 py-2"
              >
                <Text className="flex-1 pr-2 text-base">
                  {row.name?.trim() ? row.name : "Ingredient"}
                </Text>
                <Text className="w-24 text-base">
                  {row.quantityAmount?.trim()
                    ? `${row.quantityAmount} ${row.quantityUnit}`
                    : "Quantity"}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-1">
      <AddRecipeSectionCounter
        items={[
          {
            label: "Ingredients",
            count: totalIngredients,
            max: MAX_INGREDIENTS,
          },
          {
            label: "Groups",
            count: groupCount,
            max: MAX_INGREDIENT_GROUPS,
          },
        ]}
      />

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={(e) => {
          onScroll(e.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{
          gap: 12,
          paddingBottom: bottomContentPadding ?? 16,
        }}
      >
        {groupFields.map((g, groupIndex) => (
          <IngredientGroupCard
            key={g.id}
            control={control}
            groupIndex={groupIndex}
            canAddIngredient={canAddIngredient}
            onRemoveGroup={() => onRemoveGroup(groupIndex)}
            showRemoveGroup={groupIndex > 0}
            onAnyInputFocus={onInputFocus}
          />
        ))}

        <AddRecipeDashedActionButton
          label={`+ Add group (${groupCount}/${MAX_INGREDIENT_GROUPS})`}
          helperText={`Max ${MAX_INGREDIENTS} ingredients across all groups`}
          onPress={onAddGroup}
          disabled={!canAddGroup}
          className="mt-1"
        />
      </ScrollView>
    </View>
  );
}
