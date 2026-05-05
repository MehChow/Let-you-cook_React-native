import { AI, Calories as CaloriesIcon } from "@/components/Icon";
import { Text } from "@/components/ui/text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { LabeledField } from "@/features/add-recipe/wizard/LabeledField";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { View } from "react-native";

function StubDonut() {
  return (
    <View className="h-[120px] w-[120px] items-center justify-center rounded-full border-8 border-sage-200 border-t-sage-600 border-r-accent-500 border-b-warning-500">
      <Text className="text-lg font-bold">580</Text>
      <Text className="text-xs text-sage-500">kcal</Text>
    </View>
  );
}

export interface CaloriesSectionProps {
  mode: "edit" | "preview";
}

export function CaloriesSection({ mode }: CaloriesSectionProps) {
  const { control } = useFormContext<AddRecipeFormValues>();
  const modeVal = useWatch({ control, name: "nutritionMode" });

  const previewInner =
    modeVal === "manual" ? (
      <Text className="text-sage-600">
        Manual nutrition — values will be entered here later.
      </Text>
    ) : (
      <View className="flex-row items-center gap-4">
        <StubDonut />
        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-sage-600" />
            <Text className="text-sm">Protein: 7g</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-accent-500" />
            <Text className="text-sm">Carbs: 48g</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-warning-500" />
            <Text className="text-sm">Fat: 40g</Text>
          </View>
        </View>
      </View>
    );

  if (mode === "preview") {
    return (
      <View>
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <CaloriesIcon size={18} color="#426159" />
            <Text className="text-sm font-semibold">
              Nutritional information
            </Text>
          </View>
          {modeVal === "ai" ? (
            <View className="flex-row items-center gap-1 rounded-md bg-sage-200 px-2 py-0.5">
              <AI size={14} color="#426159" />
              <Text className="text-xs font-semibold">AI</Text>
            </View>
          ) : null}
        </View>
        {previewInner}
      </View>
    );
  }

  return (
    <View>
      <LabeledField label="Nutrition source" icon={CaloriesIcon}>
        <Controller
          control={control}
          name="nutritionMode"
          render={({ field: { value, onChange } }) => (
            <Tabs
              value={value}
              onValueChange={(v) => onChange(v as "ai" | "manual")}
              className="gap-4"
            >
              <TabsList className="w-full flex-row">
                <TabsTrigger value="ai" className="flex-1">
                  <Text>AI</Text>
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex-1">
                  <Text>Manual</Text>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="ai" className="mt-2">
                <View className="flex-row items-center gap-4">
                  <StubDonut />
                  <View className="flex-1 gap-2">
                    <Text className="text-xs font-semibold uppercase text-sage-500">
                      Estimated (stub)
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <View className="h-2 w-2 rounded-full bg-sage-600" />
                      <Text className="text-sm">Protein: 7g</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <View className="h-2 w-2 rounded-full bg-accent-500" />
                      <Text className="text-sm">Carbs: 48g</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <View className="h-2 w-2 rounded-full bg-warning-500" />
                      <Text className="text-sm">Fat: 40g</Text>
                    </View>
                  </View>
                </View>
              </TabsContent>
              <TabsContent value="manual" className="mt-2">
                <Text className="text-sage-600">
                  Manual entry will be available in a future update.
                </Text>
              </TabsContent>
            </Tabs>
          )}
        />
      </LabeledField>
    </View>
  );
}
