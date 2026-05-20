import { AddRecipeDashedActionButton } from "@/components/add-recipe/AddRecipeDashedActionButton";
import { AddRecipeSectionCounter } from "@/features/add-recipe/components/AddRecipeSectionCounter";
import { MemoizedCookingStepCard } from "@/features/add-recipe/components/cooking-steps/CookingStepCard";
import { CookingStepsPreview } from "@/features/add-recipe/components/cooking-steps/CookingStepsPreview";
import { MAX_COOKING_STEPS } from "@/features/add-recipe/constants";
import { useKeyboardAwareFieldScroll } from "@/features/add-recipe/hooks/useKeyboardAwareFieldScroll";
import { useCookingStepsField } from "@/features/add-recipe/hooks/useCookingStepsField";
import { useCallback, useMemo, useState } from "react";
import type { ScrollView as GestureHandlerScrollView } from "react-native-gesture-handler";
import { View } from "react-native";
import type { RenderItemParams } from "react-native-draggable-flatlist";
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
  const { scrollRef, onInputFocus } =
    useKeyboardAwareFieldScroll<GestureHandlerScrollView>();
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState<number | null>(null);

  const displayIndexById = useMemo(() => {
    const displayMap = new Map<string, number>();

    fields.forEach((field, index) => {
      let displayIndex = index;

      if (
        dragFromIndex !== null &&
        placeholderIndex !== null &&
        dragFromIndex !== placeholderIndex
      ) {
        if (index === dragFromIndex) {
          displayIndex = placeholderIndex;
        } else if (dragFromIndex < placeholderIndex) {
          if (index > dragFromIndex && index <= placeholderIndex) {
            displayIndex = index - 1;
          }
        } else if (index >= placeholderIndex && index < dragFromIndex) {
          displayIndex = index + 1;
        }
      }

      displayMap.set(field.id, displayIndex);
    });

    return displayMap;
  }, [dragFromIndex, fields, placeholderIndex]);

  const resetDragState = useCallback(() => {
    setDragFromIndex(null);
    setPlaceholderIndex(null);
  }, []);

  const renderItem = useCallback(
    ({
      item,
      getIndex,
      drag,
      isActive,
    }: RenderItemParams<(typeof fields)[number]>) => {
      const index = getIndex() ?? 0;
      return (
        <MemoizedCookingStepCard
          index={index}
          displayIndex={displayIndexById.get(item.id) ?? index}
          isActive={isActive}
          onDrag={drag}
          onRemove={() => handleRemoveStep(index)}
          canRemove={canRemoveStep(index)}
          onAnyInputFocus={onInputFocus}
        />
      );
    },
    [canRemoveStep, displayIndexById, handleRemoveStep, onInputFocus]
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
        ref={scrollRef}
        className="flex-1"
        style={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: bottomContentPadding ?? 24,
        }}
      >
        <NestableDraggableFlatList
          data={fields}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
          activationDistance={12}
          autoscrollSpeed={180}
          autoscrollThreshold={48}
          animationConfig={{
            damping: 22,
            mass: 0.15,
            stiffness: 260,
            overshootClamping: false,
          }}
          onPlaceholderIndexChange={(nextPlaceholderIndex) => {
            setPlaceholderIndex(nextPlaceholderIndex);
          }}
          onDragEnd={({ from, to }) => {
            handleMoveStep(from, to);
            resetDragState();
          }}
          onDragBegin={(index) => {
            setDragFromIndex(index);
            setPlaceholderIndex(index);
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
