import { ImagesDraggableGrid } from "@/components/add-recipe/ImagesDraggableGrid";
import { Image as ImageIcon } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Pressable, ScrollView, View } from "react-native";
import { ScrollView as GHScrollView } from "react-native-gesture-handler";
import { RecipeImagesCarousel } from "./RecipeImagesCarousel";

export interface RecipeImageField {
  clientKey: string;
  uri: string;
}

export interface RecipeImageGridModel {
  clientKey: string;
  uri: string;
}

export interface RecipeImagesEditViewProps {
  carouselIndex: number;
  carouselRef: React.RefObject<ScrollView | null>;
  contentWidth: number;
  fields: RecipeImageField[];
  gridDragging: boolean;
  gridGap: number;
  imagesError?: string;
  onAppendImage: () => void;
  onCarouselMomentumScrollEnd: (
    contentOffsetX: number,
    slideCount: number,
  ) => void;
  onGridReorder: (next: RecipeImageGridModel[]) => void;
  photoModels: RecipeImageGridModel[];
  removeByClientKey: (clientKey: string) => void;
  setGridDragging: (dragging: boolean) => void;
}

export function RecipeImagesEditView({
  carouselIndex,
  carouselRef,
  contentWidth,
  fields,
  gridDragging,
  gridGap,
  imagesError,
  onAppendImage,
  onCarouselMomentumScrollEnd,
  onGridReorder,
  photoModels,
  removeByClientKey,
  setGridDragging,
}: RecipeImagesEditViewProps) {
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
          <RecipeImagesCarousel
            width={contentWidth}
            carouselRef={carouselRef}
            uris={fields.map((field) => field.uri)}
            slideKeys={fields.map((field) => field.clientKey)}
            showDots={fields.length > 1}
            dotsActiveIndex={carouselIndex}
            onMomentumScrollEndX={(x) =>
              onCarouselMomentumScrollEnd(x, fields.length)
            }
          />
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
        <Text className="text-center font-bold text-sage-800">
          Tap to upload images
        </Text>
        <Text className="text-center text-xs text-neutral-500">
          JPG, PNG, WEBP — up to 10 MB each
        </Text>
      </View>
    </Pressable>
  );
}
