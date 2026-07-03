import { ChevronLeft } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "react-native";

interface AuthBackButtonProps {
  onPress: () => void;
}

export function AuthBackButton({ onPress }: AuthBackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="h-11 w-11 items-center justify-center rounded-full border border-sage-200 bg-white active:opacity-80"
    >
      <Icon as={ChevronLeft} className="size-5 text-sage-700" />
    </Pressable>
  );
}
