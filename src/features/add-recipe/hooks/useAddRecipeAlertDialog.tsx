import { AddRecipeAlertDialog } from "@/features/add-recipe/components/AddRecipeAlertDialog";
import { useState } from "react";

export interface AddRecipeDialogOptions {
  title: string;
  description?: string;
  actionLabel?: string;
  cancelLabel?: string;
  actionVariant?: "default" | "destructive";
  onAction?: () => void;
  onCancel?: () => void;
}

export const useAddRecipeAlertDialog = () => {
  const [dialogOptions, setDialogOptions] =
    useState<AddRecipeDialogOptions | null>(null);

  const closeDialog = () => {
    setDialogOptions(null);
  };

  const presentDialog = (options: AddRecipeDialogOptions) => {
    setDialogOptions(options);
  };

  const handleCancel = () => {
    const onCancel = dialogOptions?.onCancel;
    closeDialog();
    onCancel?.();
  };

  const handleAction = () => {
    const onAction = dialogOptions?.onAction;
    closeDialog();
    onAction?.();
  };

  const alertDialog = (
    <AddRecipeAlertDialog
      open={dialogOptions !== null}
      title={dialogOptions?.title ?? ""}
      description={dialogOptions?.description}
      actionLabel={dialogOptions?.actionLabel}
      cancelLabel={dialogOptions?.cancelLabel}
      actionVariant={dialogOptions?.actionVariant}
      onOpenChange={(open) => {
        if (!open) {
          closeDialog();
        }
      }}
      onAction={handleAction}
      onCancel={handleCancel}
    />
  );

  return {
    presentDialog,
    closeDialog,
    alertDialog,
  };
};
