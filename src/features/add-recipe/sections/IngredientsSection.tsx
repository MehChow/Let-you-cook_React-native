import { Delete, Ingredients as IngredientsIcon } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { MAX_INGREDIENTS } from "@/features/add-recipe/constants";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { LabeledField } from "@/features/add-recipe/wizard/LabeledField";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Pressable, TextInput, View } from "react-native";

export interface IngredientsSectionProps {
  mode: "edit" | "preview";
}

export function IngredientsSection({ mode }: IngredientsSectionProps) {
  const { control } = useFormContext<AddRecipeFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });
  const rows = useWatch({ control, name: "ingredients" });

  if (mode === "preview") {
    return (
      <View className="gap-2">
        <View className="mb-2 flex-row items-center gap-2">
          <IngredientsIcon size={18} color="#426159" />
          <Text className="text-sm font-semibold">Ingredients</Text>
        </View>
        <View className="flex-row border-b border-sage-200 pb-2">
          <Text className="flex-1 text-xs font-bold uppercase text-sage-500">
            Ingredient
          </Text>
          <Text className="w-24 text-xs font-bold uppercase text-sage-500">
            Quantity
          </Text>
        </View>
        {(rows ?? []).map((row, i) => (
          <View
            key={`${row.name}-${row.quantity}-${i}`}
            className="flex-row border-b border-sage-100 py-2"
          >
            <Text className="flex-1 pr-2 text-base">
              {row.name || "—"}
            </Text>
            <Text className="w-24 text-base">
              {row.quantity || "—"}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View>
      <LabeledField label="Ingredient list" icon={IngredientsIcon}>
        <View className="flex-row border-b border-sage-200 pb-2">
          <Text className="flex-1 text-xs font-bold uppercase text-sage-500">
            Ingredient
          </Text>
          <Text className="w-20 text-xs font-bold uppercase text-sage-500">
            Quantity
          </Text>
          <View className="w-10" />
        </View>
        {fields.map((field, index) => (
          <View
            key={field.id}
            className="flex-row items-center gap-2 border-b border-sage-100 py-2"
          >
            <Controller
              control={control}
              name={`ingredients.${index}.name`}
              render={({ field: f }) => (
                <TextInput
                  value={f.value}
                  onChangeText={f.onChange}
                  onBlur={f.onBlur}
                  placeholder="Sugar"
                  placeholderTextColor="#75948c"
                  className="min-h-10 flex-1 rounded-lg border border-sage-200 bg-white px-2 py-2 text-base"
                />
              )}
            />
            <Controller
              control={control}
              name={`ingredients.${index}.quantity`}
              render={({ field: f }) => (
                <TextInput
                  value={f.value}
                  onChangeText={f.onChange}
                  onBlur={f.onBlur}
                  placeholder="30g"
                  placeholderTextColor="#75948c"
                  className="h-10 w-20 rounded-lg border border-sage-200 bg-white px-2 text-base"
                />
              )}
            />
            <Pressable
              accessibilityLabel="Remove ingredient"
              hitSlop={8}
              onPress={() => remove(index)}
              disabled={fields.length <= 1}
              className="h-10 w-10 items-center justify-center opacity-100 disabled:opacity-30"
            >
              <Icon as={Delete} size={20} color="#e53e3e" />
            </Pressable>
          </View>
        ))}
        <Pressable
          onPress={() => {
            if (fields.length >= MAX_INGREDIENTS) return;
            append({ name: "", quantity: "" });
          }}
          disabled={fields.length >= MAX_INGREDIENTS}
          className="mt-3 self-start rounded-xl border border-dashed border-sage-400 px-4 py-2 active:bg-sage-50 disabled:opacity-40"
        >
          <Text className="text-sm font-semibold text-sage-700">+ Add ingredient</Text>
        </Pressable>
      </LabeledField>
    </View>
  );
}
