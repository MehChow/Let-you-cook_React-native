import { AppScreen } from "@/components/layout/AppScreen";
import { mockAvatar, myRecipes, profileUser } from "@/features/home/mockData";
import { ProfileMetadata } from "@/features/profile/ProfileMetadata";
import { UserHeader } from "@/features/profile/UserHeader";
import { UserRecipeGrid } from "@/features/profile/UserRecipeGrid";
import { pushRecipeDetail } from "@/features/recipe-detail/navigation";
import { useFavourites } from "@/hooks/useFavourites";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GRID_GAP = 2;
const GRID_COLUMNS = 3;
const avgRating =
  myRecipes.length === 0
    ? 0
    : myRecipes.reduce((sum, recipe) => sum + recipe.rating, 0) / myRecipes.length;

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favourites, isFavourite, setFavourite } = useFavourites();
  const favouritedCount = Object.values(favourites).filter(Boolean).length;
  const recipeCount = myRecipes.length;
  const recipeListBottomPadding = Math.max(insets.bottom, 12) + 110;

  return (
    <AppScreen background="profile">
      <View className="bg-sage-500 px-5 pt-8 pb-6">
        <UserHeader user={profileUser} avatarSource={mockAvatar} />
        <ProfileMetadata
          recipeCount={recipeCount}
          heartsCount={favouritedCount}
          avgRatingLabel={avgRating.toFixed(1)}
        />
      </View>

      <View className="min-h-0 flex-1">
        <UserRecipeGrid
          recipes={myRecipes}
          columns={GRID_COLUMNS}
          gap={GRID_GAP}
          contentContainerBottomPadding={recipeListBottomPadding}
          isFavourite={isFavourite}
          onToggleFavourite={(id, next) => setFavourite(id, next)}
          onPressRecipe={(id) => pushRecipeDetail(router, id)}
        />
      </View>
    </AppScreen>
  );
}
