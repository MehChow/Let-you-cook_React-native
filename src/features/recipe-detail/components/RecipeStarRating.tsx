import { Rating } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import * as React from "react";
import { Pressable, View } from "react-native";

interface RecipeStarRatingProps {
  value: number;
  size?: number;
  readonly?: boolean;
  onChange?: (value: number) => void;
}

export const RecipeStarRating: React.FC<RecipeStarRatingProps> = ({
  onChange,
  readonly = false,
  size = 16,
  value,
}) => (
  <View className="flex-row items-center">
    {[1, 2, 3, 4, 5].map((star) => {
      const filled = star <= value;
      const starIcon = (
        <Icon
          as={Rating}
          className="text-warning-500"
          fill={filled ? "#f6ad55" : "transparent"}
          size={size}
        />
      );

      if (readonly) {
        return <View key={star}>{starIcon}</View>;
      }

      return (
        <Pressable
          key={star}
          accessibilityRole="button"
          accessibilityLabel={`${star} star`}
          onPress={() => onChange?.(star)}
          className="active:opacity-70"
        >
          {starIcon}
        </Pressable>
      );
    })}
  </View>
);
