import { Image as ImageIcon } from "@/components/Icon";
import { Text } from "@/components/ui/text";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { LabeledField } from "@/features/add-recipe/wizard/LabeledField";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Controller, useFormContext, useFormState, useWatch } from "react-hook-form";
import { Alert, Pressable, View } from "react-native";

export interface ImagesSectionProps {
  mode: "edit" | "preview";
}

async function pickImage(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert(
      "Permission needed",
      "Allow photo library access to add recipe images."
    );
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

export function ImagesSection({ mode }: ImagesSectionProps) {
  const { control, setValue } = useFormContext<AddRecipeFormValues>();
  const { errors } = useFormState({ control });
  const thumb = useWatch({ control, name: "thumbnailUri" });
  const secondary = useWatch({ control, name: "secondaryImageUri" });

  if (mode === "preview") {
    return (
      <View className="gap-3">
        <View className="relative overflow-hidden rounded-2xl bg-sage-100">
          {thumb ? (
            <Image
              source={{ uri: thumb }}
              style={{ width: "100%", aspectRatio: 16 / 10 }}
              contentFit="cover"
            />
          ) : (
            <View className="aspect-[16/10] w-full items-center justify-center">
              <Text className="text-sage-500">No cover image</Text>
            </View>
          )}
          {thumb ? (
            <View className="absolute right-2 top-2 rounded-md bg-sage-600 px-2 py-1">
              <Text className="text-xs font-semibold text-white">Thumbnail</Text>
            </View>
          ) : null}
        </View>
        {secondary ? (
          <Image
            source={{ uri: secondary }}
            style={{ width: "100%", aspectRatio: 2 }}
            contentFit="cover"
            className="rounded-xl"
          />
        ) : null}
      </View>
    );
  }

  return (
    <View>
      <LabeledField
        label="Cover image"
        icon={ImageIcon}
        errorMessage={errors.thumbnailUri?.message}
      >
        <Controller
          control={control}
          name="thumbnailUri"
          render={({ field: { value } }) => (
            <Pressable
              onPress={async () => {
                const uri = await pickImage();
                if (uri) setValue("thumbnailUri", uri, { shouldValidate: true });
              }}
              className="overflow-hidden rounded-2xl border border-dashed border-sage-300 bg-sage-50 active:opacity-90"
            >
              {value ? (
                <View className="relative">
                  <Image
                    source={{ uri: value }}
                    style={{ width: "100%", aspectRatio: 16 / 10 }}
                    contentFit="cover"
                  />
                  <View className="absolute right-2 top-2 rounded-md bg-sage-600 px-2 py-1">
                    <Text className="text-xs font-semibold text-white">
                      Thumbnail
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="aspect-[16/10] w-full items-center justify-center py-6">
                  <Text className="text-sage-600">Tap to choose cover image</Text>
                </View>
              )}
            </Pressable>
          )}
        />
      </LabeledField>

      <LabeledField label="Additional photo (optional)" icon={ImageIcon}>
        <Controller
          control={control}
          name="secondaryImageUri"
          render={({ field: { value } }) => (
            <Pressable
              onPress={async () => {
                const uri = await pickImage();
                if (uri) setValue("secondaryImageUri", uri);
              }}
              className="overflow-hidden rounded-2xl border border-dashed border-sage-300 bg-sage-50 active:opacity-90"
            >
              {value ? (
                <Image
                  source={{ uri: value }}
                  style={{ width: "100%", aspectRatio: 2 }}
                  contentFit="cover"
                />
              ) : (
                <View className="aspect-[2/1] w-full items-center justify-center py-4">
                  <Text className="text-sage-600">Tap to add another photo</Text>
                </View>
              )}
            </Pressable>
          )}
        />
      </LabeledField>
    </View>
  );
}
