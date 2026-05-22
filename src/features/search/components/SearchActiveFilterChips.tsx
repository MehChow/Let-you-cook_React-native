import { Remove } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { SearchActiveFilterChip } from "@/features/search/hooks/useSearchDerived";
import { Pressable, ScrollView, View } from "react-native";

type SearchActiveFilterChipsProps = {
  chips: SearchActiveFilterChip[];
};

export default function SearchActiveFilterChips({
  chips,
}: SearchActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <View className="flex-row items-center gap-3">
      <Text className="text-sm font-medium text-muted-foreground">Active:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        {chips.map((chip) => (
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
              <Icon as={Remove} className="size-3.5 text-neutral-200" />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
