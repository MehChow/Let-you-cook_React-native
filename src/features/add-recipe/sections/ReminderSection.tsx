import { Reminder as ReminderIcon } from "@/components/Icon";
import { Text } from "@/components/ui/text";
import { MAX_CHEF_NOTES_LENGTH } from "@/features/add-recipe/constants";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { LabeledField } from "@/features/add-recipe/wizard/LabeledField";
import { Controller, useFormContext, useFormState, useWatch } from "react-hook-form";
import { TextInput, View } from "react-native";

export interface ReminderSectionProps {
  mode: "edit" | "preview";
}

export function ReminderSection({ mode }: ReminderSectionProps) {
  const { control } = useFormContext<AddRecipeFormValues>();
  const { errors } = useFormState({ control });
  const notes = useWatch({ control, name: "chefNotes" });

  if (mode === "preview") {
    return (
      <View>
        <View className="mb-2 flex-row items-center gap-2">
          <ReminderIcon size={18} color="#426159" />
          <Text className="text-sm font-semibold">
            {"Chef's notes (optional)"}
          </Text>
        </View>
        <Text className="text-base">
          {notes?.trim() ? notes : "—"}
        </Text>
        {(notes?.length ?? 0) > 0 ? (
          <Text className="mt-1 text-right text-xs text-sage-500">
            {notes.length}/{MAX_CHEF_NOTES_LENGTH}
          </Text>
        ) : (
          <Text className="mt-1 text-right text-xs text-sage-500">
            0/{MAX_CHEF_NOTES_LENGTH}
          </Text>
        )}
      </View>
    );
  }

  return (
    <Controller
      control={control}
      name="chefNotes"
      render={({ field: { onChange, onBlur, value } }) => (
        <LabeledField
          label={"Chef's notes (optional)"}
          icon={ReminderIcon}
          errorMessage={errors.chefNotes?.message}
        >
          <TextInput
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="e.g. Rest the steak for 5 min after cooking"
            placeholderTextColor="#75948c"
            multiline
            textAlignVertical="top"
            maxLength={MAX_CHEF_NOTES_LENGTH}
            className="min-h-28 rounded-xl border border-sage-200 bg-white px-3 py-3 text-base"
          />
          <Text className="text-right text-xs text-sage-500">
            {(value ?? "").length}/{MAX_CHEF_NOTES_LENGTH}
          </Text>
        </LabeledField>
      )}
    />
  );
}
