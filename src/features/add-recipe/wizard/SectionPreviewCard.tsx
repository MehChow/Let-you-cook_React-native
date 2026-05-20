import { Text } from "@/components/ui/text";
import { Pressable, View } from "react-native";

export interface SectionPreviewCardProps {
  title: string;
  children: React.ReactNode;
  onPress?: () => void;
}

export function SectionPreviewCard({
  title,
  children,
  onPress,
}: SectionPreviewCardProps) {
  const inner = (
    <>
      <Text className="mb-3 text-lg font-bold text-accent-600">{title}</Text>
      {children}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className="mx-4 mb-3 rounded-2xl border border-gray-100 bg-white p-4 active:opacity-90"
        style={{ elevation: 2 }}
      >
        {inner}
      </Pressable>
    );
  }

  return (
    <View
      className="mx-4 mb-3 rounded-2xl border border-gray-100 bg-white p-4"
      style={{ elevation: 2 }}
    >
      {inner}
    </View>
  );
}
