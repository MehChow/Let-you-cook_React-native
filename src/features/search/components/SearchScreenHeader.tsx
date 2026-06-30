import Chip from "@/components/Chip";
import { Filter, Grid, Search } from "@/components/Icon";
import SectionHeader from "@/components/SectionHeader";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { CategoryCarouselItem } from "@/features/home/CategoryCarousel";
import CategoryCarousel from "@/features/home/CategoryCarousel";
import SearchActiveFilterChips from "@/features/search/components/SearchActiveFilterChips";
import type { SearchActiveFilterChip } from "@/features/search/hooks/useSearchDerived";
import { cn } from "@/lib/utils";
import { Pressable, ScrollView, TextInput, View } from "react-native";

type SearchScreenHeaderProps = {
  searchText: string;
  onChangeSearchText: (next: string) => void;
  recentSearches: readonly string[];
  appliedCount: number;
  onOpenFilters: () => void;
  categoryItems: CategoryCarouselItem[];
  selectedCategoryId?: string;
  onSelectCategory: (id: string) => void;
  onOpenCategories: () => void;
  activeFilterChips: SearchActiveFilterChip[];
};

export default function SearchScreenHeader({
  searchText,
  onChangeSearchText,
  recentSearches,
  appliedCount,
  onOpenFilters,
  categoryItems,
  selectedCategoryId,
  onSelectCategory,
  onOpenCategories,
  activeFilterChips,
}: SearchScreenHeaderProps) {
  return (
    <View className="gap-5 px-5 pt-4">
      <Text className="text-2xl font-bold text-sage-900">Find a recipe</Text>

      <View className="flex-row items-center gap-3">
        <View className="h-10 flex-1 flex-row items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3">
          <Icon as={Search} className="size-4 text-muted-foreground" />
          <TextInput
            value={searchText}
            onChangeText={onChangeSearchText}
            placeholder="Search recipes..."
            placeholderTextColor="#9ca3af"
            className="flex-1 text-[13px] font-medium text-foreground"
            returnKeyType="search"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter"
          onPress={onOpenFilters}
          className={cn(
            "h-10 w-10 items-center justify-center rounded-2xl active:opacity-80",
            appliedCount > 0 ? "bg-sage-500" : "bg-sage-200",
          )}
          style={{ elevation: 3 }}
        >
          <Icon
            as={Filter}
            className={cn(
              "size-4.5",
              appliedCount > 0 ? "text-white" : "text-sage-500",
            )}
          />
          {appliedCount > 0 ? (
            <View className="absolute -right-2 -top-2 h-5 min-w-5 items-center justify-center rounded-full bg-white px-1">
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
        {recentSearches.map((label) => {
          const isActive =
            searchText.trim().toLowerCase() === label.toLowerCase();
          return (
            <Pressable
              key={label}
              accessibilityRole="button"
              onPress={() => onChangeSearchText(label)}
              className="active:opacity-80"
            >
              <Chip
                label={label}
                className={cn(isActive ? "bg-sage-500" : "bg-sage-200")}
                textClassName={cn("text-sage-700", isActive && "text-white")}
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
          onPressAction={onOpenCategories}
        />
        <CategoryCarousel
          items={categoryItems}
          selectedId={selectedCategoryId}
          onSelect={onSelectCategory}
        />
      </View>

      <SearchActiveFilterChips chips={activeFilterChips} />

      <View className="mb-2">
        <SectionHeader title="Search results" />
      </View>
    </View>
  );
}
