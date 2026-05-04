import { Favorite, Rating, Recipe } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

/** Matches `--color-sage-700` in global.css */
const SAGE_700 = "#314943";

type ProfileMetadataProps = {
  recipeCount: number;
  heartsCount: number;
  avgRatingLabel: string;
};

function MetaColumn({
  icon: IconComponent,
  value,
  label,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
}) {
  return (
    <View className="flex-1 items-center gap-1">
      <View className="flex-row items-center gap-1">
        <Icon
          as={IconComponent}
          className="size-5 text-sage-700"
          color={SAGE_700}
          fill={SAGE_700}
        />
        <Text className="text-base font-bold text-sage-100">{value}</Text>
      </View>
      <Text className="text-xs font-medium text-sage-100/90">{label}</Text>
    </View>
  );
}

function MetadataDivider() {
  return <View className="w-px self-stretch bg-sage-300" />;
}

export function ProfileMetadata({
  recipeCount,
  heartsCount,
  avgRatingLabel,
}: ProfileMetadataProps) {
  return (
    <View className="mt-5 rounded-2xl bg-white/15 py-2.5">
      <View className="flex-row items-stretch">
        <MetaColumn icon={Recipe} value={String(recipeCount)} label="Recipes" />
        <MetadataDivider />
        <MetaColumn
          icon={Favorite}
          value={String(heartsCount)}
          label="Hearts"
        />
        <MetadataDivider />
        <MetaColumn icon={Rating} value={avgRatingLabel} label="Avg. rating" />
      </View>
    </View>
  );
}
