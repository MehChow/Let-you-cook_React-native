import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";
import type { ViewStyle } from "react-native";
import type { Edge } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native-safe-area-context";

interface AppScreenProps extends PropsWithChildren {
  className?: string;
  background?: "default" | "profile";
  edges?: readonly Edge[];
}

const backgroundColor: Record<
  NonNullable<AppScreenProps["background"]>,
  ViewStyle["backgroundColor"]
> =
  {
    default: "#dce4e2",
    profile: "#52796f",
  };

export function AppScreen({
  children,
  className,
  background = "default",
  edges = ["top", "left", "right"],
}: AppScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      style={{ flex: 1, backgroundColor: backgroundColor[background] }}
      className={cn(className)}
    >
      {children}
    </SafeAreaView>
  );
}
