import Chip from "@/components/Chip";
import FavoriteButton from "@/components/FavoriteButton";
import { Time } from "@/components/Icon";
import PressableCard from "@/components/PressableCard";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Image } from "expo-image";
import * as React from "react";
import { View } from "react-native";

// Tailwind class parity with: `h-28 w-28 rounded-l-2xl`
const IMAGE_W = 112; // 28 * 4px
const IMAGE_H = 112;
const IMAGE_RADIUS = 16; // 2xl

export interface RecipeFavouriteRowCardProps {
  title: string;
  timeMin: number;
  tag: string;
  imagePlaceholderClass?: string;
  imageSource?: React.ComponentProps<typeof Image>["source"];
  isFavourite?: boolean;
  onPress?: () => void;
  onChangeFavourite?: (next: boolean) => void;
  className?: string;
}

const RecipeFavouriteRowCard: React.FC<RecipeFavouriteRowCardProps> = ({
  title,
  timeMin,
  tag,
  imagePlaceholderClass,
  imageSource,
  isFavourite,
  onPress,
  onChangeFavourite,
  className,
}) => {
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
      containerClassName={cn("w-full flex-row overflow-hidden", className)}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={150}
          style={{
            width: IMAGE_W,
            height: IMAGE_H,
            borderTopLeftRadius: IMAGE_RADIUS,
            borderBottomLeftRadius: IMAGE_RADIUS,
          }}
        />
      ) : (
        <View
          className={cn(
            "h-28 w-28 rounded-l-2xl",
            imagePlaceholderClass ?? "bg-accent-200"
          )}
          style={{
            width: IMAGE_W,
            height: IMAGE_H,
            borderTopLeftRadius: IMAGE_RADIUS,
            borderBottomLeftRadius: IMAGE_RADIUS,
          }}
        />
      )}

      <View className="relative min-h-28 flex-1 justify-between py-3 pl-3 pr-3">
        <FavoriteButton
          isActive={Boolean(favourite)}
          onPress={toggleFavourite}
          className="absolute right-3 top-3"
        />

        <View className="pr-12">
          <Text
            className="text-base font-bold text-foreground"
              numberOfLines={1}
              ellipsizeMode="tail"
          >
            {title}
          </Text>
          <View className="mt-2 flex-row items-center gap-1">
            <Icon as={Time} className="size-3.5 text-muted-foreground" />
            <Text className="text-xs font-medium text-muted-foreground">
              {timeMin} min
            </Text>
          </View>
        </View>

        <View className="mt-2 flex-row justify-end">
          <Chip
            label={tag}
            className="bg-sage-500"
            textClassName="font-semibold text-white"
          />
        </View>
      </View>
    </PressableCard>
  );
};

export default RecipeFavouriteRowCard;
