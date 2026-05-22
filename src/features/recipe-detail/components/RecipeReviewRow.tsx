import UserAvatar from "@/components/UserAvatar";
import { Text } from "@/components/ui/text";
import type { RecipeReview } from "@/features/recipe-detail/types";
import * as React from "react";
import { View } from "react-native";
import { RecipeStarRating } from "./RecipeStarRating";

interface RecipeReviewRowProps {
  review: RecipeReview;
}

export const RecipeReviewRow: React.FC<RecipeReviewRowProps> = ({ review }) => (
  <View className="gap-2">
    <View className="flex-row items-center justify-between gap-3">
      <View className="min-w-0 flex-row items-center gap-2">
        <UserAvatar source={review.authorAvatar} size="medium" />
        <View className="min-w-0">
          <Text className="text-xs font-bold text-black">{review.authorName}</Text>
          <Text className="text-[9px] font-medium text-neutral-400">
            {review.createdAtLabel}
          </Text>
        </View>
      </View>
      <RecipeStarRating readonly value={review.rating} />
    </View>
    {review.comment ? (
      <Text className="pl-[50px] text-xs font-medium text-sage-700">
        {review.comment}
      </Text>
    ) : null}
  </View>
);
