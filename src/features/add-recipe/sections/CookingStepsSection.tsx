import { Text } from "@/components/ui/text";
import { CookingStepCard } from "@/features/add-recipe/components/cooking-steps/CookingStepCard";
import { CookingStepsPreview } from "@/features/add-recipe/components/cooking-steps/CookingStepsPreview";
import { MAX_COOKING_STEPS } from "@/features/add-recipe/constants";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { useCallback } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Pressable } from "react-native";
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
} from "react-native-draggable-flatlist";

export interface CookingStepsSectionProps {
  mode: "edit" | "preview";
  bottomContentPadding?: number;
  keyboardHeight?: number;
}

export function CookingStepsSection({
  mode,
  bottomContentPadding,
}: CookingStepsSectionProps) {
  const { control } = useFormContext<AddRecipeFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "cookingSteps",
  });
  const previewSteps = useWatch({ control, name: "cookingSteps" });

  const handleAddStep = useCallback(() => {
    if (fields.length >= MAX_COOKING_STEPS) return;
    append({ instruction: "", imageUri: "" });
  }, [append, fields.length]);

  const handleRemoveStep = useCallback(
    (index: number) => {
      if (fields.length <= 1) return;
      remove(index);
    },
    [fields.length, remove]
  );

  if (mode === "preview") {
    return <CookingStepsPreview steps={previewSteps} />;
  }

  const keyExtractor = useCallback(
    (item: any, index: number) => `${item.id}-${index}`,
    []
  );

  return (
    <NestableScrollContainer
      className="flex-1"
      style={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: bottomContentPadding ?? 24,
      }}
    >
      <NestableDraggableFlatList
        data={fields}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
        onDragEnd={({ from, to }) => {
          move(from, to);
        }}
        renderItem={({ getIndex, drag, isActive }) => {
          const index = getIndex() ?? 0;
          return (
            <CookingStepCard
              index={index}
              isActive={isActive}
              onDrag={drag}
              onRemove={() => handleRemoveStep(index)}
              canRemove={fields.length > 1}
            />
          );
        }}
        ListFooterComponent={
          <Pressable
            onPress={handleAddStep}
            disabled={fields.length >= MAX_COOKING_STEPS}
            className="mb-6 w-full items-center rounded-xl border border-dashed border-sage-600 px-4 py-2 active:bg-sage-50 disabled:opacity-40"
          >
            <Text className="text-sm font-semibold text-sage-700">
              + Add step
            </Text>
          </Pressable>
        }
      />
    </NestableScrollContainer>
  );
}
