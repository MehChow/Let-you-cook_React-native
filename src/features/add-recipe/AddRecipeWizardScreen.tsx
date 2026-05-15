import { isZodValidationEnabled } from "@/config/validation";
import {
  MAX_COOKING_STEPS,
  MAX_INGREDIENTS,
  SECTION_PREVIEW_TITLES,
  TOTAL_WIZARD_STEPS,
  WIZARD_STEP_DESCRIPTIONS,
  WIZARD_STEP_PRETITLE_KEYS,
  WIZARD_STEP_TITLES,
} from "@/features/add-recipe/constants";
import {
  addRecipeFormSchema,
  type AddRecipeFormValues,
} from "@/features/add-recipe/schema";
import { sanitizeIngredientGroups } from "@/features/add-recipe/utils/ingredientGroups";
import { BasicsSection } from "@/features/add-recipe/sections/BasicsSection";
import { CaloriesSection } from "@/features/add-recipe/sections/CaloriesSection";
import { CookingStepsSection } from "@/features/add-recipe/sections/CookingStepsSection";
import { ImagesSection } from "@/features/add-recipe/sections/ImagesSection";
import { IngredientsSection } from "@/features/add-recipe/sections/IngredientsSection";
import { ReminderSection } from "@/features/add-recipe/sections/ReminderSection";
import {
  applyZodIssuesToForm,
  getUniqueZodIssueMessages,
  validateWizardStep,
} from "@/features/add-recipe/validateStep";
import { PreviewHintBanner } from "@/features/add-recipe/wizard/PreviewHintBanner";
import { SectionPreviewCard } from "@/features/add-recipe/wizard/SectionPreviewCard";
import { WizardFooterActions } from "@/features/add-recipe/wizard/WizardFooterActions";
import { WizardStepHeader } from "@/features/add-recipe/wizard/WizardStepHeader";
import { WizardStepIndicator } from "@/features/add-recipe/wizard/WizardStepIndicator";
import { WizardTopBar } from "@/features/add-recipe/wizard/WizardTopBar";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
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
};

/**
 * Map step index to section component and rendering config
 */
const WIZARD_SECTION_COMPONENTS = [
  BasicsSection,
  ImagesSection,
  IngredientsSection,
  CookingStepsSection,
  ReminderSection,
  CaloriesSection,
] as const;

/**
 * Sections that need special scroll container (not wrapped in automatic ScrollView)
 */
const SECTIONS_WITH_CUSTOM_SCROLL = new Set([2, 3]); // Ingredients, CookingSteps

export function AddRecipeWizardScreen() {
  const [step, setStep] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  const methods = useForm<AddRecipeFormValues>({
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const { getValues, setError, clearErrors, formState, setValue } = methods;

  const ingredientGroups = useWatch({
    control: methods.control,
    name: "ingredientGroups",
  });
  const cookingSteps = useWatch({
    control: methods.control,
    name: "cookingSteps",
  });

  const attemptExit = useCallback(() => {
    if (isPreview) {
      setIsPreview(false);
      return;
    }
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
  }, [formState.isDirty, isPreview]);

  useEffect(() => {
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

  const goNext = useCallback(() => {
    clearErrors();
    const values = getValues();
    const result = validateWizardStep(step, values);
    if (!result.ok) {
      applyZodIssuesToForm(result.error, setError);
      if (step === 2) {
        showIngredientValidationToast(
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
  }, [clearErrors, getValues, setError, setValue, showIngredientValidationToast, step]);

  const finishRecipe = useCallback(() => {
    clearErrors();
    const values = getValues();
    if (isZodValidationEnabled) {
      const parsed = addRecipeFormSchema.safeParse(values);
      if (!parsed.success) {
        applyZodIssuesToForm(parsed.error, setError);
        const ingredientMessages = Array.from(
          new Set(
            parsed.error.issues
              .filter((issue) => issue.path[0] === "ingredientGroups")
              .map((issue) => issue.message),
          ),
        );
        if (ingredientMessages.length > 0) {
          showIngredientValidationToast(ingredientMessages);
        }
        return;
      }
      const cleanedValues = {
        ...parsed.data,
        ingredientGroups: sanitizeIngredientGroups(parsed.data.ingredientGroups),
      };
      Alert.alert(
        "Recipe saved (demo)",
        `Saved “${cleanedValues.recipeName}” locally in this build — API wiring comes later.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
      return;
    }
    Alert.alert(
      "Recipe saved (demo)",
      `Saved “${
        values.recipeName || "Untitled recipe"
      }” locally in this build — API wiring comes later.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  }, [clearErrors, getValues, setError, showIngredientValidationToast]);

  const onPrimaryFooter = useCallback(() => {
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

  const onFooterBack = useCallback(() => {
    if (isPreview) {
      setIsPreview(false);
      return;
    }
    if (step > 0) setStep((s) => s - 1);
  }, [isPreview, step]);

  const counterLabel =
    step === 2
      ? `${(ingredientGroups ?? []).reduce(
          (sum, g) => sum + (g.items?.length ?? 0),
          0
        )} / ${MAX_INGREDIENTS}`
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
                contentContainerStyle={{
                  paddingBottom: contentBottomPadding,
                }}
              >
                {SECTION_PREVIEW_TITLES.map((title, i) => {
                  const Component = WIZARD_SECTION_COMPONENTS[i];
                  return (
                    <SectionPreviewCard
                      key={title}
                      title={title}
                      onPress={() => {
                        setStep(i);
                        setIsPreview(false);
                      }}
                    >
                      <Component mode="preview" />
                    </SectionPreviewCard>
                  );
                })}
              </ScrollView>
            </>
          ) : SECTIONS_WITH_CUSTOM_SCROLL.has(step) ? (
            <View className="flex-1 mx-4">
              <WizardStepHeader
                preTitle={`STEP ${step + 1} — ${
                  WIZARD_STEP_PRETITLE_KEYS[step]
                }`}
                title={WIZARD_STEP_TITLES[step]}
                description={WIZARD_STEP_DESCRIPTIONS[step]}
                counterLabel={counterLabel}
              />
              {(() => {
                const Component = WIZARD_SECTION_COMPONENTS[step];
                return (
                  <Component
                    mode="edit"
                    bottomContentPadding={contentBottomPadding}
                    keyboardHeight={keyboardHeight}
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
                preTitle={`STEP ${step + 1} — ${
                  WIZARD_STEP_PRETITLE_KEYS[step]
                }`}
                title={WIZARD_STEP_TITLES[step]}
                description={WIZARD_STEP_DESCRIPTIONS[step]}
                counterLabel={counterLabel}
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
              showStepBack={isPreview ? true : step > 0}
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
