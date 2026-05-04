import FavouriteViewModeToggle, {
  type FavouriteViewMode,
} from "@/components/FavouriteViewModeToggle";
import RecipeCard from "@/components/RecipeCard";
import RecipeFavouriteRowCard from "@/components/RecipeFavouriteRowCard";
import { Text } from "@/components/ui/text";
import { mockAvatar, popularRecipes } from "@/features/home/mockData";
import { useFavourites } from "@/hooks/useFavourites";
import * as React from "react";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FavouritesScreen() {
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = React.useState<FavouriteViewMode>("grid");
  const { favourites, isFavourite, setFavourite } = useFavourites();

  const favouritedRecipes = React.useMemo(
    () => popularRecipes.filter((r) => Boolean(favourites[r.id])),
    [favourites]
  );

  const header = React.useMemo(
    () => (
      <View className="mt-4 flex-row items-center justify-between px-5">
        <Text className="text-2xl font-bold text-foreground">My favorites</Text>
        <FavouriteViewModeToggle mode={viewMode} onModeChange={setViewMode} />
      </View>
    ),
    [insets.top, viewMode]
  );

  const empty = React.useMemo(
    () => (
      <View className="mx-5 mt-6 rounded-2xl bg-white/70 px-4 py-6">
        <Text className="text-center text-base font-semibold text-foreground">
          No favourites yet
        </Text>
        <Text className="mt-2 text-center text-sm text-muted-foreground">
          Tap the heart on a recipe in Home or Search to save it here.
        </Text>
      </View>
    ),
    []
  );

  const renderGridItem = React.useCallback(
    ({ item: r }: { item: (typeof popularRecipes)[number] }) => (
      <View className="mt-4 px-5">
        <RecipeCard
          title={r.title}
          description={r.description}
          author={r.author}
          authorAvatar={mockAvatar}
          timeMin={r.timeMin}
          calories={r.calories}
          serving={r.serving}
          rating={r.rating}
          tag={r.tag}
          imagePlaceholderClass={r.imagePlaceholderClass}
          imageSource={r.image}
          isFavourite={isFavourite(r.id)}
          onChangeFavourite={(next) => setFavourite(r.id, next)}
        />
      </View>
    ),
    [isFavourite, setFavourite]
  );

  const renderListItem = React.useCallback(
    ({ item: r }: { item: (typeof popularRecipes)[number] }) => (
      <View className="mt-4 px-5">
        <RecipeFavouriteRowCard
          title={r.title}
          timeMin={r.timeMin}
          tag={r.tag}
          imagePlaceholderClass={r.imagePlaceholderClass}
          imageSource={r.image}
          isFavourite={isFavourite(r.id)}
          onChangeFavourite={(next) => setFavourite(r.id, next)}
        />
      </View>
    ),
    [isFavourite, setFavourite]
  );

  return (
    <View className="flex-1 bg-sage-100">
      {header}
      <FlatList
        data={favouritedRecipes}
        keyExtractor={(item) => item.id}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={empty}
        renderItem={viewMode === "grid" ? renderGridItem : renderListItem}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 12) + 110,
        }}
      />
    </View>
  );
}
