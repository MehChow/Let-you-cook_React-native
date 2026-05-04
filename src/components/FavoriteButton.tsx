import { Favorite } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { Pressable, View } from "react-native";

type FavoriteButtonSize = "default" | "compact";

type FavoriteButtonProps = {
  isActive?: boolean;
  onPress?: () => void;
  className?: string;
  size?: FavoriteButtonSize;
};

const sizeClasses: Record<
  FavoriteButtonSize,
  { wrap: string; icon: string }
> = {
  default: { wrap: "h-9 w-9", icon: "size-5" },
  compact: { wrap: "h-6 w-6", icon: "size-3" },
};

export default function FavoriteButton({
  isActive = false,
  onPress,
  className,
  size = "default",
}: FavoriteButtonProps) {
  const bgClass = isActive ? "bg-danger-400" : "bg-white/70";
  const iconClass = isActive ? "text-white" : "text-danger-400";
  const { wrap, icon } = sizeClasses[size];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isActive ? "Remove from favourites" : "Add to favourites"
      }
      onPress={onPress}
      className={cn("active:opacity-80", className)}
    >
      <View
        className={cn(
          "items-center justify-center rounded-full",
          wrap,
          bgClass
        )}
      >
        <Icon
          as={Favorite}
          className={cn(icon, iconClass)}
          fill={isActive ? "white" : "transparent"}
        />
      </View>
    </Pressable>
  );
}
