import { useAddRecipePreviewStore } from "@/features/add-recipe/addRecipePreviewStore";
import {
  SECTION_PREVIEW_TITLES,
  TOTAL_WIZARD_STEPS,
} from "@/features/add-recipe/constants";
import { useAddRecipeAlertDialog } from "@/features/add-recipe/hooks/useAddRecipeAlertDialog";
import {
  addRecipeFormSchema,
  type AddRecipeFormValues,
} from "@/features/add-recipe/schema";
import { BasicsSection } from "@/features/add-recipe/sections/BasicsSection";
import { CaloriesSection } from "@/features/add-recipe/sections/CaloriesSection";
import { CookingStepsSection } from "@/features/add-recipe/sections/CookingStepsSection";
import { ImagesSection } from "@/features/add-recipe/sections/ImagesSection";
import { IngredientsSection } from "@/features/add-recipe/sections/IngredientsSection";
import { ReminderSection } from "@/features/add-recipe/sections/ReminderSection";
import { sanitizeIngredientGroups } from "@/features/add-recipe/utils/ingredientGroups";
import { resolveNutritionSaveDecision } from "@/features/add-recipe/utils/nutrition";
import { PreviewHintBanner } from "@/features/add-recipe/wizard/PreviewHintBanner";
import { SectionPreviewCard } from "@/features/add-recipe/wizard/SectionPreviewCard";
import { WizardFooterActions } from "@/features/add-recipe/wizard/WizardFooterActions";
import { WizardTopBar } from "@/features/add-recipe/wizard/WizardTopBar";
import { router } from "expo-router";
import { FormProvider, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WIZARD_SECTION_COMPONENTS = [
  BasicsSection,
  ImagesSection,
  IngredientsSection,
  CookingStepsSection,
  ReminderSection,
  CaloriesSection,
] as const;

function AddRecipePreviewContent() {
  const setTargetStep = useAddRecipePreviewStore((s) => s.setTargetStep);
  const jumpToStep = (stepIndex: number) => {
    setTargetStep(stepIndex);
    router.back();
  };

  return (
    <>
      <PreviewHintBanner />
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {SECTION_PREVIEW_TITLES.map((title, i) => {
          const Component = WIZARD_SECTION_COMPONENTS[i];
          return (
            <SectionPreviewCard
              key={title}
              title={title}
              onPress={i === 1 ? undefined : () => jumpToStep(i)}
              headerActionLabel={i === 1 ? "Edit" : undefined}
              onHeaderAction={i === 1 ? () => jumpToStep(i) : undefined}
            >
              <Component mode="preview" />
            </SectionPreviewCard>
          );
        })}
      </ScrollView>
    </>
  );
}

export function AddRecipePreviewScreen() {
  const snapshot = useAddRecipePreviewStore((s) => s.snapshot);
  const { alertDialog, presentDialog } = useAddRecipeAlertDialog();

  const methods = useForm<AddRecipeFormValues>({
    defaultValues: snapshot ?? undefined,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  if (!snapshot) {
    router.replace("/add-recipe");
    return null;
  }

  const finishRecipe = () => {
    const values = methods.getValues();
    const parsed = addRecipeFormSchema.safeParse(values);

    if (!parsed.success) {
      presentDialog({
        title: "Preview out of date",
        description:
          "This draft needs attention before it can be saved. Please go back to the Calories step and review it.",
      });
      return;
    }

    const cleanedValues = {
      ...parsed.data,
      ingredientGroups: sanitizeIngredientGroups(parsed.data.ingredientGroups),
    };
    const nutritionDecision = resolveNutritionSaveDecision(cleanedValues);

    if (nutritionDecision.kind === "switch_source") {
      const nextMode = nutritionDecision.suggestedSource;
      presentDialog({
        title:
          nextMode === "ai" ? "Use AI nutrition?" : "Use manual nutrition?",
        description:
          nextMode === "ai"
            ? "Manual input is empty, but AI nutrition is ready. Switch to AI and save this recipe?"
            : "AI analysis is empty, but manual nutrition is ready. Switch to Manual input and save this recipe?",
        cancelLabel: "Cancel",
        actionLabel: "Switch and Save",
        onAction: () => {
          presentDialog({
            title: "Recipe saved (demo)",
            description: `${cleanedValues.recipeName || "Untitled recipe"} saved locally in this build. Nutrition source: ${nextMode}, ${nutritionDecision.nutrition.totalCalories} kcal. API wiring comes later.`,
            onAction: () => router.dismiss(2),
          });
        },
      });
      return;
    }

    if (nutritionDecision.kind === "stale_ai") {
      presentDialog({
        title: "AI analysis is outdated",
        description:
          "Your recipe changed after the last AI analysis. Please go back to the Calories step to re-analyze or switch to manual nutrition.",
        cancelLabel: "Stay here",
        actionLabel: "Back to Calories",
        onAction: () => {
          useAddRecipePreviewStore
            .getState()
            .setTargetStep(TOTAL_WIZARD_STEPS - 1);
          router.back();
        },
      });
      return;
    }

    const savedNutrition =
      nutritionDecision.kind === "save"
        ? `${nutritionDecision.nutrition.source}, ${nutritionDecision.nutrition.totalCalories} kcal`
        : "No nutrition information";

    presentDialog({
      title: "Recipe saved (demo)",
      description: `${cleanedValues.recipeName || "Untitled recipe"} saved locally in this build. ${savedNutrition}. API wiring comes later.`,
      onAction: () => router.dismiss(2),
    });
  };

  return (
    <FormProvider {...methods}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#dce4e2" }}
        edges={["top"]}
      >
        <View style={{ flex: 1 }}>
          <WizardTopBar
            title="Preview"
            onExit={() => router.back()}
            showPreviewButton={false}
          />
          <AddRecipePreviewContent />
          <WizardFooterActions
            showStepBack
            primaryLabel="Save recipe"
            onStepBack={() => router.back()}
            onPrimary={finishRecipe}
          />
          {alertDialog}
        </View>
      </SafeAreaView>
    </FormProvider>
  );
}
