import { EmptyState } from "@/components/EmptyState";
import FavouriteViewModeToggle, {
  type FavouriteViewMode,
} from "@/components/FavouriteViewModeToggle";
import { AppScreen } from "@/components/layout/AppScreen";
import RecipeCard from "@/components/RecipeCard";
import RecipeFavouriteRowCard from "@/components/RecipeFavouriteRowCard";
import { Text } from "@/components/ui/text";
import { mockAvatar, popularRecipes } from "@/features/home/mockData";
import { pushRecipeDetail } from "@/features/recipe-detail/navigation";
import { useFavourites } from "@/hooks/useFavourites";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FavouritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<FavouriteViewMode>("grid");
  const { favourites, isFavourite, setFavourite } = useFavourites();
  const favouritedRecipes = popularRecipes.filter((recipe) =>
    Boolean(favourites[recipe.id]),
  );

  return (
    <AppScreen>
      <View className="mt-4 flex-row items-center justify-between px-5">
        <Text className="text-2xl font-bold text-sage-900">My favorites</Text>
        <FavouriteViewModeToggle mode={viewMode} onModeChange={setViewMode} />
      </View>
      <FlatList
        data={favouritedRecipes}
        keyExtractor={(item) => item.id}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="No favourites yet"
            description="Tap the heart on a recipe in Home or Search to save it here."
            className="mx-5 mt-6"
            centered
          />
        }
        renderItem={({ item: recipe }) =>
          viewMode === "grid" ? (
            <View className="mt-4 px-5">
              <RecipeCard
                title={recipe.title}
                description={recipe.description}
                author={recipe.author}
                authorAvatar={mockAvatar}
                timeMin={recipe.timeMin}
                calories={recipe.calories}
                serving={recipe.serving}
                rating={recipe.rating}
                tag={recipe.tag}
                imagePlaceholderClass={recipe.imagePlaceholderClass}
                imageSource={recipe.image}
                isFavourite={isFavourite(recipe.id)}
                onPress={() => pushRecipeDetail(router, recipe.id)}
                onChangeFavourite={(next) => setFavourite(recipe.id, next)}
              />
            </View>
          ) : (
            <View className="mt-4 px-5">
              <RecipeFavouriteRowCard
                title={recipe.title}
                timeMin={recipe.timeMin}
                tag={recipe.tag}
                imagePlaceholderClass={recipe.imagePlaceholderClass}
                imageSource={recipe.image}
                isFavourite={isFavourite(recipe.id)}
                onPress={() => pushRecipeDetail(router, recipe.id)}
                onChangeFavourite={(next) => setFavourite(recipe.id, next)}
              />
            </View>
          )
        }
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 12) + 110,
        }}
      />
    </AppScreen>
  );
}
