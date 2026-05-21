import { Delete, Drag, Image as ImageIcon, Remove } from "@/components/Icon";
import { AddRecipeCounterTextArea } from "@/components/add-recipe/AddRecipeCounterTextArea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { MAX_STEP_INSTRUCTION_LENGTH } from "@/features/add-recipe/constants";
import { useImagePicker } from "@/features/add-recipe/hooks/useImagePicker";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { colors } from "@/util/twColor";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { memo, useCallback } from "react";
import { Controller, useFormContext, type Control } from "react-hook-form";
import { Pressable, View } from "react-native";

export interface CookingStepCardProps {
  index: number;
  displayIndex?: number;
  isActive: boolean;
  onDrag: () => void;
  onRemove: () => void;
  canRemove: boolean;
  onAnyInputFocus?: (input: import("react-native").TextInput | null) => void;
}

export function CookingStepCard({
  index,
  displayIndex,
  isActive,
  onDrag,
  onRemove,
  canRemove,
  onAnyInputFocus,
}: CookingStepCardProps) {
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
      className={`mb-3 gap-2 rounded-2xl border border-sage-200 bg-white p-3 ${
        isActive ? "shadow-lg" : ""
      }`}
    >
      <CardHeader className="flex-row items-center gap-0 px-0">
        <Pressable
          onLongPress={() => {
            onDrag();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          delayLongPress={120}
          className="flex-1 flex-row items-center gap-2"
        >
          <Icon as={Drag} size={20} color={colors.sage[600]} />
          <View className="flex-row items-center gap-1">
            <Text className="text-lg font-bold uppercase text-sage-600">
              Step
            </Text>
            <Badge className="flex h-6 w-6 bg-sage-700 px-0" variant="default">
              <Text className="text-white">{(displayIndex ?? index) + 1}</Text>
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
          <Icon as={Delete} size={20} color={colors.danger[500]} />
        </Pressable>
      </CardHeader>

      <AddRecipeCounterTextArea
        control={control}
        name={`cookingSteps.${index}.instruction`}
        placeholder="Mix the flour with butter..."
        maxLength={MAX_STEP_INSTRUCTION_LENGTH}
        inputClassName="min-h-20 pb-7"
        onInputFocus={onAnyInputFocus}
        highlightCounterAtLimit
      />

      <ControllerImageField
        control={control}
        index={index}
        onPickImage={handlePickImage}
        onRemoveImage={handleRemoveImage}
      />
    </Card>
  );
}

export const MemoizedCookingStepCard = memo(CookingStepCard);

function ControllerImageField({
  control,
  index,
  onPickImage,
  onRemoveImage,
}: {
  control: Control<AddRecipeFormValues>;
  index: number;
  onPickImage: () => void;
  onRemoveImage: () => void;
}) {
  return (
    <Controller
      control={control}
      name={`cookingSteps.${index}.imageUri`}
      render={({ field: f }) => (
        <>
          {f.value ? (
            <View className="relative">
              <Pressable onPress={onPickImage}>
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
                className="absolute right-2 top-2 h-6 w-6 items-center justify-center rounded-full bg-black/60"
                onPress={onRemoveImage}
              >
                <Icon as={Remove} size={16} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={onPickImage}
              className="flex-row items-center justify-start gap-1 py-1 active:opacity-80"
            >
              <Icon as={ImageIcon} size={16} color="#314943" />
              <Text className="text-xs font-semibold text-sage-700">
                Add image (optional)
              </Text>
            </Pressable>
          )}
        </>
      )}
    />
  );
}
