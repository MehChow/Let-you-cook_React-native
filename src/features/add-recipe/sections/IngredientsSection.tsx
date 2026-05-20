import { AddRecipeDashedActionButton } from "@/components/add-recipe/AddRecipeDashedActionButton";
import { AddRecipeSectionCounter } from "@/features/add-recipe/components/AddRecipeSectionCounter";
import { IngredientGroupCard } from "@/features/add-recipe/components/ingredient-groups/IngredientGroupCard";
import { IngredientsPreview } from "@/features/add-recipe/components/ingredient-groups/IngredientsPreview";
import {
  MAX_INGREDIENT_GROUPS,
  MAX_INGREDIENTS,
} from "@/features/add-recipe/constants";
import { useIngredientGroupsField } from "@/features/add-recipe/hooks/useIngredientGroupsField";
import { useKeyboardAwareFieldScroll } from "@/features/add-recipe/hooks/useKeyboardAwareFieldScroll";
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
  const {
    control,
    groupFields,
    groupCount,
    previewGroups,
    totalIngredients,
    canAddGroup,
    canAddIngredient,
    onAddGroup,
    onRemoveGroup,
  } = useIngredientGroupsField();
  const { scrollRef, onScroll, onInputFocus } =
    useKeyboardAwareFieldScroll(keyboardHeight);

  if (mode === "preview") {
    return <IngredientsPreview groups={previewGroups} />;
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
