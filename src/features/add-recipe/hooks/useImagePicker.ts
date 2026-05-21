import * as ImagePicker from "expo-image-picker";
import { useAddRecipeAlertDialog } from "@/features/add-recipe/hooks/useAddRecipeAlertDialog";
import { useCallback } from "react";

export const useImagePicker = () => {
  const { alertDialog, presentDialog } = useAddRecipeAlertDialog();

  const pickImage = useCallback(async (
    context: "step" | "recipe" = "recipe"
  ): Promise<string | null> => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      const contextLabels = {
        recipe: "recipe images",
        step: "step photos",
      };
      presentDialog({
        title: "Permission needed",
        description: `Allow photo library access to add ${contextLabels[context]}.`,
      });
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return null;
    return result.assets[0].uri;
  }, [presentDialog]);

  return { pickImage, alertDialog };
};
