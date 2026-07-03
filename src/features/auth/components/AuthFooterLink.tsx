import { ChevronLeft } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Pressable, View } from "react-native";

interface AuthFooterLinkProps {
  label?: string;
  actionLabel: string;
  onPress: () => void;
  showChevron?: boolean;
}

export function AuthFooterLink({
  label,
  actionLabel,
  onPress,
  showChevron = false,
}: AuthFooterLinkProps) {
  return (
    <View className="flex-row items-center justify-center gap-1">
      {label ? (
        <Text className="text-sm text-neutral-600 font-medium">{label}</Text>
      ) : null}
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-2 active:opacity-70"
      >
        {showChevron ? (
          <Icon as={ChevronLeft} className="size-4 text-sage-500" />
        ) : null}
        <Text className="text-sm font-bold text-sage-600">{actionLabel}</Text>
      </Pressable>
    </View>
  );
}
