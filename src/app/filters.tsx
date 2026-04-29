import Chip from "@/components/Chip";
import { Edit, Reset } from "@/components/Icon";
import RangeSlider from "@/components/RangeSlider";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  FILTER_DEFAULTS,
  getAppliedCount,
  useSearchFilterStore,
  type CookingTime,
  type SortBy,
} from "@/features/search/filterStore";
import { cn } from "@/lib/utils";
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const sortOptions: Array<{ value: SortBy; label: string }> = [
  { value: "relevance", label: "Relevance" },
  { value: "top_rated", label: "Top rated" },
  { value: "newest", label: "Newest" },
  { value: "quickest", label: "Quickest" },
];

const cookingTimeOptions: Array<{ value: CookingTime; label: string }> = [
  { value: "any", label: "Any" },
  { value: "lt_15", label: "< 15 min" },
  { value: "lt_30", label: "< 30 min" },
  { value: "lt_60", label: "< 1 hr" },
  { value: "lt_120", label: "< 2 hr" },
];

function SectionRow({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-xs font-bold text-foreground">{title}</Text>
      {right}
    </View>
  );
}

function ChipGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (next: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2"
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            onPress={() => onChange(opt.value)}
            className="active:opacity-80"
          >
            <Chip
              label={opt.label}
              className={cn("bg-sage-200", isActive && "bg-sage-500")}
              textClassName={cn("text-sage-700", isActive && "text-white")}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default function FiltersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const sortBy = useSearchFilterStore((s) => s.sortBy);
  const cookingTime = useSearchFilterStore((s) => s.cookingTime);
  const calories = useSearchFilterStore((s) => s.calories);
  const servings = useSearchFilterStore((s) => s.servings);
  const setSortBy = useSearchFilterStore((s) => s.setSortBy);
  const setCookingTime = useSearchFilterStore((s) => s.setCookingTime);
  const setCalories = useSearchFilterStore((s) => s.setCalories);
  const setServings = useSearchFilterStore((s) => s.setServings);
  const reset = useSearchFilterStore((s) => s.reset);

  const appliedCount = React.useMemo(
    () =>
      getAppliedCount({
        sortBy,
        cookingTime,
        calories,
        servings,
      }),
    [calories, cookingTime, servings, sortBy]
  );

  const caloriesLabel = `${calories[0]} - ${calories[1]} kcal`;
  const servingsLabel = `${servings[0]} - ${servings[1]} people`;

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
            <Text className="text-base font-bold text-foreground">Filters</Text>
            {appliedCount > 0 ? (
              <View className="h-6 min-w-[24px] items-center justify-center rounded-full bg-sage-700 px-2">
                <Text className="text-xs font-bold text-white">
                  {appliedCount}
                </Text>
              </View>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={reset}
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
          <SectionRow title="Sort by" />
          <ChipGroup
            value={sortBy}
            onChange={setSortBy}
            options={sortOptions}
          />
        </View>

        <View className="gap-2">
          <SectionRow title="Cooking time" />
          <ChipGroup
            value={cookingTime}
            onChange={setCookingTime}
            options={cookingTimeOptions}
          />
        </View>

        <View className="gap-2">
          <SectionRow
            title="Calories"
            right={
              <Text className="text-xs font-semibold text-muted-foreground">
                {caloriesLabel}
              </Text>
            }
          />
          <View className="px-1.5">
            <RangeSlider
              min={FILTER_DEFAULTS.calories[0]}
              max={FILTER_DEFAULTS.calories[1]}
              step={50}
              minGap={50}
              value={calories}
              onChange={setCalories}
              activeTrackColor="#426159"
              thumbBorderColor="#426159"
            />
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-[10px] font-medium text-muted-foreground">
              {FILTER_DEFAULTS.calories[0]} kcal
            </Text>
            <Text className="text-[10px] font-medium text-muted-foreground">
              {FILTER_DEFAULTS.calories[1]} kcal
            </Text>
          </View>
        </View>

        <View className="gap-2">
          <SectionRow
            title="Servings"
            right={
              <Text className="text-xs font-semibold text-muted-foreground">
                {servingsLabel}
              </Text>
            }
          />
          <View className="px-1.5">
            <RangeSlider
              min={FILTER_DEFAULTS.servings[0]}
              max={FILTER_DEFAULTS.servings[1]}
              step={1}
              minGap={1}
              value={servings}
              onChange={setServings}
              activeTrackColor="#426159"
              thumbBorderColor="#426159"
            />
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-[10px] font-medium text-muted-foreground">
              {FILTER_DEFAULTS.servings[0]} person
            </Text>
            <Text className="text-[10px] font-medium text-muted-foreground">
              {FILTER_DEFAULTS.servings[1]} people
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-2 pt-1">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="h-12 w-full flex-row items-center justify-center gap-2 rounded-full bg-sage-700 active:opacity-90"
          style={{ elevation: 6 }}
        >
          <Icon as={Edit} className="size-4 text-sage-100" fill="#dce4e2" />
          <Text className="text-sm font-bold text-white">
            {appliedCount > 0 ? `Apply (${appliedCount})` : "Apply"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
