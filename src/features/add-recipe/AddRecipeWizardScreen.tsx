import { BasicsSection } from "@/features/add-recipe/sections/BasicsSection";
import { CaloriesSection } from "@/features/add-recipe/sections/CaloriesSection";
import { CookingStepsSection } from "@/features/add-recipe/sections/CookingStepsSection";
import { ImagesSection } from "@/features/add-recipe/sections/ImagesSection";
import { IngredientsSection } from "@/features/add-recipe/sections/IngredientsSection";
import { ReminderSection } from "@/features/add-recipe/sections/ReminderSection";
import {
  addRecipeFormSchema,
  type AddRecipeFormValues,
} from "@/features/add-recipe/schema";
import { PreviewHintBanner } from "@/features/add-recipe/wizard/PreviewHintBanner";
import { SectionPreviewCard } from "@/features/add-recipe/wizard/SectionPreviewCard";
import { WizardFooterActions } from "@/features/add-recipe/wizard/WizardFooterActions";
import { WizardStepHeader } from "@/features/add-recipe/wizard/WizardStepHeader";
import { WizardStepIndicator } from "@/features/add-recipe/wizard/WizardStepIndicator";
import { WizardTopBar } from "@/features/add-recipe/wizard/WizardTopBar";
import {
  applyZodIssuesToForm,
  validateWizardStep,
} from "@/features/add-recipe/validateStep";
import {
  MAX_COOKING_STEPS,
  MAX_INGREDIENTS,
  SECTION_PREVIEW_TITLES,
  TOTAL_WIZARD_STEPS,
  WIZARD_STEP_DESCRIPTIONS,
  WIZARD_STEP_PRETITLE_KEYS,
  WIZARD_STEP_TITLES,
} from "@/features/add-recipe/constants";
import { router } from "expo-router";
import * as React from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const defaultValues: AddRecipeFormValues = {
  recipeName: "",
  description: "",
  cookTimeMinutes: "",
  servings: "",
  thumbnailUri: "",
  secondaryImageUri: "",
  ingredients: [{ name: "", quantity: "" }],
  cookingSteps: [{ instruction: "", imageUri: "" }],
  chefNotes: "",
  nutritionMode: "ai",
};

function renderWizardStep(step: number): React.ReactNode {
  switch (step) {
    case 0:
      return <BasicsSection mode="edit" />;
    case 1:
      return <ImagesSection mode="edit" />;
    case 2:
      return <IngredientsSection mode="edit" />;
    case 3:
      return <CookingStepsSection mode="edit" />;
    case 4:
      return <ReminderSection mode="edit" />;
    case 5:
      return <CaloriesSection mode="edit" />;
    default:
      return null;
  }
}

function renderPreviewSection(stepIndex: number): React.ReactNode {
  switch (stepIndex) {
    case 0:
      return <BasicsSection mode="preview" />;
    case 1:
      return <ImagesSection mode="preview" />;
    case 2:
      return <IngredientsSection mode="preview" />;
    case 3:
      return <CookingStepsSection mode="preview" />;
    case 4:
      return <ReminderSection mode="preview" />;
    case 5:
      return <CaloriesSection mode="preview" />;
    default:
      return null;
  }
}

