import { Description, Recipe, Serving, Time } from "@/components/Icon";
import { Text } from "@/components/ui/text";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_RECIPE_NAME_LENGTH,
} from "@/features/add-recipe/constants";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { LabeledField } from "@/features/add-recipe/wizard/LabeledField";
import {
  Controller,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";
import { TextInput, View } from "react-native";

export interface BasicsSectionProps {
  mode: "edit" | "preview";
}

export function BasicsSection({ mode }: BasicsSectionProps) {
  const { control } = useFormContext<AddRecipeFormValues>();
  const { errors } = useFormState({ control });
  const previewRecipeName = useWatch({ control, name: "recipeName" });
  const previewDescription = useWatch({ control, name: "description" });
  const previewCookTime = useWatch({ control, name: "cookTimeMinutes" });
  const previewServings = useWatch({ control, name: "servings" });

  if (mode === "preview") {
    return (
      <View className="gap-3">
        <View className="flex-row items-center gap-2">
          <Recipe size={18} color="#426159" />
          <Text className="text-sm font-semibold">Recipe name</Text>
        </View>
        <Text className="text-base">{previewRecipeName || "—"}</Text>
        <View className="mt-2 flex-row items-center gap-2">
          <Description size={18} color="#426159" />
          <Text className="text-sm font-semibold">Description (optional)</Text>
        </View>
        <Text className="text-base">
          {previewDescription?.trim() ? previewDescription : "—"}
        </Text>
        <Text className="text-right text-xs text-sage-500">
          {previewDescription?.length ?? 0} / {MAX_DESCRIPTION_LENGTH}
        </Text>
        <View className="mt-2 flex-row gap-2">
          <View className="flex-1">
            <View className="mb-1.5 flex-row items-center gap-2">
              <Time size={18} color="#426159" />
              <Text className="text-sm font-semibold">Cook time</Text>
            </View>
            <Text className="rounded-xl border border-sage-200 bg-white px-3 py-3 text-base">
              {previewCookTime ? `${previewCookTime} min` : "—"}
            </Text>
          </View>
          <View className="flex-1">
            <View className="mb-1.5 flex-row items-center gap-2">
              <Serving size={18} color="#426159" />
              <Text className="text-sm font-semibold">Serving</Text>
            </View>
            <Text className="rounded-xl border border-sage-200 bg-white px-3 py-3 text-base">
              {previewServings || "—"}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Controller
        control={control}
        name="recipeName"
        render={({ field: { onChange, onBlur, value } }) => (
          <LabeledField
            label="Recipe name"
            icon={Recipe}
            errorMessage={errors.recipeName?.message}
          >
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Peppy juicy wings"
              placeholderTextColor="#75948c"
              maxLength={MAX_RECIPE_NAME_LENGTH}
              className="rounded-xl border border-sage-200 bg-white px-3 text-base"
            />
          </LabeledField>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <LabeledField
            label="Description (optional)"
            icon={Description}
            errorMessage={errors.description?.message}
          >
            <View className="relative">
              <TextInput
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="yummy chicken wings"
                placeholderTextColor="#75948c"
                multiline
                textAlignVertical="top"
                maxLength={MAX_DESCRIPTION_LENGTH}
                className="min-h-28 rounded-xl border border-sage-200 bg-white px-3 pb-7 text-base"
              />
              <View pointerEvents="none" className="absolute bottom-2 right-3">
                <Text className="text-xs text-sage-500">
                  {(value ?? "").length} / {MAX_DESCRIPTION_LENGTH}
                </Text>
              </View>
            </View>
          </LabeledField>
        )}
      />

      <View className="mb-4 flex-row gap-2">
        <View className="min-w-0 flex-1">
          <Controller
            control={control}
            name="cookTimeMinutes"
            render={({ field: { onChange, onBlur, value } }) => (
              <LabeledField
                label="Cook time"
                icon={Time}
                errorMessage={errors.cookTimeMinutes?.message}
              >
                <View className="flex-row items-center rounded-xl border border-sage-200 bg-white px-3">
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="30"
                    placeholderTextColor="#75948c"
                    keyboardType="number-pad"
                    className="min-w-0 flex-1 text-base"
                  />
                  <Text className="pl-1 text-sm font-semibold  text-sage-500">
                    min
                  </Text>
                </View>
              </LabeledField>
            )}
          />
        </View>
        <View className="min-w-0 flex-1">
          <Controller
            control={control}
            name="servings"
            render={({ field: { onChange, onBlur, value } }) => (
              <LabeledField
                label="Serving"
                icon={Serving}
                errorMessage={errors.servings?.message}
              >
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="3-4"
                  placeholderTextColor="#75948c"
                  keyboardType="numbers-and-punctuation"
                  className="rounded-xl border border-sage-200 bg-white px-3 text-base"
                />
              </LabeledField>
            )}
          />
        </View>
      </View>
    </View>
  );
}
