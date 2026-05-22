import { Comment } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { Pressable, View } from "react-native";

interface RecipeReviewsFooterProps {
  reviewCount: number;
  bottomInset: number;
  onPress: () => void;
}

export const RecipeReviewsFooter: React.FC<RecipeReviewsFooterProps> = ({
  bottomInset,
  onPress,
  reviewCount,
}) => (
  <View
    className="absolute bottom-0 left-0 right-0 border-t border-neutral-200 bg-white px-6 pt-2"
    style={{ paddingBottom: Math.max(bottomInset, 8) + 4 }}
  >
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ratings and reviews, ${reviewCount}`}
      onPress={onPress}
      className="h-11 flex-row items-center justify-center gap-2 rounded-full bg-sage-700 active:opacity-90"
    >
      <Icon as={Comment} className="size-4 text-sage-100" />
      <Text className="text-xs font-bold text-white">
        Ratings & Reviews ({reviewCount})
      </Text>
    </Pressable>
  </View>
);
