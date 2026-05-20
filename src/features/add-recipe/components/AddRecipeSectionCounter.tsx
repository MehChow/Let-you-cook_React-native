import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export interface AddRecipeSectionCounterItem {
  label: string;
  count: number;
  max: number;
}

export interface AddRecipeSectionCounterProps {
  items: AddRecipeSectionCounterItem[];
}

export const AddRecipeSectionCounter = ({
  items,
}: AddRecipeSectionCounterProps) => {
  if (items.length === 1) {
    const item = items[0];
    const atLimit = item.count >= item.max;

    return (
      <View className="items-center py-2">
        <Text className="text-xs font-semibold text-neutral-300">
          {item.label}:{" "}
          <Text
            className={`text-xs font-semibold ${
              atLimit ? "text-danger-500" : "text-sage-500"
            }`}
          >
            {item.count} / {item.max}
          </Text>
        </Text>
      </View>
    );
  }

  if (items.length === 2) {
    const [first, second] = items;

    return (
      <View className="flex-row items-center justify-center py-2">
        <View className="flex-1 items-center">
          <Text className="text-xs font-semibold text-neutral-300">
            {first.label}:{" "}
            <Text
              className={`text-xs font-semibold ${
                first.count >= first.max ? "text-danger-500" : "text-sage-500"
              }`}
            >
              {first.count} / {first.max}
            </Text>
          </Text>
        </View>

        <Separator orientation="vertical" className="h-full bg-sage-300" />

        <View className="flex-1 items-center">
          <Text className="text-xs font-semibold text-neutral-300">
            {second.label}:{" "}
            <Text
              className={`text-xs font-semibold ${
                second.count >= second.max ? "text-danger-500" : "text-sage-500"
              }`}
            >
              {second.count} / {second.max}
            </Text>
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-center py-2">
      {items.map((item) => {
        const atLimit = item.count >= item.max;

        return (
          <View key={`${item.label}-${item.max}`} className="flex-1 items-center">
            <Text className="text-xs font-semibold text-neutral-300">
              {item.label}:{" "}
              <Text
                className={`text-xs font-semibold ${
                  atLimit ? "text-danger-500" : "text-sage-500"
                }`}
              >
                {item.count} / {item.max}
              </Text>
            </Text>
          </View>
        );
      })}
    </View>
  );
};
