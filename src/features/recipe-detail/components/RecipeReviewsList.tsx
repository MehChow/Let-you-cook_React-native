import { ChevronDown } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { RecipeReview } from "@/features/recipe-detail/types";
import * as React from "react";
import { View } from "react-native";
import { RecipeReviewRow } from "./RecipeReviewRow";

interface RecipeReviewsListProps {
  reviews: RecipeReview[];
  sortLabel: string;
}

export const RecipeReviewsList: React.FC<RecipeReviewsListProps> = ({
  reviews,
  sortLabel,
}) => (
  <View className="gap-5">
    <View className="flex-row items-center justify-between">
      <Text className="text-base font-bold text-sage-700">Reviews</Text>
      <View className="flex-row items-center gap-1">
        <Text className="text-xs font-semibold text-neutral-400">{sortLabel}</Text>
        <Icon as={ChevronDown} className="size-3 text-neutral-300" />
      </View>
    </View>

    <View className="gap-4">
      {reviews.map((review) => (
        <RecipeReviewRow key={review.id} review={review} />
      ))}
    </View>
  </View>
);
