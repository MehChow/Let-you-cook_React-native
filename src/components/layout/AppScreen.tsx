import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";
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

export function AppScreen({
  children,
  className,
  background = "default",
  edges = ["top", "left", "right"],
}: AppScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      className={cn("flex-1", backgroundClass[background], className)}
    >
      {children}
    </SafeAreaView>
  );
}
