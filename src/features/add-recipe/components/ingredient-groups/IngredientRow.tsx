import { Delete } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { Controller, type Control } from "react-hook-form";
import { Pressable, TextInput, View, findNodeHandle } from "react-native";

const UNIT_OPTIONS = ["ml", "g", "cup"] as const;
const unitOption = (u: (typeof UNIT_OPTIONS)[number]) => ({
  value: u,
  label: u,
});

export const IngredientRow = ({
  control,
  groupIndex,
  itemIndex,
  onRemove,
  removeDisabled,
  onAnyInputFocus,
}: {
  control: Control<AddRecipeFormValues>;
  groupIndex: number;
  itemIndex: number;
  onRemove: () => void;
  removeDisabled: boolean;
  onAnyInputFocus?: (node: number | null) => void;
}) => {
  return (
    <View className="flex-row items-center gap-2">
      {/* Ingredient Name (1/2 width) */}
      <View className="min-w-0 flex-1 basis-0">
        <Controller
          control={control}
          name={`ingredientGroups.${groupIndex}.items.${itemIndex}.name`}
          render={({ field: f, fieldState }) => (
            <TextInput
              value={f.value}
              onChangeText={(t) => f.onChange(t.slice(0, 50))}
              onBlur={f.onBlur}
              onFocus={(e) =>
                onAnyInputFocus?.(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ((e.nativeEvent as any)?.target as number | undefined) ?? null
                )
              }
              underlineColorAndroid="transparent"
              placeholder="Sugar"
              placeholderTextColor="#a3a3a3"
              maxLength={50}
              className={`min-h-8 rounded-lg border bg-white px-3 py-1 text-sm ${
                fieldState.invalid
                  ? "border-danger-300 bg-red-50"
                  : "border-sage-200"
              }`}
            />
          )}
        />
      </View>

      {/* Quantity (1/2 width) */}
      <View className="min-w-0 flex-1 basis-0">
        <Controller
          control={control}
          name={`ingredientGroups.${groupIndex}.items.${itemIndex}.quantityAmount`}
          render={({ field: f, fieldState }) => (
            <View
              className={`flex-row items-center rounded-lg border bg-white ${
                fieldState.invalid
                  ? "border-danger-300 bg-red-50"
                  : "border-sage-200"
              }`}
            >
              <TextInput
                value={f.value}
                onChangeText={(t) => f.onChange(t.replace(/\s+/g, ""))}
                onBlur={f.onBlur}
                onFocus={(e) =>
                  onAnyInputFocus?.(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ((e.nativeEvent as any)?.target as number | undefined) ??
                      null
                  )
                }
                underlineColorAndroid="transparent"
                placeholder="30"
                placeholderTextColor="#a3a3a3"
                autoCapitalize="none"
                autoCorrect={false}
                className="min-h-8 min-w-0 flex-1 basis-0 px-2 py-1 text-sm"
              />
              <Controller
                control={control}
                name={`ingredientGroups.${groupIndex}.items.${itemIndex}.quantityUnit`}
                render={({ field: unitField }) => (
                  <View className="min-w-0 w-20 border-l border-sage-200">
                    <Select
                      value={unitOption(unitField.value)}
                      onValueChange={(opt) => {
                        if (!opt) return;
                        unitField.onChange(
                          opt.value as (typeof UNIT_OPTIONS)[number]
                        );
                      }}
                    >
                      <SelectTrigger
                        size="sm"
                        className="h-6 flex-1 border-0 bg-transparent px-2 py-0 shadow-none"
                      >
                        <SelectValue
                          placeholder="g"
                          className="text-sm font-semibold text-sage-700"
                        />
                      </SelectTrigger>
                      <SelectContent side="top" align="end">
                        {UNIT_OPTIONS.map((u) => (
                          <SelectItem key={u} value={u} label={u} />
                        ))}
                      </SelectContent>
                    </Select>
                  </View>
                )}
              />
            </View>
          )}
        />
      </View>

      {/* Delete (minimal space) */}
      {!removeDisabled ? (
        <Pressable
          accessibilityLabel="Remove ingredient"
          hitSlop={12}
          onPress={onRemove}
          className="h-8 w-4 items-center justify-center opacity-100 active:opacity-80"
        >
          <Icon as={Delete} size={16} color="#e53e3e" />
        </Pressable>
      ) : (
        <View className="h-8 w-4" />
      )}
    </View>
  );
};
