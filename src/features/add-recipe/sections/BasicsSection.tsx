import { Description, Recipe, Serving, Time } from "@/components/Icon";
import { AddRecipeCounterTextArea } from "@/components/add-recipe/AddRecipeCounterTextArea";
import { AddRecipeTextField } from "@/components/add-recipe/AddRecipeTextField";
import { Text } from "@/components/ui/text";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_RECIPE_NAME_LENGTH,
} from "@/features/add-recipe/constants";
import { useBasicsSectionField } from "@/features/add-recipe/hooks/useBasicsSectionField";
import { LabeledField } from "@/features/add-recipe/wizard/LabeledField";
import { View } from "react-native";
import { BasicsSectionPreview } from "../components/basics/BasicsSectionPreview";

export interface BasicsSectionProps {
  mode: "edit" | "preview";
}

export function BasicsSection({ mode }: BasicsSectionProps) {
  const { control, errorMessages, previewValues } = useBasicsSectionField();

  if (mode === "preview") {
    return <BasicsSectionPreview {...previewValues} />;
  }

  return (
    <View>
      <LabeledField
        label="Recipe name"
        icon={Recipe}
        errorMessage={errorMessages.recipeName}
      >
        <AddRecipeTextField
          control={control}
          name="recipeName"
          placeholder="Peppy juicy wings"
          maxLength={MAX_RECIPE_NAME_LENGTH}
        />
      </LabeledField>

      <LabeledField
        label="Description (optional)"
        icon={Description}
        errorMessage={errorMessages.description}
      >
        <AddRecipeCounterTextArea
          control={control}
          name="description"
          placeholder="yummy chicken wings"
          maxLength={MAX_DESCRIPTION_LENGTH}
          inputClassName="min-h-28 pb-7"
        />
      </LabeledField>

      <View className="mb-4 flex-row gap-2">
        <View className="min-w-0 flex-1">
          <LabeledField
            label="Cook time"
            icon={Time}
            errorMessage={errorMessages.cookTimeMinutes}
          >
            <AddRecipeTextField
              control={control}
              name="cookTimeMinutes"
              placeholder="30"
              keyboardType="number-pad"
              trailingAccessory={
                <Text className="text-sm font-semibold text-sage-500">min</Text>
              }
              containerClassName="px-3"
              inputClassName="text-base"
            />
          </LabeledField>
        </View>

        <View className="min-w-0 flex-1">
          <LabeledField
            label="Serving"
            icon={Serving}
            errorMessage={errorMessages.servings}
          >
            <AddRecipeTextField
              control={control}
              name="servings"
              placeholder="4"
              keyboardType="number-pad"
            />
          </LabeledField>
        </View>
      </View>
    </View>
  );
}
