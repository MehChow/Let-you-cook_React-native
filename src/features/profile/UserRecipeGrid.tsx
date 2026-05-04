import FavoriteButton from "@/components/FavoriteButton";
import type { HomeRecipe } from "@/features/home/mockData";
import { Image } from "expo-image";
import * as React from "react";
import {
  FlatList,
  type LayoutChangeEvent,
  type ListRenderItemInfo,
  Pressable,
  View,
} from "react-native";

type UserRecipeGridProps = {
  recipes: HomeRecipe[];
  columns: number;
  gap: number;
  /** Bottom padding inside the list (e.g. safe area + floating tab bar). */
  contentContainerBottomPadding: number;
  isFavourite: (recipeId: string) => boolean;
  onToggleFavourite: (recipeId: string, next: boolean) => void;
};

export function UserRecipeGrid({
  recipes,
  columns,
  gap,
  contentContainerBottomPadding,
  isFavourite,
  onToggleFavourite,
}: UserRecipeGridProps) {
  const [gridWidth, setGridWidth] = React.useState(0);

  const onGridShellLayout = React.useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    setGridWidth((prev) => (w > 0 && w !== prev ? w : prev));
  }, []);

  const cellSize = React.useMemo(() => {
    if (gridWidth <= 0) return 0;
    const inner = gridWidth - gap * (columns - 1);
    return inner / columns;
  }, [gridWidth, columns, gap]);

  const renderItem = React.useCallback(
    ({ item }: ListRenderItemInfo<HomeRecipe>) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.title}
        onPress={() => {}}
        style={({ pressed }) => ({
          width: cellSize,
          height: cellSize,
          opacity: pressed ? 0.9 : 1,
        })}
        className="overflow-hidden bg-sage-200"
      >
        <Image
          source={item.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={150}
          style={{ width: "100%", height: "100%" }}
        />
        <FavoriteButton
          size="compact"
          isActive={isFavourite(item.id)}
          onPress={() => onToggleFavourite(item.id, !isFavourite(item.id))}
          className="absolute right-1 top-1"
        />
      </Pressable>
    ),
    [cellSize, isFavourite, onToggleFavourite]
  );

  const keyExtractor = React.useCallback((item: HomeRecipe) => item.id, []);

  return (
    <View
      className="min-h-0 w-full flex-1 bg-sage-100"
      style={{ alignSelf: "stretch", width: "100%" }}
      onLayout={onGridShellLayout}
    >
      {gridWidth > 0 && cellSize > 0 ? (
        <FlatList
          key={`profile-recipe-grid-${columns}`}
          data={recipes}
          numColumns={columns}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: contentContainerBottomPadding,
          }}
          scrollEnabled
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          columnWrapperStyle={
            columns > 1 ? { gap, marginBottom: gap } : undefined
          }
        />
      ) : null}
    </View>
  );
}
