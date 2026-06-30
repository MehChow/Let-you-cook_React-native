import { AppScreen } from "@/components/layout/AppScreen";
import { isAddRecipePreviewDebugEnabled } from "@/config/addRecipePreviewDebug";
import { addRecipeFormDefaults } from "@/features/add-recipe/addRecipeFormDefaults";
import { addRecipePreviewDebugDefaults } from "@/features/add-recipe/addRecipePreviewDebugDefaults";
import { useAddRecipeWizard } from "@/features/add-recipe/hooks/useAddRecipeWizard";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { WizardFooterActions } from "@/features/add-recipe/wizard/WizardFooterActions";
import { WizardStepContent } from "@/features/add-recipe/wizard/WizardStepContent";
import { WizardStepIndicator } from "@/features/add-recipe/wizard/WizardStepIndicator";
import { WizardTopBar } from "@/features/add-recipe/wizard/WizardTopBar";
import { FormProvider, useForm } from "react-hook-form";
import { View } from "react-native";

export function AddRecipeWizardScreen() {
  const initialValues: AddRecipeFormValues = isAddRecipePreviewDebugEnabled
    ? addRecipePreviewDebugDefaults
    : addRecipeFormDefaults;

  const methods = useForm<AddRecipeFormValues>({
    defaultValues: initialValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const {
    alertDialog,
    attemptExit,
    contentBottomPadding,
    onFooterBack,
    onFooterLayout,
    onPrimaryFooter,
    primaryLabel,
    showStepBack,
    step,
    stepConfig,
  } = useAddRecipeWizard(methods);

  return (
    <FormProvider {...methods}>
      <AppScreen edges={["top"]}>
        <View style={{ flex: 1 }}>
          <WizardTopBar title="Create Recipe" onExit={attemptExit} />

          <WizardStepIndicator currentStepIndex={step} />

          <WizardStepContent
            step={step}
            stepConfig={stepConfig}
            contentBottomPadding={contentBottomPadding}
          />

          <View onLayout={onFooterLayout}>
            <WizardFooterActions
              showStepBack={showStepBack}
              primaryLabel={primaryLabel}
              onStepBack={onFooterBack}
              onPrimary={onPrimaryFooter}
            />
          </View>
          {alertDialog}
        </View>
      </AppScreen>
    </FormProvider>
  );
}
