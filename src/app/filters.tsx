import { Edit, Reset } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import FilterChipGroup from "@/features/search/components/FilterChipGroup";
import FilterRangeSection from "@/features/search/components/FilterRangeSection";
import { FILTER_DEFAULTS } from "@/features/search/filterStore";
import { useSearchFiltersScreen } from "@/features/search/hooks/useSearchFiltersScreen";
import {
  cookingTimeOptions,
  sortOptions,
} from "@/features/search/searchFilterOptions";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FiltersScreen() {
  const insets = useSafeAreaInsets();
  const {
    appliedCount,
    caloriesLabel,
    draftFilters,
    handleApply,
    handleReset,
    isApplying,
    servingsLabel,
    setDraftCalories,
    setDraftCookingTime,
    setDraftServings,
    setDraftSortBy,
  } = useSearchFiltersScreen();

  return (
    <View
      className="flex-1 bg-sage-100"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      <View className="items-center pt-3">
        <View className="h-1.5 w-12 rounded-full bg-neutral-300/70" />
      </View>

      <View className="px-5 pb-4 pt-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-bold text-sage-900">Filters</Text>
            {appliedCount > 0 ? (
              <View className="h-6 min-w-6 items-center justify-center rounded-full bg-sage-700 px-2">
                <Text className="text-xs font-bold text-white">
                  {appliedCount}
                </Text>
              </View>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleReset}
            disabled={isApplying}
            className="flex-row items-center gap-2 rounded-full px-2 py-1 active:opacity-70"
          >
            <Icon as={Reset} className="size-4 text-muted-foreground" />
            <Text className="text-xs font-semibold text-muted-foreground">
              Reset
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}
        contentContainerClassName="gap-5"
      >
        <View className="gap-2">
          <Text className="text-xs font-bold text-sage-800">Sort by</Text>
          <FilterChipGroup
            value={draftFilters.sortBy}
            onChange={setDraftSortBy}
            options={sortOptions}
          />
        </View>

        <View className="gap-2">
          <Text className="text-xs font-bold text-sage-800">Cooking time</Text>
          <FilterChipGroup
            value={draftFilters.cookingTime}
            onChange={setDraftCookingTime}
            options={cookingTimeOptions}
          />
        </View>

        <FilterRangeSection
          title="Calories"
          valueLabel={caloriesLabel}
          min={FILTER_DEFAULTS.calories[0]}
          max={FILTER_DEFAULTS.calories[1]}
          step={50}
          minGap={50}
          value={draftFilters.calories}
          onChange={setDraftCalories}
          minLabel={`${FILTER_DEFAULTS.calories[0]} kcal`}
          maxLabel={`${FILTER_DEFAULTS.calories[1]} kcal`}
        />

        <FilterRangeSection
          title="Servings"
          valueLabel={servingsLabel}
          min={FILTER_DEFAULTS.servings[0]}
          max={FILTER_DEFAULTS.servings[1]}
          step={1}
          minGap={1}
          value={draftFilters.servings}
          onChange={setDraftServings}
          minLabel={`${FILTER_DEFAULTS.servings[0]} person`}
          maxLabel={`${FILTER_DEFAULTS.servings[1]} people`}
        />
      </ScrollView>

      <View className="px-5 pb-2 pt-1">
        <Pressable
          accessibilityRole="button"
          onPress={handleApply}
          disabled={isApplying}
          className="h-12 w-full flex-row items-center justify-center gap-2 rounded-full bg-sage-700 active:opacity-90"
          style={{ elevation: 6 }}
        >
          {isApplying ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Icon as={Edit} className="size-4 text-sage-100" fill="#dce4e2" />
          )}
          <Text className="text-sm font-bold text-white">
            {appliedCount > 0 ? `Apply (${appliedCount})` : "Apply"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
