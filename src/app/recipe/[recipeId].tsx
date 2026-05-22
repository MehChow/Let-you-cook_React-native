import { Text } from "@/components/ui/text";
import { RecipeCookingStepsSection } from "@/features/recipe-detail/components/RecipeCookingStepsSection";
import { RecipeDetailCarousel } from "@/features/recipe-detail/components/RecipeDetailCarousel";
import { RecipeDetailHeader } from "@/features/recipe-detail/components/RecipeDetailHeader";
import { RecipeIngredientsSection } from "@/features/recipe-detail/components/RecipeIngredientsSection";
import { RecipeNutritionSection } from "@/features/recipe-detail/components/RecipeNutritionSection";
import { RecipeReminderSection } from "@/features/recipe-detail/components/RecipeReminderSection";
import { RecipeReviewsFooter } from "@/features/recipe-detail/components/RecipeReviewsFooter";
import { useRecipeDetailScreen } from "@/features/recipe-detail/hooks/useRecipeDetailScreen";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const normalizeParam = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

const RecipeDetailRoute: React.FC = () => {
  const params = useLocalSearchParams<{ recipeId?: string | string[] }>();
  const recipeId = normalizeParam(params.recipeId);
  const insets = useSafeAreaInsets();
  const {
    activeImageIndex,
    favourite,
    handleBack,
    handleImageScroll,
    handleOpenReviews,
    handleToggleFavourite,
    recipe,
  } = useRecipeDetailScreen({ recipeId });

  if (!recipe) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <StatusBar style="dark" />
        <Text className="text-lg font-bold text-black">Recipe not found</Text>
        <Text className="mt-2 text-center text-sm text-neutral-500">
          This recipe is not available in the current mock data.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 8) + 68,
        }}
      >
        <RecipeDetailCarousel
          images={recipe.images}
          activeIndex={activeImageIndex}
          isFavourite={favourite}
          onBack={handleBack}
          onToggleFavourite={handleToggleFavourite}
          onScrollEnd={handleImageScroll}
        />

        <View className="px-6">
          <RecipeDetailHeader recipe={recipe} />
          <RecipeIngredientsSection groups={recipe.ingredientGroups} />
          <RecipeCookingStepsSection steps={recipe.cookingSteps} />
          <RecipeReminderSection reminder={recipe.reminder} />
          <RecipeNutritionSection nutrition={recipe.nutrition} />
        </View>
      </ScrollView>

      <RecipeReviewsFooter
        reviewCount={recipe.reviewCount}
        bottomInset={insets.bottom}
        onPress={handleOpenReviews}
      />
    </View>
  );
};

export default RecipeDetailRoute;
