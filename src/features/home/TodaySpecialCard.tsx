import BottomFadeOverlay from "@/components/BottomFadeOverlay";
import { Calories, Rating, Serving, Time } from "@/components/Icon";
import PressableCard from "@/components/PressableCard";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { Image } from "expo-image";
import type { ImageSourcePropType } from "react-native";
import { StyleSheet, View } from "react-native";

type TodaySpecialCardProps = {
  title: string;
  timeMin: number;
  calories: number;
  serving: string;
  rating: number;
  placeholderClassName?: string;
  imageSource?: React.ComponentProps<typeof Image>["source"];
  userAvatarSource?: ImageSourcePropType;
  onPress?: () => void;
  className?: string;
};

function MetaItem({
  icon,
  value,
  iconClassName,
}: {
  icon: React.ComponentProps<typeof Icon>["as"];
  value: string;
  iconClassName?: string;
}) {
  return (
    <View className="flex-row items-center gap-1">
      <Icon as={icon} className={cn("size-4 text-white/80", iconClassName)} />
      <Text className="text-xs font-semibold text-white/85">{value}</Text>
    </View>
  );
}

function MetaDot() {
  return <View className="h-0.5 w-0.5 rounded-full bg-white/55" />;
}

export default function TodaySpecialCard({
  title,
  timeMin,
  calories,
  serving,
  rating,
  placeholderClassName,
  imageSource,
  userAvatarSource,
  onPress,
  className,
}: TodaySpecialCardProps) {
  return (
    <PressableCard
      onPress={onPress}
      containerClassName={cn("w-full", className)}
      containerStyle={{ aspectRatio: 16 / 9 }}
      elevation={8}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          className={cn(
            "absolute inset-0",
            placeholderClassName ?? "bg-accent-200"
          )}
        />
      )}
      <BottomFadeOverlay
        className="z-10"
        maxOpacity={0.9}
        heightFraction={0.5}
      />

      {userAvatarSource ? (
        <UserAvatar
          source={userAvatarSource}
          size="large"
          className="absolute left-3 top-3 z-20"
        />
      ) : null}

      <View className="absolute bottom-3 left-3 right-3 z-20">
        <Text className="text-lg font-bold text-white" numberOfLines={1}>
          {title}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <MetaItem icon={Time} value={`${timeMin} min`} />
            <MetaDot />
            <MetaItem icon={Calories} value={`${calories} kcal`} />
            <MetaDot />
            <MetaItem icon={Serving} value={serving} />
          </View>

          <Badge className="rounded-full bg-accent-500/90 px-2 py-1">
            <View className="flex-row items-center gap-1">
              <Icon as={Rating} className="size-3 text-white" fill="white" />
              <Text className="text-xs font-bold text-white">
                {rating.toFixed(1)}
              </Text>
            </View>
          </Badge>
        </View>
      </View>
    </PressableCard>
  );
}