export function AddRecipeWizardScreen() {
  const [step, setStep] = React.useState(0);
  const [isPreview, setIsPreview] = React.useState(false);

  const methods = useForm<AddRecipeFormValues>({
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const { getValues, setError, clearErrors, formState } = methods;

  const ingredients = useWatch({ control: methods.control, name: "ingredients" });
  const cookingSteps = useWatch({
    control: methods.control,
    name: "cookingSteps",
  });

  const attemptExit = React.useCallback(() => {
    if (isPreview) {
      setIsPreview(false);
      return;
    }
    if (formState.isDirty) {
      Alert.alert(
        "Discard changes?",
        "Your recipe draft will be lost.",
        [
          { text: "Keep editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  }, [formState.isDirty, isPreview]);

  React.useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isPreview) {
        setIsPreview(false);
        return true;
      }
      if (step > 0) {
        setStep((s) => s - 1);
        return true;
      }
      attemptExit();
      return true;
    });
    return () => sub.remove();
  }, [step, isPreview, attemptExit]);

  const goNext = React.useCallback(() => {
    clearErrors();
    const values = getValues();
    const result = validateWizardStep(step, values);
    if (!result.ok) {
      applyZodIssuesToForm(result.error, setError);
      return;
    }
    if (step < TOTAL_WIZARD_STEPS - 1) {
      setStep((s) => s + 1);
    }
  }, [clearErrors, getValues, setError, step]);

  const finishRecipe = React.useCallback(() => {
    clearErrors();
    const values = getValues();
    const parsed = addRecipeFormSchema.safeParse(values);
    if (!parsed.success) {
      applyZodIssuesToForm(parsed.error, setError);
      return;
    }
    Alert.alert(
      "Recipe saved (demo)",
      `Saved “${parsed.data.recipeName}” locally in this build — API wiring comes later.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  }, [clearErrors, getValues, setError]);

  const onPrimaryFooter = React.useCallback(() => {
    if (isPreview) {
      setIsPreview(false);
      if (step < TOTAL_WIZARD_STEPS - 1) {
        setStep((s) => s + 1);
      } else {
        finishRecipe();
      }
      return;
    }
    if (step < TOTAL_WIZARD_STEPS - 1) {
      goNext();
    } else {
      finishRecipe();
    }
  }, [finishRecipe, goNext, isPreview, step]);

  const onFooterBack = React.useCallback(() => {
    if (isPreview) {
      setIsPreview(false);
      return;
    }
    if (step > 0) setStep((s) => s - 1);
  }, [isPreview, step]);

  const counterLabel =
    step === 2
      ? `${ingredients?.length ?? 0} / ${MAX_INGREDIENTS}`
      : step === 3
        ? `${cookingSteps?.length ?? 0} / ${MAX_COOKING_STEPS}`
        : undefined;

  const primaryLabel = isPreview
    ? step < TOTAL_WIZARD_STEPS - 1
      ? "Continue"
      : "Save recipe"
    : step < TOTAL_WIZARD_STEPS - 1
      ? "Continue"
      : "Save recipe";

  return (
    <FormProvider {...methods}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <View className="flex-1 bg-sage-100">
            <WizardTopBar
              title={isPreview ? "Preview" : "Create Recipe"}
              previewActive={isPreview}
              onExit={attemptExit}
              onTogglePreview={() => {
                if (isPreview) setIsPreview(false);
                else setIsPreview(true);
              }}
            />

            {!isPreview ? <WizardStepIndicator currentStepIndex={step} /> : null}

            {isPreview ? (
              <>
                <PreviewHintBanner />
                <ScrollView
                  className="flex-1"
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 24 }}
                >
                  {SECTION_PREVIEW_TITLES.map((title, i) => (
                    <SectionPreviewCard
                      key={title}
                      title={title}
                      onPress={() => {
                        setStep(i);
                        setIsPreview(false);
                      }}
                    >
                      {renderPreviewSection(i)}
                    </SectionPreviewCard>
                  ))}
                </ScrollView>
              </>
            ) : step === 3 ? (
              <View className="flex-1 px-4">
                <WizardStepHeader
                  preTitle={`STEP ${step + 1} — ${WIZARD_STEP_PRETITLE_KEYS[step]}`}
                  title={WIZARD_STEP_TITLES[step]}
                  description={WIZARD_STEP_DESCRIPTIONS[step]}
                  counterLabel={counterLabel}
                />
                <CookingStepsSection mode="edit" />
              </View>
            ) : (
              <ScrollView
                className="flex-1 px-4"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                <WizardStepHeader
                  preTitle={`STEP ${step + 1} — ${WIZARD_STEP_PRETITLE_KEYS[step]}`}
                  title={WIZARD_STEP_TITLES[step]}
                  description={WIZARD_STEP_DESCRIPTIONS[step]}
                  counterLabel={counterLabel}
                />
                {renderWizardStep(step)}
              </ScrollView>
            )}

            <WizardFooterActions
              showStepBack={isPreview ? true : step > 0}
              primaryLabel={primaryLabel}
              onStepBack={onFooterBack}
              onPrimary={onPrimaryFooter}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </FormProvider>
  );
}
