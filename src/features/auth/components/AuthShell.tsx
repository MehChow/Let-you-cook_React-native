import { AppScreen } from "@/components/layout/AppScreen";
import { cn } from "@/lib/utils";
import type { PropsWithChildren, ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

interface AuthShellProps extends PropsWithChildren {
  decoration?: ReactNode;
  contentClassName?: string;
  scrollContentClassName?: string;
}

export function AuthShell({
  children,
  decoration,
  contentClassName,
  scrollContentClassName,
}: AuthShellProps) {
  return (
    <AppScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {decoration ? (
          <View className="pointer-events-none absolute inset-0">
            {decoration}
          </View>
        ) : null}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName={cn(
            "min-h-full px-6 pb-10 pt-6",
            scrollContentClassName,
          )}
        >
          <View className={cn("mx-auto w-full max-w-[440px]", contentClassName)}>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}
