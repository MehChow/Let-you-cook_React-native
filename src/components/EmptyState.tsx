import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { View } from "react-native";

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  centered?: boolean;
}

export function EmptyState({
  title,
  description,
  className,
  centered = false,
}: EmptyStateProps) {
  return (
    <View
      className={cn(
        "rounded-2xl bg-white/70 px-4 py-6",
        centered && "items-center",
        className,
      )}
    >
      <Text
        className={cn(
          "text-base font-semibold text-sage-700",
          centered && "text-center",
        )}
      >
        {title}
      </Text>
      {description ? (
        <Text
          className={cn(
            "mt-2 text-sm text-muted-foreground",
            centered && "text-center",
          )}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}
