import { Submit } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { colors } from "@/util/twColor";
import * as React from "react";
import { Pressable, TextInput, View } from "react-native";
import { RecipeStarRating } from "./RecipeStarRating";

interface RecipeReviewFormProps {
  comment: string;
  rating: number;
  onChangeComment: (value: string) => void;
  onChangeRating: (value: number) => void;
  onSubmit: () => void;
}

export const RecipeReviewForm: React.FC<RecipeReviewFormProps> = ({
  comment,
  onChangeComment,
  onChangeRating,
  onSubmit,
  rating,
}) => (
  <View className="border-t border-neutral-200 pt-4">
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-base font-bold text-sage-700">Leave a review</Text>
      <RecipeStarRating value={rating} onChange={onChangeRating} />
    </View>

    <TextInput
      value={comment}
      onChangeText={onChangeComment}
      placeholder="Comment (optional)"
      placeholderTextColor={colors.neutral[400]}
      multiline
      textAlignVertical="top"
      className="h-[60px] rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium text-black"
    />

    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Submit review"
      onPress={onSubmit}
      className="mt-2 h-10 flex-row items-center justify-center gap-2 rounded-full bg-sage-700 active:opacity-90"
    >
      <Icon as={Submit} className="size-4 text-sage-100" />
      <Text className="text-xs font-bold text-white">Submit</Text>
    </Pressable>
  </View>
);
