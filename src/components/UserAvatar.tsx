import { cn } from "@/lib/utils";
import { Image } from "expo-image";
import type { ImageSourcePropType } from "react-native";
import { View } from "react-native";

export type UserAvatarSize = "profile" | "large" | "medium" | "small";

type UserAvatarProps = {
  source: ImageSourcePropType;
  size: UserAvatarSize;
  className?: string;
};

type AvatarDiameters = {
  outer: number;
  middle: number;
  inner: number;
};

// Exact Figma diameters (outer -> middle -> inner).
const DIAMETERS: Record<UserAvatarSize, AvatarDiameters> = {
  small: { outer: 28, middle: 24, inner: 22 },
  medium: { outer: 42, middle: 38, inner: 36 },
  large: { outer: 56, middle: 52, inner: 50 },
  // Tuned for visual centering: thicker, even rings avoid “shifted” look at 72px.
  profile: { outer: 72, middle: 66, inner: 62 },
};

export default function UserAvatar({
  source,
  size,
  className,
}: UserAvatarProps) {
  const { outer, middle, inner } = DIAMETERS[size];

  return (
    <View
      className={cn(
        "items-center justify-center rounded-full bg-sage-300",
        className
      )}
      style={{
        width: outer,
        height: outer,
        borderRadius: outer / 2,
      }}
    >
      <View
        className="items-center justify-center rounded-full bg-white"
        style={{
          width: middle,
          height: middle,
          borderRadius: middle / 2,
        }}
      >
        <Image
          source={source}
          contentFit="cover"
          style={{
            width: inner,
            height: inner,
            borderRadius: inner / 2,
          }}
        />
      </View>
    </View>
  );
}
