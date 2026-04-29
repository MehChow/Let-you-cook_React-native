import Chip from "@/components/Chip";
import FavoriteButton from "@/components/FavoriteButton";
import { Calories, Rating, Serving, Time } from "@/components/Icon";
import PressableCard from "@/components/PressableCard";
import UserAvatar from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Image } from "expo-image";
import * as React from "react";
import type { ImageSourcePropType } from "react-native";
import { View } from "react-native";

function MetaDot() {
  return <View className="h-0.5 w-0.5 rounded-full bg-neutral-300" />;
}

export type RecipeCardProps = {
  title: string;
  description: string;
  author: string;
  authorAvatar: ImageSourcePropType;
  timeMin: number;
  calories: number;
  serving: string;
  rating: number;
  tag: string;
  imagePlaceholderClass?: string;
  imageSource?: React.ComponentProps<typeof Image>["source"];
  isFavourite?: boolean;
  onPress?: () => void;
  onChangeFavourite?: (next: boolean) => void;
  className?: string;
};

export default function RecipeCard({
  title,
  description,
  author,
  authorAvatar,
  timeMin,
  calories,
  serving,
  rating,
  tag,
  imagePlaceholderClass,
  imageSource,
  isFavourite,
  onPress,
  onChangeFavourite,
  className,
}: RecipeCardProps) {
  const [internalFavourite, setInternalFavourite] = React.useState<boolean>(
    () => Boolean(isFavourite)
  );

  // Keep internal state in sync when the card is used in "controlled" mode.
  React.useEffect(() => {
    if (isFavourite !== undefined) {
      setInternalFavourite(Boolean(isFavourite));
    }
  }, [isFavourite]);

  const favourite = internalFavourite;

  const toggleFavourite = React.useCallback(() => {
    const next = !internalFavourite;
    setInternalFavourite(next);
    onChangeFavourite?.(next);
  }, [internalFavourite, onChangeFavourite]);

  return (
    <PressableCard
      onPress={onPress}
      elevation={7}
      pressEffect="none"
      containerClassName={cn("w-full rounded-2xl", className)}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          contentFit="cover"
          className="w-full"
          cachePolicy="memory-disk"
          transition={150}
          style={{ aspectRatio: 16 / 9 }}
        />
      ) : (
        <View
          className={cn("w-full", imagePlaceholderClass ?? "bg-accent-200")}
          style={{ aspectRatio: 16 / 9 }}
        />
      )}

      <FavoriteButton
        isActive={Boolean(favourite)}
        onPress={toggleFavourite}
        className="absolute right-3 top-3"
      />

      <View className="px-4 pb-4 pt-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground" numberOfLines={1}>
              {title}
            </Text>
            <Text
              className="mt-1 text-xs font-medium text-muted-foreground"
              numberOfLines={2}
            >
              {description}
            </Text>
          </View>

          <Badge className="rounded-full bg-accent-500/90 px-2 py-1">
            <View className="flex-row items-center gap-1">
              <Icon as={Rating} className="size-3 text-white" fill="white" />
              <Text className="text-xs font-bold text-white">
                {rating.toFixed(1)}
              </Text>
            </View>
          </Badge>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <UserAvatar source={authorAvatar} size="small" />
            <View className="flex-row items-center">
              <Text className="text-xs font-normal text-sage-400">by </Text>
              <Text className="text-xs font-semibold text-sage-400">
                {author}
              </Text>
            </View>
          </View>
        </View>

        <Separator className="my-2" />

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <View className="flex-row items-center gap-1">
              <Icon as={Time} className="size-4 text-muted-foreground" />
              <Text className="text-xs font-semibold text-muted-foreground">
                {timeMin} min
              </Text>
            </View>
            <MetaDot />
            <View className="flex-row items-center gap-1">
              <Icon as={Calories} className="size-4 text-muted-foreground" />
              <Text className="text-xs font-semibold text-muted-foreground">
                {calories} kcal
              </Text>
            </View>
            <MetaDot />
            <View className="flex-row items-center gap-1">
              <Icon as={Serving} className="size-4 text-muted-foreground" />
              <Text className="text-xs font-semibold text-muted-foreground">
                {serving}
              </Text>
            </View>
          </View>
          <Chip
            label={tag}
            className="bg-sage-500"
            textClassName="text-white font-semibold"
          />
        </View>
      </View>
    </PressableCard>
  );
}

