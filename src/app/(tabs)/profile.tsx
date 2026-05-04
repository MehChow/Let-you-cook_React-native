import { mockAvatar, myRecipes, profileUser } from "@/features/home/mockData";
import { ProfileMetadata } from "@/features/profile/ProfileMetadata";
import { UserHeader } from "@/features/profile/UserHeader";
import { UserRecipeGrid } from "@/features/profile/UserRecipeGrid";
import { useFavourites } from "@/hooks/useFavourites";
import * as React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GRID_GAP = 2;
const GRID_COLUMNS = 3;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { favourites, isFavourite, setFavourite } = useFavourites();

  const favouritedCount = React.useMemo(
    () => Object.values(favourites).filter(Boolean).length,
    [favourites]
  );

  const avgRating = React.useMemo(() => {
    if (myRecipes.length === 0) return 0;
    const sum = myRecipes.reduce((acc, r) => acc + r.rating, 0);
    return sum / myRecipes.length;
  }, []);

  const recipeCount = myRecipes.length;

  const recipeListBottomPadding = Math.max(insets.bottom, 12) + 110;

  return (
    <View className="flex-1 bg-sage-100">
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
        />
      </View>
    </View>
  );
}
