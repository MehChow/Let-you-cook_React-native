import {
  TOTAL_WIZARD_STEPS,
  WIZARD_STEP_DESCRIPTIONS,
  WIZARD_STEP_PRETITLE_KEYS,
  WIZARD_STEP_TITLES,
} from "@/features/add-recipe/constants";
import { type AddRecipeFormValues } from "@/features/add-recipe/schema";
import { BasicsSection } from "@/features/add-recipe/sections/BasicsSection";
import { CaloriesSection } from "@/features/add-recipe/sections/CaloriesSection";
import { CookingStepsSection } from "@/features/add-recipe/sections/CookingStepsSection";
import { ImagesSection } from "@/features/add-recipe/sections/ImagesSection";
import { IngredientsSection } from "@/features/add-recipe/sections/IngredientsSection";
import { ReminderSection } from "@/features/add-recipe/sections/ReminderSection";
import { sanitizeIngredientGroups } from "@/features/add-recipe/utils/ingredientGroups";
import {
  applyZodIssuesToForm,
  getUniqueZodIssueMessages,
  validateWizardStep,
} from "@/features/add-recipe/validateStep";
import { useAddRecipePreviewStore } from "@/features/add-recipe/addRecipePreviewStore";
import { WizardFooterActions } from "@/features/add-recipe/wizard/WizardFooterActions";
import { WizardStepHeader } from "@/features/add-recipe/wizard/WizardStepHeader";
import { WizardStepIndicator } from "@/features/add-recipe/wizard/WizardStepIndicator";
import { WizardTopBar } from "@/features/add-recipe/wizard/WizardTopBar";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Alert, BackHandler, Keyboard, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const defaultValues: AddRecipeFormValues = {
  recipeName: "",
  description: "",
  cookTimeMinutes: "",
  servings: "",
  recipeImageUris: [],
  ingredientGroups: [
    {
      groupName: "Group name",
      items: [{ name: "", quantityAmount: "", quantityUnit: "g" }],
    },
  ],
  cookingSteps: [{ instruction: "", imageUri: "" }],
  chefNotes: "",
  nutritionMode: "ai",
  nutritionAiProteinGrams: null,
  nutritionAiCarbsGrams: null,
  nutritionAiFatGrams: null,
  nutritionAiTotalCalories: null,
  nutritionAiSourceFingerprint: "",
  nutritionProteinGrams: "",
  nutritionCarbsGrams: "",
  nutritionFatGrams: "",
};

const WIZARD_SECTION_COMPONENTS = [
  BasicsSection,
  ImagesSection,
  IngredientsSection,
  CookingStepsSection,
  ReminderSection,
  CaloriesSection,
] as const;

const SECTIONS_WITH_CUSTOM_SCROLL = new Set([2, 3]);

export function AddRecipeWizardScreen() {
  const [step, setStep] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const targetStep = useAddRecipePreviewStore((s) => s.targetStep);
  const setTargetStep = useAddRecipePreviewStore((s) => s.setTargetStep);
  const setPreviewSnapshot = useAddRecipePreviewStore((s) => s.setSnapshot);

  const methods = useForm<AddRecipeFormValues>({
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const { getValues, setError, clearErrors, formState, setValue } = methods;

  const attemptExit = useCallback(() => {
    if (formState.isDirty) {
      Alert.alert("Discard changes?", "Your recipe draft will be lost.", [
        { text: "Keep editing", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]);
    } else {
      router.back();
    }
  }, [formState.isDirty]);

  useEffect(() => {
    if (targetStep === null) return;
    setStep(targetStep);
    setTargetStep(null);
  }, [setTargetStep, targetStep]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (step > 0) {
        setStep((s) => s - 1);
        return true;
      }
      attemptExit();
      return true;
    });
    return () => sub.remove();
  }, [attemptExit, step]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const showIngredientValidationToast = useCallback((messages: string[]) => {
    if (messages.length === 0) return;

    toast.error("Please fix your ingredients", {
      description: messages.join("\n"),
    });
  }, []);

  const showCookingStepsValidationToast = useCallback((messages: string[]) => {
    if (messages.length === 0) return;

    toast.error("Please fix your cooking steps", {
      description: messages.join("\n"),
    });
  }, []);

  const goNext = useCallback(() => {
    clearErrors();
    const values = getValues();
    const result = validateWizardStep(step, values);
    if (!result.ok) {
      applyZodIssuesToForm(result.error, setError);
      if (step === 2) {
        showIngredientValidationToast(getUniqueZodIssueMessages(result.error));
      }
      if (step === 3) {
        showCookingStepsValidationToast(
          getUniqueZodIssueMessages(result.error),
        );
      }
      return;
    }

    if (step === 2) {
      setValue(
        "ingredientGroups",
        sanitizeIngredientGroups(values.ingredientGroups),
        {
          shouldDirty: true,
          shouldTouch: false,
          shouldValidate: false,
        },
      );
    }

    if (step < TOTAL_WIZARD_STEPS - 1) {
      setStep((s) => s + 1);
    }
  }, [
    clearErrors,
    getValues,
    setError,
    setValue,
    showCookingStepsValidationToast,
    showIngredientValidationToast,
    step,
  ]);

  const onPrimaryFooter = useCallback(() => {
    if (step < TOTAL_WIZARD_STEPS - 1) {
      goNext();
    } else {
      setPreviewSnapshot(getValues());
      router.push("/add-recipe/preview");
    }
  }, [getValues, goNext, setPreviewSnapshot, step]);

  const onFooterBack = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  const primaryLabel = step < TOTAL_WIZARD_STEPS - 1 ? "Continue" : "Preview";

  const contentBottomPadding =
    keyboardHeight > 0
      ? keyboardHeight + footerHeight + 24
      : Math.max(footerHeight, 0) + 24;

  return (
    <FormProvider {...methods}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#dce4e2" }}
        edges={["top"]}
      >
        <View style={{ flex: 1 }}>
          <WizardTopBar
            title="Create Recipe"
            onExit={attemptExit}
          />

          <WizardStepIndicator currentStepIndex={step} />

          {SECTIONS_WITH_CUSTOM_SCROLL.has(step) ? (
            <View className="flex-1 mx-4">
              <WizardStepHeader
                preTitle={`STEP ${step + 1} - ${WIZARD_STEP_PRETITLE_KEYS[step]}`}
                title={WIZARD_STEP_TITLES[step]}
                description={WIZARD_STEP_DESCRIPTIONS[step]}
              />
              {(() => {
                const Component = WIZARD_SECTION_COMPONENTS[step];
                return (
                  <Component
                    mode="edit"
                    bottomContentPadding={contentBottomPadding}
                  />
                );
              })()}
            </View>
          ) : (
            <ScrollView
              className="flex-1 px-4"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingBottom: contentBottomPadding,
              }}
            >
              <WizardStepHeader
                preTitle={`STEP ${step + 1} - ${WIZARD_STEP_PRETITLE_KEYS[step]}`}
                title={WIZARD_STEP_TITLES[step]}
                description={WIZARD_STEP_DESCRIPTIONS[step]}
              />
              {(() => {
                const Component = WIZARD_SECTION_COMPONENTS[step];
                return <Component mode="edit" />;
              })()}
            </ScrollView>
          )}

          <View
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              if (h > 0) setFooterHeight(h);
            }}
          >
            <WizardFooterActions
              showStepBack={step > 0}
              primaryLabel={primaryLabel}
              onStepBack={onFooterBack}
              onPrimary={onPrimaryFooter}
            />
          </View>
        </View>
      </SafeAreaView>
    </FormProvider>
  );
}
