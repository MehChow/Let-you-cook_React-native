import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Icon";
import { AppScreen } from "@/components/layout/AppScreen";
import RecipeCard from "@/components/RecipeCard";
import SectionHeader from "@/components/SectionHeader";
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
import { ScrollView, View } from "react-native";

const HOME_POPULAR_RECIPE_LIMIT = 2;
const categoryItems = categories.map((category) => ({
  id: category.id,
  label: category.label,
  placeholderColorClass: category.placeholderColorClass,
  imageSource: category.imageThumb,
}));

export default function HomeScreen() {
  const router = useRouter();
  const selectedCategoryId = useCategoryStore((s) => s.selectedCategoryId);
  const setSelectedCategoryId = useCategoryStore(
    (s) => s.setSelectedCategoryId,
  );
  const { isFavourite, setFavourite } = useFavourites();
  const filteredPopularRecipes = (
    selectedCategoryId
      ? popularRecipes.filter((recipe) => recipe.categoryId === selectedCategoryId)
      : popularRecipes
  ).slice(0, HOME_POPULAR_RECIPE_LIMIT);

  return (
    <AppScreen>
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
            onPressAction={() => router.push("/private/modal")}
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
            onPressAction={() => router.push("/private/search")}
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
            <EmptyState title="No results found." />
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}
