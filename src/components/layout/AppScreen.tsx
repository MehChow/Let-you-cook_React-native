import { cn } from "@/lib/utils";
import { colors } from "@/util/twColor";
import type { PropsWithChildren } from "react";
import { View } from "react-native";
import type { Edge } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native-safe-area-context";

interface AppScreenProps extends PropsWithChildren {
  className?: string;
  background?: "default" | "profile";
  edges?: readonly Edge[];
}

const backgroundClass: Record<
  NonNullable<AppScreenProps["background"]>,
  string
> = {
  default: "bg-app-screen",
  profile: "bg-app-profile",
};

const backgroundStyle: Record<
  NonNullable<AppScreenProps["background"]>,
  string
> = {
  default: colors.sage[100],
  profile: colors.sage[500],
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
      style={{ backgroundColor: backgroundStyle[background], flex: 1 }}
    >
      <View className={cn("flex-1", backgroundClass[background], className)}>
        {children}
      </View>
    </SafeAreaView>
  );
}
