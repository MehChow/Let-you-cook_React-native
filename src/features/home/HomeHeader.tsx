import { Notifications } from "@/components/Icon";
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
        className="h-10 w-10 items-center justify-center rounded-full bg-white/60 active:opacity-80"
      >
        <Icon as={Notifications} className="size-5 text-foreground" />
      </Pressable>
    </View>
  );
}
