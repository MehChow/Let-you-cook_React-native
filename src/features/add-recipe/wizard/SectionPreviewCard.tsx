import { Edit } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Pressable, View } from "react-native";

export interface SectionPreviewCardProps {
  title: string;
  children: React.ReactNode;
  onPress?: () => void;
  headerActionLabel?: string;
  onHeaderAction?: () => void;
}

export function SectionPreviewCard({
  title,
  children,
  onPress,
  headerActionLabel,
  onHeaderAction,
}: SectionPreviewCardProps) {
  const inner = (
    <>
      <View className="mb-3 flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-xl font-bold text-accent-600">
          {title}
        </Text>
        {headerActionLabel && onHeaderAction ? (
          <Pressable
            onPress={onHeaderAction}
            className="flex-row items-center gap-1 rounded-md bg-sage-100 px-2 py-1 active:opacity-90"
          >
            <Icon as={Edit} size={14} className="text-sage-500" />
            <Text className="text-xs font-semibold uppercase text-sage-500">
              {headerActionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </>
  );

  if (onPress && !onHeaderAction) {
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
