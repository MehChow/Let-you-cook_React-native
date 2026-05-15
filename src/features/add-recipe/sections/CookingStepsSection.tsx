import { AddRecipeDashedActionButton } from "@/components/add-recipe/AddRecipeDashedActionButton";
import { AddRecipeSectionCounter } from "@/features/add-recipe/components/AddRecipeSectionCounter";
import { CookingStepCard } from "@/features/add-recipe/components/cooking-steps/CookingStepCard";
import { CookingStepsPreview } from "@/features/add-recipe/components/cooking-steps/CookingStepsPreview";
import { MAX_COOKING_STEPS } from "@/features/add-recipe/constants";
import { useCookingStepsField } from "@/features/add-recipe/hooks/useCookingStepsField";
import { useCallback } from "react";
import type { RenderItemParams } from "react-native-draggable-flatlist";
import { View } from "react-native";
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
} from "react-native-draggable-flatlist";

export interface CookingStepsSectionProps {
  mode: "edit" | "preview";
  bottomContentPadding?: number;
}

export function CookingStepsSection({
  mode,
  bottomContentPadding,
}: CookingStepsSectionProps) {
  const {
    fields,
    previewSteps,
    canAddStep,
    canRemoveStep,
    handleAddStep,
    handleRemoveStep,
    handleMoveStep,
    keyExtractor,
  } = useCookingStepsField();

  const renderItem = useCallback(
    ({ getIndex, drag, isActive }: RenderItemParams<
      (typeof fields)[number]
    >) => {
      const index = getIndex() ?? 0;
      return (
        <CookingStepCard
          index={index}
          isActive={isActive}
          onDrag={drag}
          onRemove={() => handleRemoveStep(index)}
          canRemove={canRemoveStep}
        />
      );
    },
    [canRemoveStep, handleRemoveStep],
  );

  if (mode === "preview") {
    return <CookingStepsPreview steps={previewSteps} />;
  }

  return (
    <View className="flex-1">
      <AddRecipeSectionCounter
        items={[
          {
            label: "Steps",
            count: fields.length,
            max: MAX_COOKING_STEPS,
          },
        ]}
      />
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
            handleMoveStep(from, to);
          }}
          renderItem={renderItem}
          ListFooterComponent={
            <AddRecipeDashedActionButton
              label="+ Add step"
              onPress={handleAddStep}
              disabled={!canAddStep}
              className="mb-6"
            />
          }
        />
      </NestableScrollContainer>
    </View>
  );
}
