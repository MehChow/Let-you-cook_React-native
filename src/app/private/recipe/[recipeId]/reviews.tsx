import { Text } from "@/components/ui/text";
import { RecipeReviewForm } from "@/features/recipe-detail/components/RecipeReviewForm";
import { RecipeReviewsList } from "@/features/recipe-detail/components/RecipeReviewsList";
import { useRecipeReviewsSheet } from "@/features/recipe-detail/hooks/useRecipeReviewsSheet";
import { useLocalSearchParams } from "expo-router";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const normalizeParam = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

const RecipeReviewsRoute: React.FC = () => {
  const params = useLocalSearchParams<{ recipeId?: string | string[] }>();
  const recipeId = normalizeParam(params.recipeId);
  const insets = useSafeAreaInsets();
  const {
    comment,
    handleSubmitReview,
    rating,
    recipe,
    reviews,
    setComment,
    setRating,
    sortLabel,
  } = useRecipeReviewsSheet({ recipeId });

  if (!recipe) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white px-6"
        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      >
        <Text className="text-base font-bold text-black">Recipe not found</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      <View className="items-center pt-4">
        <View className="h-1.5 w-20 rounded-full bg-neutral-300" />
      </View>

      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-6 pb-4 pt-4"
      >
        <View className="min-h-[500px] justify-between gap-8">
          <RecipeReviewsList reviews={reviews} sortLabel={sortLabel} />
          <RecipeReviewForm
            comment={comment}
            rating={rating}
            onChangeComment={setComment}
            onChangeRating={setRating}
            onSubmit={handleSubmitReview}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default RecipeReviewsRoute;
