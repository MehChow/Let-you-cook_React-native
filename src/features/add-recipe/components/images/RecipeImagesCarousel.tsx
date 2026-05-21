import { Text } from "@/components/ui/text";
import { Image } from "expo-image";
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";

export interface RecipeImagesCarouselProps {
  uris: string[];
  width: number;
  carouselRef?: React.RefObject<ScrollView | null>;
  slideKeys?: string[];
  showDots?: boolean;
  dotsActiveIndex?: number;
  onMomentumScrollEndX?: (x: number) => void;
}

export function RecipeImagesCarousel({
  uris,
  width,
  carouselRef,
  slideKeys,
  showDots = false,
  dotsActiveIndex = 0,
  onMomentumScrollEndX,
}: RecipeImagesCarouselProps) {
  return (
    <View className="relative" style={{ width }}>
      <ScrollView
        ref={carouselRef}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          onMomentumScrollEndX?.(e.nativeEvent.contentOffset.x)
        }
        style={{ width, borderRadius: 16 }}
      >
        {uris.map((uri, slideIndex) => (
          <CarouselSlide
            key={slideKeys?.[slideIndex] ?? `${uri}-${slideIndex}`}
            uri={uri}
            width={width}
            isThumb={slideIndex === 0}
          />
        ))}
      </ScrollView>

      {showDots ? (
        <View className="absolute bottom-2 left-0 right-0 items-center justify-center pointer-events-none">
          <View className="flex-row items-center gap-2 rounded-full bg-black/35 px-3 py-1.5">
            <CarouselDots
              count={uris.length}
              activeIndex={dotsActiveIndex}
              dotKeyPrefix="dot"
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function CarouselSlide({
  uri,
  width,
  isThumb,
}: {
  uri: string;
  width: number;
  isThumb: boolean;
}) {
  return (
    <View style={{ width }}>
      <View className="relative overflow-hidden bg-sage-100">
        <Image
          source={{ uri }}
          style={{ width, aspectRatio: 16 / 9 }}
          contentFit="cover"
        />
        {isThumb ? (
          <View className="absolute right-3 top-3 rounded-full bg-sage-600 px-3 py-1">
            <Text className="text-xs font-semibold text-white">Thumbnail</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function CarouselDots({
  count,
  activeIndex,
  dotKeyPrefix,
}: {
  count: number;
  activeIndex: number;
  dotKeyPrefix: string;
}) {
  const dots: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    dots.push(
      <View
        key={`${dotKeyPrefix}-${i}`}
        className={`h-2 w-2 rounded-full ${
          activeIndex === i ? "bg-orange-400" : "bg-white/80"
        }`}
      />,
    );
  }

  return (
    <View className="flex-row items-center justify-center gap-1.5">{dots}</View>
  );
}
