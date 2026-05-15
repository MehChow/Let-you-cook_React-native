import { Text } from "@/components/ui/text";
import { IngredientGroupCard } from "@/features/add-recipe/components/ingredient-groups/IngredientGroupCard";
import { IngredientGroupsCounter } from "@/features/add-recipe/components/ingredient-groups/IngredientGroupsCounter";
import { MAX_INGREDIENT_GROUPS, MAX_INGREDIENTS } from "@/features/add-recipe/constants";
import { useIngredientGroupsField } from "@/features/add-recipe/hooks/useIngredientGroupsField";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { prepareIngredientGroupsForPreview } from "@/features/add-recipe/utils/previewHelpers";
import { useCallback, useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
    Keyboard,
    Platform,
    Pressable,
    ScrollView,
    TextInput,
    View,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from "react-native";

type MeasurableScrollView = ScrollView & {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void;
};

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
  const scrollRef = useRef<ScrollView | null>(null);
  const focusedInputRef = useRef<TextInput | null>(null);
  const scrollOffsetRef = useRef(0);
  const {
    groupFields,
    groupCount,
    totalIngredients,
    canAddGroup,
    canAddIngredient,
    onAddGroup,
    onRemoveGroup,
    ingredientGroupsError,
  } = useIngredientGroupsField();

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
              {g.groupName?.trim() ? g.groupName : "—"}
            </Text>

            <View className="flex-row border-b border-sage-200 pb-2">
              <Text className="flex-1 text-xs font-bold uppercase text-sage-500">Ingredient</Text>
              <Text className="w-24 text-xs font-bold uppercase text-sage-500">Quantity</Text>
            </View>

            {(g.items ?? []).map((row, i) => (
              <View
                key={`group-${gi}-row-${i}-${row.name}-${row.quantityAmount}-${row.quantityUnit}`}
                className="flex-row border-b border-sage-100 py-2"
              >
                <Text className="flex-1 pr-2 text-base">{row.name || "—"}</Text>
                <Text className="w-24 text-base">
                  {row.quantityAmount?.trim() ? `${row.quantityAmount} ${row.quantityUnit}` : "—"}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }

  const ensureFocusedVisible = useCallback(
    (kbHeight?: number) => {
      if (Platform.OS !== "android") return;
      const focusedInput = focusedInputRef.current;
      const scrollView = scrollRef.current as MeasurableScrollView | null;
      if (!focusedInput || !scrollView) return;

      focusedInput.measureInWindow((_x, inputY, _w, inputHeight) => {
        scrollView.measureInWindow((_sx: number, scrollY: number, _sw: number, scrollHeight: number) => {
          const margin = 12;
          const keyboardInset = Math.max(0, kbHeight ?? keyboardHeight ?? 0);
          const visibleBottom = scrollY + scrollHeight - keyboardInset - margin;
          const inputBottom = inputY + inputHeight;

          if (inputBottom <= visibleBottom) return;

          const nextOffset = scrollOffsetRef.current + (inputBottom - visibleBottom);
          scrollRef.current?.scrollTo({ y: nextOffset, animated: true });
        });
      });
    },
    [keyboardHeight],
  );

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const sub = Keyboard.addListener("keyboardDidShow", (e) => {
      const kb = e.endCoordinates?.height ?? keyboardHeight ?? 0;
      if (kb <= 0) return;

      // Defer until focus + layout settles.
      setTimeout(() => {
        ensureFocusedVisible(kb);
      }, 50);
    });

    return () => sub.remove();
  }, [ensureFocusedVisible, keyboardHeight]);

  const onInputFocus = useCallback(
    (input: TextInput | null) => {
      if (!input) return;
      focusedInputRef.current = input;
      // If keyboard is already open, scroll immediately.
      setTimeout(() => ensureFocusedVisible(), 0);
    },
    [ensureFocusedVisible],
  );

  return (
    <View className="flex-1">
      <IngredientGroupsCounter totalIngredients={totalIngredients} groupCount={groupCount} />
      {ingredientGroupsError ? (
        <View className="mb-2 mt-1 w-full rounded-xl border border-danger-300 bg-red-100 px-3 py-2">
          <Text className="text-[11px] font-medium text-danger-500">{ingredientGroupsError}</Text>
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
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

        <Pressable
          onPress={onAddGroup}
          disabled={!canAddGroup}
          className="self-stretch rounded-2xl border border-dashed border-sage-400 px-4 py-4 items-center justify-center active:bg-sage-50 disabled:opacity-40"
        >
          <Text className="text-sm font-semibold text-sage-700">
            + Add group{" "}
            <Text className="text-xs font-semibold text-sage-500">
              ({groupCount}/{MAX_INGREDIENT_GROUPS})
            </Text>
          </Text>
          <Text className="mt-1 text-xs text-neutral-500">
            Max {MAX_INGREDIENTS} ingredients across all groups
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
