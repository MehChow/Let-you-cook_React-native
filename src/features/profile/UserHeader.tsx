import { Edit } from "@/components/Icon";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { ImageSourcePropType } from "react-native";
import { View } from "react-native";

type ProfileUser = {
  readonly displayName: string;
  readonly location: string;
  readonly bio: readonly string[];
};

type UserHeaderProps = {
  user: ProfileUser;
  avatarSource: ImageSourcePropType;
  onPressEdit?: () => void;
};

export function UserHeader({
  user,
  avatarSource,
  onPressEdit,
}: UserHeaderProps) {
  return (
    <>
      <View className="flex-row items-center gap-3">
        <UserAvatar source={avatarSource} size="profile" />
        <View className="min-w-0 flex-1">
          <Text className="text-lg font-bold text-white">
            {user.displayName}
          </Text>
          <Text className="mt-0.5 text-sm text-white/85">{user.location}</Text>
        </View>
        <Button
          size="sm"
          className="rounded-full bg-sage-700 px-4 active:opacity-90"
          onPress={onPressEdit ?? (() => {})}
        >
          <Icon as={Edit} className="size-4 text-white" />
          <Text className="text-sm font-semibold text-white">Edit</Text>
        </Button>
      </View>

      <View className="mt-4 gap-1">
        {user.bio.map((line) => (
          <Text key={line} className="text-sm leading-5 text-white/95">
            {line}
          </Text>
        ))}
      </View>
    </>
  );
}
