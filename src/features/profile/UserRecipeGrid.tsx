import FavoriteButton from "@/components/FavoriteButton";
import type { HomeRecipe } from "@/features/home/mockData";
import { Image } from "expo-image";
import { useState } from "react";
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
  onPressRecipe: (recipeId: string) => void;
};

export function UserRecipeGrid({
  recipes,
  columns,
  gap,
  contentContainerBottomPadding,
  isFavourite,
  onPressRecipe,
  onToggleFavourite,
}: UserRecipeGridProps) {
  const [gridWidth, setGridWidth] = useState(0);
  const onGridShellLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    setGridWidth((prev) => (w > 0 && w !== prev ? w : prev));
  };
  const cellSize =
    gridWidth <= 0 ? 0 : (gridWidth - gap * (columns - 1)) / columns;

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
          keyExtractor={(item) => item.id}
          renderItem={({ item }: ListRenderItemInfo<HomeRecipe>) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={item.title}
              onPress={() => onPressRecipe(item.id)}
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
          )}
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
