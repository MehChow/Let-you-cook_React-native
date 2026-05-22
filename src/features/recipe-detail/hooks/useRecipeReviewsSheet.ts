import { getRecipeDetailById } from "@/features/recipe-detail/mockData";
import type { RecipeReview } from "@/features/recipe-detail/types";
import { mockAvatar } from "@/features/home/mockData";
import { toast } from "sonner-native";
import * as React from "react";

interface UseRecipeReviewsSheetParams {
  recipeId: string;
}

export const useRecipeReviewsSheet = ({
  recipeId,
}: UseRecipeReviewsSheetParams) => {
  const recipe = React.useMemo(() => getRecipeDetailById(recipeId), [recipeId]);
  const [reviews, setReviews] = React.useState<RecipeReview[]>(
    () => recipe?.reviews ?? [],
  );
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");

  React.useEffect(() => {
    setReviews(recipe?.reviews ?? []);
  }, [recipe]);

  const handleSubmitReview = React.useCallback(() => {
    if (!recipe) return;
    const nextReview: RecipeReview = {
      id: `local-review-${Date.now()}`,
      authorName: "Mehhh",
      authorAvatar: mockAvatar,
      createdAtLabel: "Just now",
      rating,
      comment: comment.trim() || undefined,
    };

    setReviews((currentReviews) => [nextReview, ...currentReviews]);
    setComment("");
    setRating(5);
    toast.success("Review submitted", {
      description: "Saved locally in this frontend build.",
    });
  }, [comment, rating, recipe]);

  return {
    comment,
    handleSubmitReview,
    rating,
    recipe,
    reviews,
    setComment,
    setRating,
    sortLabel: "Newest",
  };
};
