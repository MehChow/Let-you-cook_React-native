import { HasNotifications, NoNotifications } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Pressable, View } from "react-native";

type HomeHeaderProps = {
  title: string;
  subtitle: string;
  onPressNotifications?: () => void;
  className?: string;
};

export default function HomeHeader({
  title,
  subtitle,
  onPressNotifications,
  className,
}: HomeHeaderProps) {
  // In the real app this will be toggled by state; for now the home page shows
  // only the "no notification" variant as requested.
  const hasNotifications = false;

  return (
    <View className={cn("flex-row items-center justify-between", className)}>
      <View className="flex-1 pr-3">
        <Text className="text-2xl font-bold text-foreground">{title}</Text>
        <Text className="text-base font-medium text-sage-400">{subtitle}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        onPress={onPressNotifications}
        className="relative h-10 w-10 items-center justify-center rounded-full bg-sage-200 active:opacity-80"
      >
        <Icon
          as={hasNotifications ? HasNotifications : NoNotifications}
          className={cn(
            "size-5",
            hasNotifications ? "text-sage-600" : "text-sage-500"
          )}
        />

        {hasNotifications ? (
          <View
            className="absolute h-2 w-2 rounded-full bg-accent-500"
            style={{ right: 2, top: 2 }}
          />
        ) : null}
      </Pressable>
    </View>
  );
}
