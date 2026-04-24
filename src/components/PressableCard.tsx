import { cn } from "@/lib/utils";
import * as React from "react";
import { Pressable, type PressableProps, type ViewStyle } from "react-native";

type PressableCardProps = PressableProps & {
  elevation?: number;
  containerClassName?: string;
  containerStyle?: ViewStyle;
  pressEffect?: "opacity" | "none";
};

export default function PressableCard({
  elevation = 6,
  containerClassName,
  containerStyle,
  pressEffect = "opacity",
  className,
  ...props
}: PressableCardProps) {
  return (
    <Pressable
      className={cn(
        "overflow-hidden rounded-2xl border border-neutral-200 bg-white",
        pressEffect === "opacity" && "active:opacity-90",
        containerClassName,
        className
      )}
      style={[{ elevation }, containerStyle]}
      {...props}
    />
  );
}

