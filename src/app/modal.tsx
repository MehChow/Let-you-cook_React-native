import BottomFadeOverlay from "@/components/BottomFadeOverlay";
import PressableCard from "@/components/PressableCard";
import { Text } from "@/components/ui/text";
import { useCategoryStore } from "@/features/home/categoryStore";
import { categories } from "@/features/home/mockData";
import { cn } from "@/lib/utils";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as React from "react";
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CategoryGridItem = (typeof categories)[number];

const GRID_COLUMNS = 2;
const GRID_GAP = 12;
const GRID_HORIZONTAL_PADDING = 20;

export default function Modal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const selectedCategoryId = useCategoryStore((s) => s.selectedCategoryId);
  const setSelectedCategoryId = useCategoryStore(
    (s) => s.setSelectedCategoryId
  );

  const cardSize = React.useMemo(() => {
    const contentWidth = windowWidth - GRID_HORIZONTAL_PADDING * 2;
    const totalGap = GRID_GAP * (GRID_COLUMNS - 1);
    return Math.floor((contentWidth - totalGap) / GRID_COLUMNS);
  }, [windowWidth]);

  const data = React.useMemo(() => {
    if (categories.length % GRID_COLUMNS === 0) return categories;
    return [
      ...categories,
      {
        id: "__spacer__",
        label: "",
        placeholderColorClass: "",
        imageThumb: null,
        imageLarge: null,
      },
    ];
  }, []);

  const handleSelect = React.useCallback(
    (id: string) => {
      setSelectedCategoryId(selectedCategoryId === id ? null : id);
      router.back();
    },
    [router, selectedCategoryId, setSelectedCategoryId]
  );

  return (
    <View
      className="flex-1 bg-sage-100"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View className="px-5 pt-4">
        <Text className="text-center text-base font-bold text-foreground">
          Category
        </Text>
      </View>

      <FlatList<CategoryGridItem>
        data={data as CategoryGridItem[]}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        // Android: make scroll gestures stay in the list instead of dragging/dismissing the sheet
        nestedScrollEnabled
        overScrollMode="never"
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 24,
        }}
        columnWrapperStyle={styles.columnWrapper}
        getItemLayout={(_, index) => {
          const row = Math.floor(index / GRID_COLUMNS);
          const rowHeight = cardSize + GRID_GAP;
          return {
            length: rowHeight,
            offset: row * rowHeight,
            index,
          };
        }}
        renderItem={({ item }) => {
          if (item.id === "__spacer__") {
            return (
              <View
                pointerEvents="none"
                style={{ width: cardSize, height: cardSize, opacity: 0 }}
              />
            );
          }
          const isSelected = item.id === selectedCategoryId;
          const shouldDim = Boolean(selectedCategoryId) && !isSelected;
          return (
            <PressableCard
              onPress={() => handleSelect(item.id)}
              elevation={5}
              containerStyle={{ width: cardSize, height: cardSize }}
              containerClassName={cn("rounded-2xl border border-neutral-200")}
              className={cn(shouldDim && "opacity-50")}
            >
              <View
                className={cn(
                  "absolute inset-0",
                  item.placeholderColorClass ?? "bg-neutral-200"
                )}
              />
              <Image
                source={item.imageLarge ?? undefined}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={160}
                style={StyleSheet.absoluteFillObject}
              />
              <BottomFadeOverlay
                className="z-10"
                maxOpacity={0.62}
                heightFraction={0.5}
              />
              <Text className="absolute bottom-3 left-3 z-20 text-[14px] font-semibold text-white">
                {item.label}
              </Text>
            </PressableCard>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    gap: 12,
    justifyContent: "flex-start",
    paddingBottom: 12,
  },
});
