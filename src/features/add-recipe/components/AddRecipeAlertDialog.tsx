import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";

export interface AddRecipeAlertDialogProps {
  open: boolean;
  title: string;
  description?: string;
  actionLabel?: string;
  cancelLabel?: string;
  actionVariant?: "default" | "destructive";
  onOpenChange: (open: boolean) => void;
  onAction?: () => void;
  onCancel?: () => void;
}

export const AddRecipeAlertDialog = ({
  open,
  title,
  description,
  actionLabel = "OK",
  cancelLabel,
  actionVariant = "default",
  onOpenChange,
  onAction,
  onCancel,
}: AddRecipeAlertDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[90%] ">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            <Text className="text-xl font-bold text-sage-600">{title}</Text>
          </AlertDialogTitle>
          {description ? (
            <AlertDialogDescription className="text-center">
              <Text className="text-center text-base leading-6 text-sage-700">
                {description}
              </Text>
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-1 gap-3">
          {cancelLabel ? (
            <AlertDialogCancel
              onPress={onCancel}
              accessibilityLabel={cancelLabel}
              className="border-sage-300"
            >
              <Text className="text-base font-semibold text-sage-700">
                {cancelLabel}
              </Text>
            </AlertDialogCancel>
          ) : null}
          <AlertDialogAction
            onPress={onAction}
            accessibilityLabel={actionLabel}
            className={
              actionVariant === "destructive"
                ? "bg-destructive active:bg-destructive/90"
                : "bg-sage-600 active:bg-sage-700"
            }
          >
            <Text className="text-base font-semibold text-white">
              {actionLabel}
            </Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
