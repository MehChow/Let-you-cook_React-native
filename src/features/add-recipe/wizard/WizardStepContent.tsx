import type { AddRecipeWizardStepConfig } from "@/features/add-recipe/wizard/wizardStepConfig";
import { WizardStepHeader } from "@/features/add-recipe/wizard/WizardStepHeader";
import type { FC } from "react";
import { ScrollView, View } from "react-native";

export interface WizardStepContentProps {
  step: number;
  stepConfig: AddRecipeWizardStepConfig;
  contentBottomPadding: number;
}

export const WizardStepContent: FC<WizardStepContentProps> = ({
  step,
  stepConfig,
  contentBottomPadding,
}) => {
  const SectionComponent = stepConfig.component;
  const preTitle = `STEP ${step + 1} - ${stepConfig.preTitleKey}`;

  if (stepConfig.usesCustomScroll) {
    return (
      <View className="flex-1 mx-4">
        <WizardStepHeader
          preTitle={preTitle}
          title={stepConfig.title}
          description={stepConfig.description}
        />
        <SectionComponent
          mode="edit"
          bottomContentPadding={contentBottomPadding}
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 px-4"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingBottom: contentBottomPadding,
      }}
    >
      <WizardStepHeader
        preTitle={preTitle}
        title={stepConfig.title}
        description={stepConfig.description}
      />
      <SectionComponent mode="edit" />
    </ScrollView>
  );
};
