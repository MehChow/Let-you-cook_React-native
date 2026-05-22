import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import type { RecipeDetailIngredientGroup } from "@/features/recipe-detail/types";
import * as React from "react";
import { View } from "react-native";
import { RecipeDetailSection } from "./RecipeDetailSection";

interface RecipeIngredientsSectionProps {
  groups: RecipeDetailIngredientGroup[];
}

export const RecipeIngredientsSection: React.FC<
  RecipeIngredientsSectionProps
> = ({ groups }) => {
  const totalItems = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <RecipeDetailSection
      title="Ingredients"
      action={
        <View className="rounded-full bg-sage-50 py-1">
          <Text className="text-xs font-semibold text-sage-700">
            {groups.length} group{groups.length === 1 ? "" : "s"} - {totalItems}{" "}
            item
            {totalItems === 1 ? "" : "s"}
          </Text>
        </View>
      }
    >
      <View className="gap-3">
        {groups.map((group, groupIndex) => {
          const groupTitle = group.title?.trim() || `Group ${groupIndex + 1}`;

          return (
            <Card key={group.id} className="gap-0 rounded-3xl bg-sage-100 py-3">
              <CardContent className="px-4">
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-sage-700">
                      {groupTitle}
                    </Text>
                  </View>
                  <View className="rounded-full bg-white px-2.5 py-1">
                    <Text className="text-xs font-semibold text-sage-700">
                      {group.items.length} item
                      {group.items.length === 1 ? "" : "s"}
                    </Text>
                  </View>
                </View>

                <Separator className="my-2 bg-neutral-200 h-[1.5px]" />

                <View className="flex-row flex-wrap">
                  {group.items.map((item) => (
                    <View
                      key={item.id}
                      className="mb-2 w-1/2 flex-row items-center pr-4"
                    >
                      <Text className="flex-1 pr-2 text-xs font-bold text-black">
                        {item.name}
                      </Text>
                      <Text className="text-xs font-medium text-neutral-500">
                        {item.quantity}
                      </Text>
                    </View>
                  ))}
                </View>
              </CardContent>
            </Card>
          );
        })}
      </View>
    </RecipeDetailSection>
  );
};
