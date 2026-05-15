import { Reminder as ReminderIcon } from "@/components/Icon";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { MAX_CHEF_NOTES_LENGTH } from "@/features/add-recipe/constants";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import {
  Controller,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";
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
      <View className="gap-3">
        <View className="flex-row items-center gap-2">
          <ReminderIcon size={18} color="#426159" />
          <Text className="text-sm font-semibold">
            {"Chef's notes (optional)"}
          </Text>
        </View>
        <Text className="text-base text-black">
          {notes?.trim() ? notes : "No extra notes added"}
        </Text>
        <Text className="text-right text-xs text-sage-500">
          {notes?.length ?? 0} / {MAX_CHEF_NOTES_LENGTH}
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3 pb-2">
      <Controller
        control={control}
        name="chefNotes"
        render={({ field: { onChange, onBlur, value } }) => (
          <Card className="gap-0 rounded-2xl border border-neutral-200 bg-white py-4">
            <CardContent className="px-4">
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <ReminderIcon size={18} color="#426159" />
                  <Text className="text-base font-semibold">
                    {"Chef's notes (optional)"}
                  </Text>
                </View>

                <View className="relative">
                  <TextInput
                    value={value ?? ""}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="e.g. Rest the steak for 5 min after cooking"
                    placeholderTextColor="#8d8d95"
                    multiline
                    textAlignVertical="top"
                    maxLength={MAX_CHEF_NOTES_LENGTH}
                    className="min-h-28 rounded-xl border border-neutral-200 bg-white px-3 pb-7 pt-2.5 text-sm text-black"
                  />
                  <View
                    pointerEvents="none"
                    className="absolute bottom-2 right-3"
                  >
                    <Text className="text-xs text-sage-500">
                      {(value ?? "").length} / {MAX_CHEF_NOTES_LENGTH}
                    </Text>
                  </View>
                </View>

                {errors.chefNotes?.message ? (
                  <Text className="pl-1 text-[11px] font-medium text-danger-500">
                    {errors.chefNotes.message}
                  </Text>
                ) : null}
              </View>
            </CardContent>
          </Card>
        )}
      />

      <Card className="gap-0 rounded-2xl bg-sage-200 py-4">
        <CardContent className="px-6">
          <View className="gap-3">
            <Text className="text-base font-semibold text-black">
              Suggested notes to include
            </Text>

            <View className="pl-4">
              <Text className="text-sm leading-5 text-sage-600 font-medium">
                • Ingredient substitutions
              </Text>
              <Text className="text-sm leading-5 text-sage-600 font-medium">
                • Storage and reheating tips
              </Text>
              <Text className="text-sm leading-5 text-sage-600 font-medium">
                • Prep-ahead instructions
              </Text>
              <Text className="text-sm leading-5 text-sage-600 font-medium">
                • Allergy information
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
