import { Ingredients as IngredientsIcon } from "@/components/Icon";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { useMemo, useState } from "react";
import { Controller, useFieldArray, type Control } from "react-hook-form";
import { Pressable, TextInput, View, findNodeHandle } from "react-native";
import { IngredientRow } from "./IngredientRow";

export const IngredientGroupCard = ({
  control,
  groupIndex,
  canAddIngredient,
  onRemoveGroup,
  showRemoveGroup,
  onAnyInputFocus,
}: {
  control: Control<AddRecipeFormValues>;
  groupIndex: number;
  canAddIngredient: boolean;
  onRemoveGroup: () => void;
  showRemoveGroup: boolean;
  onAnyInputFocus?: (node: number | null) => void;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `ingredientGroups.${groupIndex}.items`,
  });

  const [editingName, setEditingName] = useState(false);
  const fallbackName = "Group name";
  const groupNameFieldPath = useMemo(
    () => `ingredientGroups.${groupIndex}.groupName` as const,
    [groupIndex]
  );

  return (
    <Card className="py-3 gap-4 border border-neutral-200">
      <CardContent className="px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-neutral-200 pb-1">
          {/* Icon & Group Name */}
          <View className="flex-row items-center gap-1.5 flex-1">
            <IngredientsIcon size={18} color="#426159" />
            <Controller
              control={control}
              name={groupNameFieldPath}
              render={({ field: f, fieldState }) => {
                const displayName = (f.value ?? "").trim() || fallbackName;
                const commitGroupName = () => {
                  const next = (f.value ?? "").trim() || fallbackName;
                  f.onChange(next);
                  f.onBlur();
                  setEditingName(false);
                };
                return editingName ? (
                  <TextInput
                    value={f.value ?? ""}
                    onChangeText={(t) => f.onChange(t.slice(0, 50))}
                    autoFocus
                    returnKeyType="done"
                    placeholder={fallbackName}
                    placeholderTextColor="#a3a3a3"
                    onFocus={(e) => onAnyInputFocus?.(findNodeHandle(e.target))}
                    onSubmitEditing={commitGroupName}
                    onBlur={commitGroupName}
                    maxLength={50}
                    className={`flex-1 border-b py-1 text-base font-semibold ${
                      fieldState.invalid
                        ? "border-danger-300 text-danger-500"
                        : "border-sage-200"
                    }`}
                  />
                ) : (
                  <Pressable
                    onPress={() => setEditingName(true)}
                    className="flex-1 py-1"
                  >
                    <Text className="text-base font-semibold">
                      {displayName}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>

          {/* Remove Group Button */}
          {showRemoveGroup ? (
            <Pressable
              accessibilityLabel="Remove group"
              hitSlop={8}
              onPress={onRemoveGroup}
              className="h-6 w-6 items-center justify-center rounded-full active:opacity-80"
            >
              <Text className="text-[10px] font-bold text-neutral-400">✕</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Ingredients List Header */}
        <View className="mt-3 mb-1 flex-row items-center gap-2">
          <View className="min-w-0 flex-1 basis-0">
            <Text className="text-[8px] font-semibold uppercase tracking-widest text-neutral-500">
              Ingredient
            </Text>
          </View>
          <View className="min-w-0 flex-1 basis-0">
            <Text className="text-[8px] font-semibold uppercase tracking-widest text-neutral-500">
              Quantity
            </Text>
          </View>
          <View className="w-4" />
        </View>

        {/* Ingredients List */}
        <View className="gap-2">
          {fields.map((f, itemIndex) => (
            <IngredientRow
              key={f.id}
              control={control}
              groupIndex={groupIndex}
              itemIndex={itemIndex}
              onRemove={() => remove(itemIndex)}
              removeDisabled={itemIndex === 0}
              onAnyInputFocus={onAnyInputFocus}
            />
          ))}
        </View>

        {/* Add Ingredient Button */}
        <Pressable
          onPress={() => {
            if (!canAddIngredient) return;
            append(
              { name: "", quantityAmount: "", quantityUnit: "g" },
              { shouldFocus: true }
            );
          }}
          disabled={!canAddIngredient}
          className="mt-2 self-start px-1 active:opacity-80 disabled:opacity-40"
        >
          <Text className="text-[10px] font-semibold text-sage-700">
            + Add ingredient
          </Text>
        </Pressable>
      </CardContent>
    </Card>
  );
};
