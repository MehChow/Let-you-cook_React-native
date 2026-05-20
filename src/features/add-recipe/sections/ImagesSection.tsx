import { ImagesDraggableGrid } from "@/components/add-recipe/ImagesDraggableGrid";
import { Image as ImageIcon } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useRecipeImagesField } from "@/features/add-recipe/hooks/useRecipeImagesField";
import { Image } from "expo-image";
import type { ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { ScrollView as GHScrollView } from "react-native-gesture-handler";

export interface ImagesSectionProps {
  mode: "edit" | "preview";
}

export function ImagesSection({ mode }: ImagesSectionProps) {
  const {
    contentWidth,
    previewWidth,
    previewImages,
    imagesError,
    fields,
    photoModels,
    carouselRef,
    carouselIndex,
    gridDragging,
    setGridDragging,
    onGridReorder,
    onAppendImage,
    removeByClientKey,
    onCarouselMomentumScrollEnd,
    gridGap,
  } = useRecipeImagesField();

  if (mode === "preview") {
    const uris = (previewImages ?? []).map((r) => r.uri).filter(Boolean);

    if (uris.length === 0) {
      return (
        <View className="items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-accent-100 py-10">
          <Text className="text-sage-500">No photos added</Text>
        </View>
      );
    }

    return (
      <View className="gap-3">
        <PreviewCarousel uris={uris} width={previewWidth} />
        <View
          className="flex-row flex-wrap"
          style={{ gap: gridGap, width: previewWidth, alignSelf: "center" }}
        >
          {uris.map((uri, i) => (
            <PreviewGridImage
              key={`${uri}-thumb-${i}`}
              uri={uri}
              side={(previewWidth - gridGap * 2) / 3}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <GHScrollView
      className="flex-1"
      style={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={!gridDragging}
      nestedScrollEnabled
    >
      <View className="gap-1 pb-6">
        {fields.length === 0 ? (
          <CarouselPlaceholder width={contentWidth} onPress={onAppendImage} />
        ) : (
          <>
            <EditCarousel
              width={contentWidth}
              carouselRef={carouselRef}
              fields={fields}
              showDots={fields.length > 1}
              dotsActiveIndex={carouselIndex}
              onMomentumScrollEndX={(x) =>
                onCarouselMomentumScrollEnd(x, fields.length)
              }
            />
          </>
        )}

        {imagesError ? (
          <Text className="pl-1 text-[11px] font-medium text-danger-500">
            {imagesError}
          </Text>
        ) : null}

        {fields.length > 0 ? (
          <ImagesDraggableGrid
            photos={photoModels}
            contentWidth={contentWidth}
            gapVisual={gridGap}
            onReorder={onGridReorder}
            onAppend={onAppendImage}
            onRemoveByClientKey={removeByClientKey}
            onDraggingChange={setGridDragging}
          />
        ) : null}
      </View>
    </GHScrollView>
  );
}

function CarouselPlaceholder({
  width,
  onPress,
}: {
  width: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-accent-100 active:opacity-90"
    >
      <View
        className="items-center justify-center gap-2 py-8"
        style={{ width, aspectRatio: 16 / 9 }}
      >
        <View className="rounded-full bg-sage-100 p-3">
          <Icon as={ImageIcon} size={28} className="text-sage-500" />
        </View>
        <Text className="text-center font-bold">Tap to upload images</Text>
        <Text className="text-center text-xs text-neutral-500">
          JPG, PNG, WEBP — up to 10 MB each
        </Text>
      </View>
    </Pressable>
  );
}

function PreviewCarousel({ uris, width }: { uris: string[]; width: number }) {
  return (
    <ScrollView
      horizontal
      pagingEnabled
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      style={{ width, alignSelf: "center" }}
    >
      {uris.map((uri, i) => (
        <CarouselSlide
          key={`${uri}-${i}`}
          uri={uri}
          width={width}
          isThumb={i === 0}
        />
      ))}
    </ScrollView>
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

function EditCarousel({
  width,
  carouselRef,
  fields,
  showDots,
  dotsActiveIndex,
  onMomentumScrollEndX,
}: {
  width: number;
  carouselRef: React.RefObject<ScrollView | null>;
  fields: { clientKey: string; uri: string }[];
  showDots: boolean;
  dotsActiveIndex: number;
  onMomentumScrollEndX: (x: number) => void;
}) {
  return (
    <View className="relative" style={{ width }}>
      <ScrollView
        ref={carouselRef}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          onMomentumScrollEndX(e.nativeEvent.contentOffset.x)
        }
        style={{ width }}
      >
        {fields.map((field, slideIndex) => (
          <CarouselSlide
            key={field.clientKey}
            uri={field.uri}
            width={width}
            isThumb={slideIndex === 0}
          />
        ))}
      </ScrollView>

      {showDots ? (
        <View className="absolute bottom-2 left-0 right-0 items-center justify-center pointer-events-none">
          <View className="flex-row items-center gap-2 rounded-full bg-black/35 px-3 py-1.5">
            <CarouselDots
              count={fields.length}
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
      <View className="relative overflow-hidden rounded-2xl bg-sage-100">
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
      />
    );
  }

  return (
    <View className="flex-row items-center justify-center gap-1.5">{dots}</View>
  );
}
