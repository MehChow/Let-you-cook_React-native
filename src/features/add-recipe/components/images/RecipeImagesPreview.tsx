import { Text } from "@/components/ui/text";
import { Image } from "expo-image";
import { View } from "react-native";
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
        <RecipeImagesCarousel uris={uris} width={width} />
      </View>
      <View
        className="flex-row flex-wrap"
        style={{ gap: gridGap, width, alignSelf: "center" }}
      >
        {uris.map((uri, i) => (
          <PreviewGridImage
            key={`${uri}-thumb-${i}`}
            uri={uri}
            side={(width - gridGap * 2) / 3}
          />
        ))}
      </View>
    </View>
  );
}

function PreviewGridImage({ uri, side }: { uri: string; side: number }) {
  return (
    <Image
      source={{ uri }}
      style={{ width: side, aspectRatio: 1, borderRadius: 12 }}
      contentFit="cover"
    />
  );
}
