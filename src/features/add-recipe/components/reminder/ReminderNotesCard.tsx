import { AddRecipeCounterTextArea } from "@/components/add-recipe/AddRecipeCounterTextArea";
import { Reminder as ReminderIcon } from "@/components/Icon";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { MAX_CHEF_NOTES_LENGTH } from "@/features/add-recipe/constants";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import type { Control } from "react-hook-form";
import { View } from "react-native";

export interface ReminderNotesCardProps {
  control: Control<AddRecipeFormValues>;
  errorMessage?: string;
}

export function ReminderNotesCard({
  control,
  errorMessage,
}: ReminderNotesCardProps) {
  return (
    <Card className="gap-0 rounded-2xl border border-neutral-200 bg-white py-4">
      <CardContent className="px-4">
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <ReminderIcon size={18} color="#426159" />
            <Text className="text-base font-semibold">
              {"Chef's notes (optional)"}
            </Text>
          </View>

          <AddRecipeCounterTextArea
            control={control}
            name="chefNotes"
            placeholder="e.g. Rest the steak for 5 min after cooking"
            placeholderTextColor="#8d8d95"
            maxLength={MAX_CHEF_NOTES_LENGTH}
            inputClassName="min-h-28 border-neutral-200 px-3 pb-7 pt-2.5 text-sm text-black"
          />

          {errorMessage ? (
            <Text className="pl-1 text-[11px] font-medium text-danger-500">
              {errorMessage}
            </Text>
          ) : null}
        </View>
      </CardContent>
    </Card>
  );
}
