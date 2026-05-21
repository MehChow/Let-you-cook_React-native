import { AddRecipeAlertDialog } from "@/features/add-recipe/components/AddRecipeAlertDialog";
import { useCallback, useMemo, useState } from "react";

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

  const closeDialog = useCallback(() => {
    setDialogOptions(null);
  }, []);

  const presentDialog = useCallback((options: AddRecipeDialogOptions) => {
    setDialogOptions(options);
  }, []);

  const handleCancel = useCallback(() => {
    const onCancel = dialogOptions?.onCancel;
    closeDialog();
    onCancel?.();
  }, [closeDialog, dialogOptions]);

  const handleAction = useCallback(() => {
    const onAction = dialogOptions?.onAction;
    closeDialog();
    onAction?.();
  }, [closeDialog, dialogOptions]);

  const alertDialog = useMemo(
    () => (
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
    ),
    [closeDialog, dialogOptions, handleAction, handleCancel]
  );

  return {
    presentDialog,
    closeDialog,
    alertDialog,
  };
};
