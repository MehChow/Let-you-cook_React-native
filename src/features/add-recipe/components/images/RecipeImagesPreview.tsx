import { Text } from "@/components/ui/text";
import { Image } from "expo-image";
import { Star } from "lucide-react-native";
import { useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { RecipeImagesCarousel } from "./RecipeImagesCarousel";

export interface RecipeImagesPreviewProps {
  uris: string[];
  width: number;
  gridGap: number;
}

export function RecipeImagesPreview({
  uris,
  width,
  gridGap,
}: RecipeImagesPreviewProps) {
  const carouselRef = useRef<ScrollView>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const scrollToImage = (index: number) => {
    carouselRef.current?.scrollTo({ x: width * index, y: 0, animated: true });
    setCarouselIndex(index);
  };

  if (uris.length === 0) {
    return (
      <View className="items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-accent-100 py-10">
        <Text className="text-sage-500">No photos added</Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <View style={{ width, alignSelf: "center" }}>
        <RecipeImagesCarousel
          uris={uris}
          width={width}
          carouselRef={carouselRef}
          showDots={uris.length > 1}
          dotsActiveIndex={carouselIndex}
          onMomentumScrollEndX={(x) => {
            const nextIndex = Math.round(x / width);
            setCarouselIndex(
              Math.min(Math.max(nextIndex, 0), Math.max(uris.length - 1, 0)),
            );
          }}
        />
      </View>
      <View
        className="flex-row flex-wrap"
        style={{ gap: gridGap, width, alignSelf: "center" }}
      >
        {uris.map((uri, i) => (
          <PreviewGridImage
            key={`${uri}-thumb-${i}`}
            onPress={() => scrollToImage(i)}
            uri={uri}
            side={(width - gridGap * 2) / 3}
            isActive={i === carouselIndex}
            isThumbnail={i === 0}
          />
        ))}
      </View>
    </View>
  );
}

function PreviewGridImage({
  onPress,
  uri,
  side,
  isActive,
  isThumbnail,
}: {
  onPress: () => void;
  uri: string;
  side: number;
  isActive: boolean;
  isThumbnail: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Preview image"
      className="overflow-hidden rounded-xl"
      style={{ width: side, opacity: isActive ? 1 : 0.4 }}
    >
      <Image
        source={{ uri }}
        style={{ width: side, aspectRatio: 1, borderRadius: 12 }}
        contentFit="cover"
      />
      {isThumbnail ? (
        <View className="absolute right-1 top-1 rounded-full bg-black/55 p-1">
          <Star size={14} color="#86efac" fill="#86efac" />
        </View>
      ) : null}
    </Pressable>
  );
}
