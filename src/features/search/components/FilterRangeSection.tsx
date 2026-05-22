import RangeSlider from "@/components/RangeSlider";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

type FilterRangeSectionProps = {
  title: string;
  valueLabel: string;
  min: number;
  max: number;
  step: number;
  minGap: number;
  value: readonly [number, number];
  onChange: (next: readonly [number, number]) => void;
  minLabel: string;
  maxLabel: string;
};

export default function FilterRangeSection({
  title,
  valueLabel,
  min,
  max,
  step,
  minGap,
  value,
  onChange,
  minLabel,
  maxLabel,
}: FilterRangeSectionProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-bold text-foreground">{title}</Text>
        <Text className="text-xs font-semibold text-muted-foreground">
          {valueLabel}
        </Text>
      </View>

      <View className="px-1.5">
        <RangeSlider
          min={min}
          max={max}
          step={step}
          minGap={minGap}
          value={value}
          onChange={onChange}
          activeTrackColor="#426159"
          thumbBorderColor="#426159"
        />
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-[10px] font-medium text-muted-foreground">
          {minLabel}
        </Text>
        <Text className="text-[10px] font-medium text-muted-foreground">
          {maxLabel}
        </Text>
      </View>
    </View>
  );
}
