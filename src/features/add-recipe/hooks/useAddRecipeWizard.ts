import { TOTAL_WIZARD_STEPS } from "@/features/add-recipe/constants";
import { useAddRecipePreviewStore } from "@/features/add-recipe/addRecipePreviewStore";
import { useAddRecipeAlertDialog } from "@/features/add-recipe/hooks/useAddRecipeAlertDialog";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { sanitizeIngredientGroups } from "@/features/add-recipe/utils/ingredientGroups";
import {
  applyZodIssuesToForm,
  getUniqueZodIssueMessages,
  validateWizardStep,
} from "@/features/add-recipe/validateStep";
import { ADD_RECIPE_WIZARD_STEPS } from "@/features/add-recipe/wizard/wizardStepConfig";
import { router } from "expo-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { LayoutChangeEvent } from "react-native";
import { BackHandler, Keyboard } from "react-native";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner-native";

export interface UseAddRecipeWizardResult {
  step: number;
  stepConfig: (typeof ADD_RECIPE_WIZARD_STEPS)[number];
  showStepBack: boolean;
  primaryLabel: string;
  contentBottomPadding: number;
  alertDialog: ReactNode;
  attemptExit: () => void;
  onFooterBack: () => void;
  onPrimaryFooter: () => void;
  onFooterLayout: (event: LayoutChangeEvent) => void;
}

export const useAddRecipeWizard = (
  methods: UseFormReturn<AddRecipeFormValues>,
): UseAddRecipeWizardResult => {
  const [step, setStep] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const targetStep = useAddRecipePreviewStore((s) => s.targetStep);
  const setTargetStep = useAddRecipePreviewStore((s) => s.setTargetStep);
  const setPreviewSnapshot = useAddRecipePreviewStore((s) => s.setSnapshot);
  const { alertDialog, presentDialog } = useAddRecipeAlertDialog();

  const { clearErrors, formState, getValues, setError, setValue } = methods;

  const attemptExit = useCallback(() => {
    if (formState.isDirty) {
      presentDialog({
        title: "Discard changes?",
        description: "Your recipe draft will be lost.",
        cancelLabel: "Keep editing",
        actionLabel: "Discard",
        actionVariant: "destructive",
        onAction: () => router.back(),
      });
      return;
    }

    router.back();
  }, [formState.isDirty, presentDialog]);

  useEffect(() => {
    if (targetStep === null) return;
    setStep(targetStep);
    setTargetStep(null);
  }, [setTargetStep, targetStep]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (step > 0) {
          setStep((currentStep) => currentStep - 1);
          return true;
        }

        attemptExit();
        return true;
      },
    );

    return () => subscription.remove();
  }, [attemptExit, step]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const showStepValidationToast = useCallback(
    (title: string, messages: string[]) => {
      if (messages.length === 0) return;

      toast.error(title, {
        description: messages.join("\n"),
      });
    },
    [],
  );

  const goNext = useCallback(() => {
    clearErrors();

    const values = getValues();
    const result = validateWizardStep(step, values);
    if (!result.ok) {
      applyZodIssuesToForm(result.error, setError);

      const messages = getUniqueZodIssueMessages(result.error);
      if (step === 2) {
        showStepValidationToast("Please fix your ingredients", messages);
      }
      if (step === 3) {
        showStepValidationToast("Please fix your cooking steps", messages);
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
      setStep((currentStep) => currentStep + 1);
    }
  }, [
    clearErrors,
    getValues,
    setError,
    setValue,
    showStepValidationToast,
    step,
  ]);

  const onPrimaryFooter = useCallback(() => {
    if (step < TOTAL_WIZARD_STEPS - 1) {
      goNext();
      return;
    }

    setPreviewSnapshot(getValues());
    router.push("/add-recipe/preview");
  }, [getValues, goNext, setPreviewSnapshot, step]);

  const onFooterBack = useCallback(() => {
    if (step > 0) {
      setStep((currentStep) => currentStep - 1);
    }
  }, [step]);

  const onFooterLayout = useCallback((event: LayoutChangeEvent) => {
    const nextFooterHeight = event.nativeEvent.layout.height;
    if (nextFooterHeight > 0) {
      setFooterHeight(nextFooterHeight);
    }
  }, []);

  const contentBottomPadding =
    keyboardHeight > 0
      ? keyboardHeight + footerHeight + 24
      : Math.max(footerHeight, 0) + 24;

  return {
    step,
    stepConfig: ADD_RECIPE_WIZARD_STEPS[step],
    showStepBack: step > 0,
    primaryLabel: step < TOTAL_WIZARD_STEPS - 1 ? "Continue" : "Preview",
    contentBottomPadding,
    alertDialog,
    attemptExit,
    onFooterBack,
    onPrimaryFooter,
    onFooterLayout,
  };
};
