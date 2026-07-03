import { EmptyState } from "@/components/EmptyState";
import { AppScreen } from "@/components/layout/AppScreen";
import RecipeCard from "@/components/RecipeCard";
import SearchScreenHeader from "@/features/search/components/SearchScreenHeader";
import { useSearchScreen } from "@/features/search/hooks/useSearchScreen";
import { FlatList, View } from "react-native";

export default function SearchScreen() {
  const {
    activeFilterChips,
    appliedCount,
    categoryItems,
    favourites,
    filteredRecipes,
    handleOpenCategories,
    handleOpenFilters,
    handleOpenRecipe,
    handleSelectCategory,
    handleToggleFavourite,
    isFavourite,
    mockAvatar,
    recentSearches,
    searchText,
    selectedCategoryId,
    setSearchText,
  } = useSearchScreen();

  return (
    <AppScreen>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item: recipe }) => (
          <View className="px-5">
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
              onPress={() => handleOpenRecipe(recipe.id)}
              onChangeFavourite={(next) =>
                handleToggleFavourite(recipe.id, next)
              }
            />
          </View>
        )}
        extraData={favourites}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListHeaderComponent={
          <SearchScreenHeader
            searchText={searchText}
            onChangeSearchText={setSearchText}
            recentSearches={recentSearches}
            appliedCount={appliedCount}
            onOpenFilters={handleOpenFilters}
            categoryItems={categoryItems}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleSelectCategory}
            onOpenCategories={handleOpenCategories}
            activeFilterChips={activeFilterChips}
          />
        }
        ListEmptyComponent={
          <View className="px-5 pt-4">
            <EmptyState title="No results found." />
          </View>
        }
        contentContainerStyle={{
          paddingBottom: 16,
        }}
      />
    </AppScreen>
  );
}
