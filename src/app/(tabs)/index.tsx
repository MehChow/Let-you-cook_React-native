import { Grid } from "@/components/Icon";
import RecipeCard from "@/components/RecipeCard";
import SectionHeader from "@/components/SectionHeader";
import { Text } from "@/components/ui/text";
import CategoryCarousel from "@/features/home/CategoryCarousel";
import HomeHeader from "@/features/home/HomeHeader";
import { useCategoryStore } from "@/features/home/categoryStore";
import {
  categories,
  homeGreeting,
  mockAvatar,
  popularRecipes,
  todaySpecial,
} from "@/features/home/mockData";
import TodaySpecialCard from "@/features/home/TodaySpecialCard";
import { pushRecipeDetail } from "@/features/recipe-detail/navigation";
import { useFavourites } from "@/hooks/useFavourites";
import { useRouter } from "expo-router";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HOME_POPULAR_RECIPE_LIMIT = 2;

export default function HomeScreen() {
  const router = useRouter();
  const selectedCategoryId = useCategoryStore((s) => s.selectedCategoryId);
  const setSelectedCategoryId = useCategoryStore(
    (s) => s.setSelectedCategoryId,
  );
  const { isFavourite, setFavourite } = useFavourites();

  const categoryItems = React.useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        label: c.label,
        placeholderColorClass: c.placeholderColorClass,
        imageSource: c.imageThumb,
      })),
    [],
  );

  const filteredPopularRecipes = React.useMemo(() => {
    const filteredRecipes = selectedCategoryId
      ? popularRecipes.filter((recipe) => recipe.categoryId === selectedCategoryId)
      : popularRecipes;

    return filteredRecipes.slice(0, HOME_POPULAR_RECIPE_LIMIT);
  }, [selectedCategoryId]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#dce4e2" }}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 gap-5"
        contentContainerStyle={{
          paddingBottom: 16,
        }}
      >
        <HomeHeader
          className="mt-4"
          title={homeGreeting.title}
          subtitle={homeGreeting.subtitle}
        />

        <View className="gap-1">
          <SectionHeader title="Today's special" />
          <TodaySpecialCard
            className=""
            title={todaySpecial.title}
            timeMin={todaySpecial.timeMin}
            calories={todaySpecial.calories}
            serving={todaySpecial.serving}
            rating={todaySpecial.rating}
            placeholderClassName={todaySpecial.imagePlaceholderClass}
            imageSource={todaySpecial.image}
            userAvatarSource={mockAvatar}
            onPress={() => pushRecipeDetail(router, todaySpecial.id)}
          />
        </View>

        <View className="gap-1">
          <SectionHeader
            title="Categories"
            actionLabel="See all"
            actionIcon={Grid}
            onPressAction={() => router.push("/modal")}
          />
          <CategoryCarousel
            className=""
            items={categoryItems}
            selectedId={selectedCategoryId ?? undefined}
            onSelect={(id) =>
              setSelectedCategoryId(selectedCategoryId === id ? null : id)
            }
          />
        </View>

        <View className="gap-1">
          <SectionHeader
            title="Popular recipes"
            actionLabel="See more"
            onPressAction={() => router.push("/search")}
          />
          {filteredPopularRecipes.length > 0 ? (
            <View className="gap-4">
              {filteredPopularRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
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
              ))}
            </View>
          ) : (
            <View className="rounded-2xl bg-white/60 px-4 py-4">
              <Text className="text-sm font-semibold text-muted-foreground">
                No results found.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
