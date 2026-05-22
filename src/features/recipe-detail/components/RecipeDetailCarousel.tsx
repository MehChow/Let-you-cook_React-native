import BottomFadeOverlay from "@/components/BottomFadeOverlay";
import { ChevronLeft, Favorite } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import type { RecipeDetailImage } from "@/features/recipe-detail/types";
import { cn } from "@/lib/utils";
import { Image } from "expo-image";
import * as React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

interface RecipeDetailCarouselProps {
  images: RecipeDetailImage[];
  activeIndex: number;
  isFavourite: boolean;
  onBack: () => void;
  onToggleFavourite: () => void;
  onScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const CAROUSEL_HEIGHT = 232;

export const RecipeDetailCarousel: React.FC<RecipeDetailCarouselProps> = ({
  images,
  activeIndex,
  isFavourite,
  onBack,
  onScrollEnd,
  onToggleFavourite,
}) => {
  const { width } = useWindowDimensions();

  return (
    <View style={{ height: CAROUSEL_HEIGHT }} className="bg-neutral-200">
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <View style={{ width, height: CAROUSEL_HEIGHT }}>
            <Image
              source={item.source}
              contentFit="cover"
              cachePolicy="memory-disk"
              style={styles.image}
              accessibilityLabel={item.alt}
            />
          </View>
        )}
      />
      <BottomFadeOverlay maxOpacity={0.72} heightFraction={0.58} />

      <View className="absolute left-6 right-6 top-10 flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          className="h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white active:opacity-80"
        >
          <Icon as={ChevronLeft} className="size-5 text-neutral-500" />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isFavourite ? "Remove from favourites" : "Add to favourites"
          }
          onPress={onToggleFavourite}
          className={cn(
            "h-8 w-8 items-center justify-center rounded-full active:opacity-80",
            isFavourite ? "bg-accent-100" : "bg-white",
          )}
        >
          <Icon
            as={Favorite}
            className={cn(
              "size-4",
              isFavourite ? "text-accent-500" : "text-neutral-400",
            )}
            fill={isFavourite ? "#d97757" : "transparent"}
          />
        </Pressable>
      </View>

      <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
        {images.map((image, index) => (
          <View
            key={`${image.id}-dot`}
            className={cn(
              "h-2 w-2 rounded-full",
              index === activeIndex ? "bg-accent-500" : "bg-white",
            )}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    height: CAROUSEL_HEIGHT,
    width: "100%",
  },
});
