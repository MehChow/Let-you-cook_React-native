import * as ImagePicker from "expo-image-picker";
import { useCallback } from "react";
import { Alert } from "react-native";

export const useImagePicker = () => {
  const pickImage = useCallback(async (
    context: "step" | "recipe" = "recipe"
  ): Promise<string | null> => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      const contextLabels = {
        recipe: "recipe images",
        step: "step photos",
      };
      Alert.alert(
        "Permission needed",
        `Allow photo library access to add ${contextLabels[context]}.`
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return null;
    return result.assets[0].uri;
  }, []);

  return { pickImage };
};
