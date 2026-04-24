import { Favorite } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { Pressable, View } from "react-native";

type FavoriteButtonProps = {
  isActive?: boolean;
  onPress?: () => void;
  className?: string;
};

export default function FavoriteButton({
  isActive = false,
  onPress,
  className,
}: FavoriteButtonProps) {
  const bgClass = isActive ? "bg-danger-400" : "bg-white/70";
  const iconClass = isActive ? "text-white" : "text-danger-400";
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
          "h-9 w-9 items-center justify-center rounded-full",
          bgClass
        )}
      >
        <Icon
          as={Favorite}
          className={cn("size-5", iconClass)}
          fill={isActive ? "white" : "transparent"}
        />
      </View>
    </Pressable>
  );
}
