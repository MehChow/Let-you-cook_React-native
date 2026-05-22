import Chip from "@/components/Chip";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Pressable, ScrollView } from "react-native";

type FilterChipGroupProps<T extends string> = {
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: string }[];
};

export default function FilterChipGroup<T extends string>({
  value,
  onChange,
  options,
}: FilterChipGroupProps<T>) {
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
