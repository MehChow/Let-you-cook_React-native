import { AI, Calories as CaloriesIcon, Edit } from "@/components/Icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { NutritionSummary } from "@/features/add-recipe/components/calories/NutritionSummary";
import { useCaloriesSection } from "@/features/add-recipe/hooks/useCaloriesSection";
import { Keyboard, View } from "react-native";

export interface CaloriesSectionProps {
  mode: "edit" | "preview";
}

function CaloriesSectionPreview() {
  const { nutritionMode, previewSummary } = useCaloriesSection();

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <CaloriesIcon size={18} color="#426159" />
          <Text className="text-sm font-semibold text-black">
            Nutritional information
          </Text>
        </View>

        <View className="flex-row items-center gap-1 rounded-md bg-sage-200 px-2 py-1">
          {nutritionMode === "ai" ? (
            <AI size={14} color="#426159" />
          ) : (
            <Edit size={14} color="#426159" />
          )}
          <Text className="text-xs font-semibold uppercase text-sage-700">
            {nutritionMode}
          </Text>
        </View>
      </View>

      <NutritionSummary
        compact
        title={
          nutritionMode === "manual" ? "Manual input" : "AI Calories calculator"
        }
        description={
          nutritionMode === "manual"
            ? "Preview of your current manual nutrition values."
            : "AI estimation summary for this recipe."
        }
        rows={previewSummary.rows}
        totalCalories={previewSummary.totalCalories}
      />
    </View>
  );
}

export function CaloriesSection({ mode }: CaloriesSectionProps) {
  const {
    aiState,
    aiSummary,
    handleAnalyze,
    handleRemoveAiResult,
    inputRows,
    manualHasAnyValidValue,
    manualHasAnyValue,
    manualIsComplete,
    manualSummary,
    nutritionMode,
    setMacroValue,
    setMode,
  } = useCaloriesSection();

  if (mode === "preview") {
    return <CaloriesSectionPreview />;
  }

  return (
    <View className="gap-3 pb-2">
      <Tabs
        value={nutritionMode}
        onValueChange={(value) => setMode(value as "ai" | "manual")}
        className="gap-4"
      >
        {/* Tab switch */}
        <TabsList className="w-full flex-row rounded-lg bg-white h-auto p-0.5 border border-neutral-200">
          <TabsTrigger
            value="ai"
            className={
              nutritionMode === "ai"
                ? "flex-1 rounded-lg bg-sage-600 px-4 py-1.5"
                : "flex-1 rounded-lg bg-transparent px-4 py-1.5"
            }
          >
            <AI
              size={12}
              color={nutritionMode === "ai" ? "white" : "#426159"}
            />
            <Text
              className={
                nutritionMode === "ai"
                  ? "text-xs font-semibold text-white"
                  : "text-xs font-semibold text-sage-600"
              }
            >
              AI Calculator
            </Text>
          </TabsTrigger>

          <TabsTrigger
            value="manual"
            className={
              nutritionMode === "manual"
                ? "flex-1 rounded-lg bg-sage-600 px-4 py-1.5"
                : "flex-1 rounded-lg bg-transparent px-4 py-1.5"
            }
          >
            <Edit
              size={12}
              color={nutritionMode === "manual" ? "white" : "#426159"}
            />
            <Text
              className={
                nutritionMode === "manual"
                  ? "text-xs font-semibold text-white"
                  : "text-xs font-semibold text-sage-600"
              }
            >
              Manual input
            </Text>
          </TabsTrigger>
        </TabsList>

        {/* Tab content */}
        <TabsContent value="ai" className="mt-0">
          {aiState === "success" ? (
            <NutritionSummary
              title="AI Calories calculator"
              description="This estimate uses your ingredients, quantities, serving count and cooking steps."
              rows={aiSummary.rows}
              totalCalories={aiSummary.totalCalories}
              successBannerLabel="Success"
              secondaryActionLabel="Remove"
              onSecondaryAction={handleRemoveAiResult}
            />
          ) : (
            <NutritionSummary
              title="AI Calories calculator"
              description="Tap the button below to analyze your recipe. This uses your ingredients, quantities, serving count and cooking steps."
              hideVisualization
              rows={aiSummary.rows.map((row) => ({
                ...row,
                grams: 0,
                gramsText: "0g",
                calories: 0,
                ratio: 0,
              }))}
              totalCalories={0}
              primaryActionLabel={
                aiState === "loading" ? "Analyzing recipe..." : "Analyze"
              }
              primaryActionLoading={aiState === "loading"}
              onPrimaryAction={handleAnalyze}
              primaryActionDisabled={aiState === "loading"}
            />
          )}
        </TabsContent>

        <TabsContent value="manual" className="mt-0">
          <NutritionSummary
            title="Manual input"
            description="Manually fill in the nutrients data. The chart will be updated in real time."
            rows={manualSummary.rows}
            totalCalories={manualSummary.totalCalories}
            inputRows={inputRows}
            onChangeInputValue={setMacroValue}
            primaryActionLabel="Apply"
            onPrimaryAction={Keyboard.dismiss}
            secondaryActionLabel={manualHasAnyValue ? "Remove" : undefined}
            onSecondaryAction={
              manualHasAnyValue
                ? () => {
                    setMacroValue("nutritionProteinGrams", "");
                    setMacroValue("nutritionCarbsGrams", "");
                    setMacroValue("nutritionFatGrams", "");
                  }
                : undefined
            }
          />

          <View className="px-1">
            <Text className="text-xs text-sage-500">
              {manualIsComplete
                ? "All macro fields are filled. Calories are calculated automatically."
                : manualHasAnyValidValue
                  ? "Calories update live from any valid macro value. Missing fields count as zero."
                  : "Enter protein, carbs, or fat in whole grams to start the live calorie estimate."}
            </Text>
          </View>
        </TabsContent>
      </Tabs>
    </View>
  );
}
