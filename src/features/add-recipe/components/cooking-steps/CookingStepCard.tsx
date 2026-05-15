import { Delete, Drag, Image as ImageIcon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { MAX_STEP_INSTRUCTION_LENGTH } from "@/features/add-recipe/constants";
import { useImagePicker } from "@/features/add-recipe/hooks/useImagePicker";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Pressable, TextInput, View } from "react-native";

export interface CookingStepCardProps {
  index: number;
  isActive: boolean;
  onDrag: () => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const CookingStepCard = ({
  index,
  isActive,
  onDrag,
  onRemove,
  canRemove,
}: CookingStepCardProps) => {
  const { control, setValue } = useFormContext<AddRecipeFormValues>();
  const { pickImage } = useImagePicker();

  const handlePickImage = useCallback(async () => {
    const uri = await pickImage("step");
    if (uri) {
      setValue(`cookingSteps.${index}.imageUri`, uri);
    }
  }, [index, pickImage, setValue]);

  const handleRemoveImage = useCallback(() => {
    setValue(`cookingSteps.${index}.imageUri`, "");
  }, [index, setValue]);

  return (
    <Card
      className={`mb-3 rounded-2xl border border-sage-200 bg-white p-3 gap-2 ${
        isActive ? "shadow-lg" : ""
      }`}
    >
      {/* Header with drag handle and remove button */}
      <CardHeader className="flex-row items-center px-0 gap-0">
        <Pressable
          onLongPress={() => {
            onDrag();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          delayLongPress={120}
          className="flex-row items-center gap-2 flex-1"
        >
          <Icon as={Drag} size={20} color="#75948c" />

          <View className="gap-1 flex-row items-center">
            <Text className="text-lg font-bold uppercase tracking-wider">
              Step
            </Text>
            <Badge className="w-6 h-6 px-0 flex bg-sage-700" variant="default">
              <Text className="text-sm font-bold text-white">{index + 1}</Text>
            </Badge>
          </View>
        </Pressable>

        <Pressable
          accessibilityLabel="Remove step"
          hitSlop={8}
          onPress={onRemove}
          disabled={!canRemove}
          className="p-2 disabled:opacity-30"
        >
          <Icon as={Delete} size={20} color="#e53e3e" />
        </Pressable>
      </CardHeader>

      {/* Instruction input */}
      <Controller
        control={control}
        name={`cookingSteps.${index}.instruction`}
        render={({ field: f }) => (
          <View className="relative">
            <TextInput
              value={f.value ?? ""}
              onChangeText={f.onChange}
              onBlur={f.onBlur}
              placeholder="Mix the flour with butter..."
              placeholderTextColor="#75948c"
              multiline
              textAlignVertical="top"
              maxLength={MAX_STEP_INSTRUCTION_LENGTH}
              className="min-h-20 rounded-xl border border-sage-200 bg-white px-3 pb-7 text-base"
            />
            <View pointerEvents="none" className="absolute bottom-2 right-3">
              <Text className="text-xs text-sage-500">
                {(f.value ?? "").length} / {MAX_STEP_INSTRUCTION_LENGTH}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Image picker/preview */}
      <Controller
        control={control}
        name={`cookingSteps.${index}.imageUri`}
        render={({ field: f }) => (
          <>
            {f.value ? (
              // Display 16:9 Preview
              <View className="relativeqwdqwdqwdwqd">
                <Pressable onPress={handlePickImage}>
                  <Image
                    source={{ uri: f.value }}
                    style={{
                      width: "100%",
                      aspectRatio: 16 / 9,
                      borderRadius: 16,
                    }}
                    contentFit="cover"
                  />
                </Pressable>
                <Pressable
                  className="absolute right-2 top-2 rounded-full bg-black/60 py-1 w-6 h-6 px-0 items-center"
                  onPress={handleRemoveImage}
                >
                  <Text className="text-xs font-bold text-white">✕</Text>
                </Pressable>
              </View>
            ) : (
              // Add image (optional)
              <Pressable
                onPress={handlePickImage}
                className="flex-row items-center justify-start gap-1 py-1 active:opacity-80"
              >
                <Icon as={ImageIcon} size={16} color="#314943" />
                <Text className="text-sage-700 font-semibold text-xs">
                  Add image (optional)
                </Text>
              </Pressable>
            )}
          </>
        )}
      />
    </Card>
  );
};
