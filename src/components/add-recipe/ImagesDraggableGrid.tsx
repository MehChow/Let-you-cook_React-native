import { Add, Remove } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { MAX_RECIPE_IMAGES } from "@/features/add-recipe/constants";
import { Image } from "expo-image";
import { Star } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { DraggableGrid } from "react-native-draggable-grid";

/** Library requires `key`; photos use stable `clientKey`. */
export type RecipeGridPhotoItem = {
  key: string;
  uri: string;
  clientKey: string;
  isPhoto: true;
};

export type RecipeGridEmptyItem = {
  key: string;
  isPhoto: false;
  disabledDrag: true;
  disabledReSorted: true;
};

export type RecipeGridDraggableItem = RecipeGridPhotoItem | RecipeGridEmptyItem;

export function buildRecipeGridData(
  photos: { uri: string; clientKey: string }[]
): RecipeGridDraggableItem[] {
  const out: RecipeGridDraggableItem[] = [];
  for (let i = 0; i < MAX_RECIPE_IMAGES; i++) {
    if (i < photos.length) {
      const p = photos[i]!;
      out.push({
        key: p.clientKey,
        isPhoto: true,
        uri: p.uri,
        clientKey: p.clientKey,
      });
    } else {
      out.push({
        key: `empty-slot-${i}`,
        isPhoto: false,
        disabledDrag: true,
        disabledReSorted: true,
      });
    }
  }
  return out;
}

export function extractPhotosFromGrid(
  sorted: RecipeGridDraggableItem[]
): { uri: string; clientKey: string }[] {
  return sorted
    .filter((x): x is RecipeGridPhotoItem => x.isPhoto)
    .map((x) => ({ uri: x.uri, clientKey: x.clientKey }));
}

export interface ImagesDraggableGridProps {
  photos: { uri: string; clientKey: string }[];
  contentWidth: number;
  gapVisual: number;
  onReorder: (nextPhotos: { uri: string; clientKey: string }[]) => void;
  onAppend: () => void;
  onRemoveByClientKey: (clientKey: string) => void;
  onDraggingChange: (dragging: boolean) => void;
}

export function ImagesDraggableGrid({
  photos,
  contentWidth,
  gapVisual,
  onReorder,
  onAppend,
  onRemoveByClientKey,
  onDraggingChange,
}: ImagesDraggableGridProps) {
  const gridData = useMemo(() => buildRecipeGridData(photos), [photos]);

  /** Lib Block wraps TouchableWithoutFeedback with no intrinsic size — use fixed sizes, not % / flex:1 fills. */
  const cellOuter = contentWidth / 3;
  const thumbSide = Math.max(0, cellOuter - gapVisual);

  return (
    <DraggableGrid<RecipeGridDraggableItem>
      numColumns={3}
      data={gridData}
      delayLongPress={190}
      itemHeight={cellOuter}
      style={{ width: contentWidth, flexGrow: 0 }}
      onDragItemActive={() => {
        onDraggingChange(true);
      }}
      onDragRelease={(sorted) => {
        onReorder(extractPhotosFromGrid(sorted));
        onDraggingChange(false);
      }}
      onItemPress={(item) => {
        if (!item.isPhoto) {
          onAppend();
        }
      }}
      renderItem={(item, order) => (
        <View
          style={[styles.cellFrame, { width: cellOuter, height: cellOuter }]}
          pointerEvents="box-none"
        >
          {item.isPhoto ? (
            <View
              className="relative overflow-hidden rounded-xl border border-sage-200 bg-white"
              style={{
                width: thumbSide,
                height: thumbSide,
              }}
            >
              <Image
                source={{ uri: item.uri }}
                style={{ width: thumbSide, height: thumbSide }}
                contentFit="cover"
              />
              <View className="absolute right-1 top-1 flex-row items-center gap-1 pointer-events-auto">
                {order === 0 ? (
                  <View className="rounded-full bg-black/55 p-1">
                    <Star size={14} color="#86efac" fill="#86efac" />
                  </View>
                ) : null}
                <Pressable
                  accessibilityLabel="Remove photo"
                  hitSlop={8}
                  onPress={() => onRemoveByClientKey(item.clientKey)}
                  className="rounded-full bg-black/55 p-1"
                >
                  <Icon as={Remove} size={14} className="text-white" />
                </Pressable>
              </View>
            </View>
          ) : (
            <SquareImagePlaceholder side={thumbSide} />
          )}
        </View>
      )}
    />
  );
}

function SquareImagePlaceholder({ side }: { side: number }) {
  return (
    <View
      className="items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-accent-100"
      style={{ width: side, height: side }}
      accessibilityRole="button"
      accessibilityLabel="Add image"
    >
      <View className="rounded-full bg-sage-100 p-2">
        <Icon as={Add} size={20} className="text-sage-500" />
      </View>
      <Text className="mt-1 text-[10px] font-semibold text-neutral-500">
        Add image
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cellFrame: {
    justifyContent: "center",
    alignItems: "center",
  },
});
