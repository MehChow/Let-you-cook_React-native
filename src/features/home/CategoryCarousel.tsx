import PressableCard from "@/components/PressableCard";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { ScrollView, StyleSheet, View } from "react-native";
import BottomFadeOverlay from "@/components/BottomFadeOverlay";
import { Image } from "expo-image";
import * as React from "react";

export type CategoryCarouselItem = {
  id: string;
  label: string;
  placeholderColorClass?: string;
  imageSource?: React.ComponentProps<typeof Image>["source"];
};

type CategoryCarouselProps = {
  items: CategoryCarouselItem[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
};

export default function CategoryCarousel({
  items,
  selectedId,
  onSelect,
  className,
}: CategoryCarouselProps) {
  const scrollRef = React.useRef<ScrollView>(null);
  const containerWidthRef = React.useRef(0);
  const itemLayoutRef = React.useRef<Record<string, { x: number; width: number }>>(
    {}
  );

  React.useEffect(() => {
    if (!selectedId) return;
    const layout = itemLayoutRef.current[selectedId];
    const containerWidth = containerWidthRef.current;
    if (!layout || !containerWidth) return;

    // Center the selected item when possible.
    const targetX = Math.max(0, layout.x - (containerWidth - layout.width) / 2);
    // Defer until after layout/paint to avoid no-op scroll calls.
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: targetX, animated: true });
    });
  }, [selectedId]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      // Home screen already provides `px-5`, so avoid extra right padding here.
      contentContainerClassName={cn("gap-3", className)}
      onLayout={(e) => {
        containerWidthRef.current = e.nativeEvent.layout.width;
      }}
    >
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        const shouldDim = Boolean(selectedId) && !isSelected;
        return (
          <PressableCard
            key={item.id}
            onPress={() => onSelect?.(item.id)}
            elevation={5}
            containerStyle={{ aspectRatio: 1 }}
            containerClassName={cn("w-[88px] rounded-2xl border border-neutral-200")}
            className={cn(shouldDim && "opacity-50")}
            onLayout={(e) => {
              const { x, width } = e.nativeEvent.layout;
              itemLayoutRef.current[item.id] = { x, width };
            }}
          >
            {item.imageSource ? (
              <Image
                source={item.imageSource}
                contentFit="cover"
                style={StyleSheet.absoluteFillObject}
              />
            ) : (
              <View
                className={cn(
                  "absolute inset-0",
                  item.placeholderColorClass ?? "bg-neutral-200"
                )}
              />
            )}
            <BottomFadeOverlay className="z-10" maxOpacity={0.62} heightFraction={0.5} />
            <Text className="absolute bottom-2 left-3 z-20 text-[12px] font-semibold text-white">
              {item.label}
            </Text>
          </PressableCard>
        );
      })}
    </ScrollView>
  );
}

