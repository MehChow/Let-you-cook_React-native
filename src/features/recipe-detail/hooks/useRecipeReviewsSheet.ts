import { getRecipeDetailById } from "@/features/recipe-detail/mockData";
import type { RecipeReview } from "@/features/recipe-detail/types";
import { mockAvatar } from "@/features/home/mockData";
import { toast } from "sonner-native";
import { useState } from "react";

interface UseRecipeReviewsSheetParams {
  recipeId: string;
}

export const useRecipeReviewsSheet = ({
  recipeId,
}: UseRecipeReviewsSheetParams) => {
  const recipe = getRecipeDetailById(recipeId);
  const [reviews, setReviews] = useState<RecipeReview[]>(
    () => recipe?.reviews ?? [],
  );
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const handleSubmitReview = () => {
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
  };

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
