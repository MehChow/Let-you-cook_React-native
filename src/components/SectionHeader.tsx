import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
  actionIcon?: LucideIcon;
  className?: string;
};

export default function SectionHeader({
  title,
  actionLabel,
  onPressAction,
  actionIcon,
  className,
}: SectionHeaderProps) {
  const hasAction = Boolean(onPressAction && (actionLabel || actionIcon));

  return (
    <View className={cn("flex-row items-center justify-between", className)}>
      <Text className="text-base font-bold text-sage-700">{title}</Text>
      {hasAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPressAction}
          className="rounded-full px-2 py-1 active:opacity-70"
        >
          <View className="flex-row items-center gap-1.5">
            {actionLabel ? (
              <Text className="text-sm font-semibold text-sage-400">
                {actionLabel}
              </Text>
            ) : null}
            {actionIcon ? (
              <Icon as={actionIcon} className="size-4 text-sage-400" />
            ) : null}
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}
