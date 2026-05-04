import { cn } from "@/lib/utils";
import { type ViewStyle, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

type BottomFadeOverlayProps = {
  /**
   * Fraction of the parent height to cover from the bottom (0..1).
   * Defaults to 0.5 (bottom half).
   */
  heightFraction?: number;
  maxOpacity?: number;
  className?: string;
  style?: ViewStyle;
};

export default function BottomFadeOverlay({
  heightFraction = 0.5,
  maxOpacity = 0.6,
  className,
  style,
}: BottomFadeOverlayProps) {
  const opacity = Math.max(0, Math.min(1, maxOpacity));
  const clampedFraction = Math.max(0, Math.min(1, heightFraction));
  return (
    <View
      pointerEvents="none"
      className={cn(
        "absolute inset-x-0 bottom-0 overflow-hidden",
        className
      )}
      style={[{ height: `${clampedFraction * 100}%` }, style]}
    >
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="black" stopOpacity="0" />
            <Stop offset="0.35" stopColor="black" stopOpacity={opacity * 0.25} />
            <Stop offset="0.7" stopColor="black" stopOpacity={opacity * 0.65} />
            <Stop offset="1" stopColor="black" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bottomFade)" />
      </Svg>
    </View>
  );
}

