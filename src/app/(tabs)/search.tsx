import RecipeCard from "@/components/RecipeCard";
import { Text } from "@/components/ui/text";
import SearchScreenHeader from "@/features/search/components/SearchScreenHeader";
import { useSearchScreen } from "@/features/search/hooks/useSearchScreen";
import * as React from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const {
    activeFilterChips,
    appliedCount,
    categoryItems,
    favourites,
    filteredRecipes,
    handleOpenCategories,
    handleOpenFilters,
    handleSelectCategory,
    handleToggleFavourite,
    isFavourite,
    mockAvatar,
    recentSearches,
    searchText,
    selectedCategoryId,
    setSearchText,
  } = useSearchScreen();

  const renderRecipe = React.useCallback(
    ({ item: r }: { item: (typeof filteredRecipes)[number] }) => (
      <View className="px-5">
        <RecipeCard
          title={r.title}
          description={r.description}
          author={r.author}
          authorAvatar={mockAvatar}
          timeMin={r.timeMin}
          calories={r.calories}
          serving={r.serving}
          rating={r.rating}
          tag={r.tag}
          imagePlaceholderClass={r.imagePlaceholderClass}
          imageSource={r.image}
          isFavourite={isFavourite(r.id)}
          onChangeFavourite={(next) => handleToggleFavourite(r.id, next)}
        />
      </View>
    ),
    [handleToggleFavourite, isFavourite, mockAvatar],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#dce4e2" }}
      edges={["top", "left", "right"]}
    >
      <FlatList
        showsVerticalScrollIndicator={false}
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipe}
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
            <View className="rounded-2xl bg-white/60 px-4 py-4">
              <Text className="text-sm font-semibold text-muted-foreground">
                No results found.
              </Text>
            </View>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: 16,
        }}
      />
    </SafeAreaView>
  );
}
