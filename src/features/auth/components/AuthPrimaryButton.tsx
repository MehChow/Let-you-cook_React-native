import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface AuthPrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function AuthPrimaryButton({
  label,
  onPress,
  disabled = false,
}: AuthPrimaryButtonProps) {
  return (
    <Button
      onPress={onPress}
      disabled={disabled}
      className="h-12 rounded-full bg-sage-600 active:bg-sage-700"
    >
      <Text className="text-base font-semibold text-white">{label}</Text>
    </Button>
  );
}
