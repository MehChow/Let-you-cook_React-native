import Chip from "@/components/Chip";
import { Filter, Grid, Remove, Search } from "@/components/Icon";
import RecipeCard from "@/components/RecipeCard";
import SectionHeader from "@/components/SectionHeader";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import CategoryCarousel from "@/features/home/CategoryCarousel";
import { useCategoryStore } from "@/features/home/categoryStore";
import { categories, mockAvatar, popularRecipes } from "@/features/home/mockData";
import { useSearchFilterStore } from "@/features/search/filterStore";
import { useSearchDerived } from "@/features/search/hooks/useSearchDerived";
import { cn } from "@/lib/utils";
import { useRouter } from "expo-router";
import * as React from "react";
import { FlatList, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RECENT_SEARCHES = ["All", "healthy", "tiramisu", "snacks", "vegan", "cake"];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const selectedCategoryId = useCategoryStore((s) => s.selectedCategoryId);
  const setSelectedCategoryId = useCategoryStore((s) => s.setSelectedCategoryId);

  const [searchText, setSearchText] = React.useState("");
  const [favourites, setFavourites] = React.useState<Record<string, boolean>>(
    {}
  );

  const selectedCategoryLabel = React.useMemo(() => {
    if (!selectedCategoryId) return null;
    const c = categories.find((x) => x.id === selectedCategoryId);
    return c?.label ?? null;
  }, [selectedCategoryId]);

  const sortBy = useSearchFilterStore((s) => s.sortBy);
  const cookingTime = useSearchFilterStore((s) => s.cookingTime);
  const caloriesRange = useSearchFilterStore((s) => s.calories);
  const servingsRange = useSearchFilterStore((s) => s.servings);
  const setSortBy = useSearchFilterStore((s) => s.setSortBy);
  const setCookingTime = useSearchFilterStore((s) => s.setCookingTime);
  const setCalories = useSearchFilterStore((s) => s.setCalories);
  const setServings = useSearchFilterStore((s) => s.setServings);

  const filters = React.useMemo(
    () => ({
      sortBy,
      cookingTime,
      calories: caloriesRange,
      servings: servingsRange,
    }),
    [caloriesRange, cookingTime, servingsRange, sortBy]
  );

  const { appliedCount, filteredRecipes, activeFilterChips } = useSearchDerived({
    recipes: popularRecipes,
    searchText,
    selectedCategoryLabel,
    filters,
    setSortBy,
    setCookingTime,
    setCalories,
    setServings,
  });

  const categoryItems = React.useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        label: c.label,
        placeholderColorClass: c.placeholderColorClass,
        imageSource: c.imageThumb,
      })),
    []
  );

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
          isFavourite={Boolean(favourites[r.id])}
          onChangeFavourite={(next) =>
            setFavourites((prev) => ({ ...prev, [r.id]: next }))
          }
        />
      </View>
    ),
    [favourites]
  );

  return (
    <View className="flex-1 bg-sage-100">
      <FlatList
        showsVerticalScrollIndicator={false}
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipe}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListHeaderComponent={
          <View className="gap-5 px-5 pt-4">
            <Text className="text-2xl font-bold text-foreground">
              Find a recipe
            </Text>

            <View className="flex-row items-center gap-3">
              <View className="h-10 flex-1 flex-row items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3">
                <Icon as={Search} className="size-4 text-muted-foreground" />
                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search recipes..."
                  placeholderTextColor="#9ca3af"
                  className="flex-1 text-[13px] font-medium text-foreground"
                  returnKeyType="search"
                />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Filter"
                onPress={() => router.push("/filters")}
                className={cn(
                  "h-10 w-10 items-center justify-center rounded-2xl active:opacity-80",
                  appliedCount > 0 ? "bg-sage-500" : "bg-sage-200"
                )}
                style={{ elevation: 3 }}
              >
                <Icon
                  as={Filter}
                  className={cn(
                    "size-4.5",
                    appliedCount > 0 ? "text-white" : "text-sage-500"
                  )}
                />
                {appliedCount > 0 ? (
                  <View className="absolute -right-2 -top-2 h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1">
                    <Text className="text-[11px] font-bold text-black">
                      {appliedCount}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {RECENT_SEARCHES.map((label) => {
                const isAll = label.toLowerCase() === "all";
                const isActive =
                  (isAll && searchText.trim().length === 0) ||
                  (!isAll &&
                    searchText.trim().toLowerCase() === label.toLowerCase());
                return (
                  <Pressable
                    key={label}
                    accessibilityRole="button"
                    onPress={() => setSearchText(isAll ? "" : label)}
                    className="active:opacity-80"
                  >
                    <Chip
                      label={label}
                      className={cn("bg-sage-200", isActive && "bg-sage-500")}
                      textClassName={cn(
                        "text-sage-700",
                        isActive && "text-white"
                      )}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>

            <View className="gap-1">
              <SectionHeader
                title="Browse by Category"
                actionLabel="See all"
                actionIcon={Grid}
                onPressAction={() => router.push("/modal")}
              />
              <CategoryCarousel
                items={categoryItems}
                selectedId={selectedCategoryId ?? undefined}
                onSelect={(id) =>
                  setSelectedCategoryId(selectedCategoryId === id ? null : id)
                }
              />
            </View>

            {activeFilterChips.length > 0 ? (
              <View className="flex-row items-center gap-3">
                <Text className="text-sm font-medium text-muted-foreground">
                  Active:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-2"
                >
                  {activeFilterChips.map((chip) => (
                    <Pressable
                      key={chip.key}
                      accessibilityRole="button"
                      onPress={chip.onRemove}
                      className="active:opacity-80"
                    >
                      <View className="flex-row items-center gap-1 rounded-full bg-sage-500 px-3 py-1.5">
                        <Text className="text-xs font-semibold text-white">
                          {chip.label}
                        </Text>
                        <Icon
                          as={Remove}
                          className="size-3.5 text-neutral-200"
                        />
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <View className="gap-1">
              <SectionHeader title="Search results" />
            </View>
          </View>
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
          paddingBottom: Math.max(insets.bottom, 12) + 110,
        }}
      />
    </View>
  );
}
