import { Calories, Rating, Serving, Time } from "@/components/Icon";
import UserAvatar from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import type { RecipeDetail } from "@/features/recipe-detail/types";
import * as React from "react";
import { View } from "react-native";
import { RecipeMetaItem } from "./RecipeMetaItem";

interface RecipeDetailHeaderProps {
  recipe: RecipeDetail;
}

export const RecipeDetailHeader: React.FC<RecipeDetailHeaderProps> = ({
  recipe,
}) => (
  <View className="border-b border-neutral-200 pb-4 pt-5">
    <View className="flex-row items-start justify-between gap-3">
      <View className="flex-1">
        <Text className="text-xl font-bold text-black">{recipe.title}</Text>
        <Text className="mt-1 text-[10px] font-medium text-neutral-400">
          {recipe.description}
        </Text>
      </View>

      <Badge className="mt-0.5 rounded-full bg-accent-500 px-2 py-1">
        <View className="flex-row items-center gap-1">
          <Icon as={Rating} className="size-3 text-white" fill="white" />
          <Text className="text-xs font-bold text-white">
            {recipe.rating.toFixed(1)}
          </Text>
        </View>
      </Badge>
    </View>

    <View className="mt-4 flex-row items-center justify-between gap-2">
      <View className="flex-row items-center gap-2">
        <UserAvatar source={recipe.author.avatar} size="medium" />
        <View>
          <Text className="text-xs font-bold text-black">
            {recipe.author.name}
          </Text>
          <Text className="text-[9px] font-medium text-neutral-400">
            {recipe.author.averageRatingLabel}
          </Text>
        </View>
      </View>

      <Separator orientation="vertical" className="bg-neutral-200" />

      <View className="flex-1 flex-row items-center justify-center gap-3">
        <RecipeMetaItem
          icon={Calories}
          value={`${recipe.calories} kcal`}
          label="Calories"
          color="text-accent-500"
        />
        <RecipeMetaItem
          icon={Serving}
          value={recipe.servings}
          label="Serving"
        />
        <RecipeMetaItem
          icon={Time}
          value={`${recipe.cookTimeMinutes} min`}
          label="Duration"
        />
      </View>
    </View>
  </View>
);
