import { AI, Delete, Edit } from "@/components/Icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { NutritionSummary } from "@/features/add-recipe/components/calories/NutritionSummary";
import { useCaloriesSection } from "@/features/add-recipe/hooks/useCaloriesSection";
import { View } from "react-native";

export interface CaloriesSectionProps {
  mode: "edit" | "preview";
}

function CaloriesSectionPreview() {
  const { nutritionMode, previewSummary } = useCaloriesSection();

  return (
    <View>
      {previewSummary ? (
        <NutritionSummary
          compact
          headerIcon={nutritionMode === "manual" ? "edit" : "ai"}
          title={
            nutritionMode === "manual"
              ? "Manual input"
              : "AI Calories calculator"
          }
          description={
            nutritionMode === "manual"
              ? "Preview of your current manual nutrition values."
              : "AI estimation summary for this recipe."
          }
          rows={previewSummary.rows}
          totalCalories={previewSummary.totalCalories}
        />
      ) : (
        <Text className="text-xs text-sage-500">
          No nutrition information is currently selected to be saved.
        </Text>
      )}
    </View>
  );
}

export function CaloriesSection({ mode }: CaloriesSectionProps) {
  const {
    aiActionLabel,
    aiStatus,
    aiSummary,
    handleAnalyze,
    handleRemoveAiResult,
    handleRemoveManualResult,
    inputRows,
    isAnalyzing,
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
          {aiStatus === "ready" || aiStatus === "stale" ? (
            <NutritionSummary
              headerIcon="ai"
              title="AI Calories calculator"
              description="This estimate uses your ingredients, quantities, serving count and cooking steps."
              rows={aiSummary.rows}
              totalCalories={aiSummary.totalCalories}
              statusBannerLabel={
                aiStatus === "stale" ? "Analysis outdated" : "Analysis complete"
              }
              statusBannerTone={aiStatus === "stale" ? "warning" : "success"}
              primaryActionLabel={
                aiStatus === "stale" ? "Re-analyze" : undefined
              }
              primaryActionLoading={isAnalyzing}
              onPrimaryAction={aiStatus === "stale" ? handleAnalyze : undefined}
              primaryActionDisabled={isAnalyzing}
              secondaryActionLabel="Remove"
              onSecondaryAction={handleRemoveAiResult}
            />
          ) : (
            <NutritionSummary
              headerIcon="ai"
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
                isAnalyzing ? "Analyzing recipe..." : aiActionLabel
              }
              primaryActionLoading={isAnalyzing}
              onPrimaryAction={handleAnalyze}
              primaryActionDisabled={isAnalyzing}
            />
          )}
        </TabsContent>

        <TabsContent value="manual" className="mt-0">
          <NutritionSummary
            headerIcon="edit"
            title="Manual input"
            description="Manually fill in the nutrients data. The chart will be updated in real time."
            rows={manualSummary.rows}
            totalCalories={manualSummary.totalCalories}
            inputRows={inputRows}
            onChangeInputValue={setMacroValue}
            primaryActionLabel={manualHasAnyValue ? "Remove" : undefined}
            primaryActionDestructive
            primaryActionIcon={
              manualHasAnyValue ? (
                <Delete size={14} color="#ffffff" />
              ) : undefined
            }
            onPrimaryAction={
              manualHasAnyValue ? handleRemoveManualResult : undefined
            }
          />
        </TabsContent>
      </Tabs>
    </View>
  );
}
