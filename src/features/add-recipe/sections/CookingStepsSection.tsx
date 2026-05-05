import { Delete, Drag, Image as ImageIcon } from "@/components/Icon";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  MAX_COOKING_STEPS,
  MAX_STEP_INSTRUCTION_LENGTH,
} from "@/features/add-recipe/constants";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { Alert, Pressable, TextInput, View } from "react-native";

export interface CookingStepsSectionProps {
  mode: "edit" | "preview";
}

async function pickStepImage(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert(
      "Permission needed",
      "Allow photo library access to add step photos."
    );
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

export function CookingStepsSection({ mode }: CookingStepsSectionProps) {
  const { control, setValue } = useFormContext<AddRecipeFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "cookingSteps",
  });
  const previewSteps = useWatch({ control, name: "cookingSteps" });

  if (mode === "preview") {
    return (
      <View className="gap-4">
        {(previewSteps ?? []).map((step, i) => (
          <View
            key={`step-${i}-${step.instruction?.slice(0, 8)}`}
            className="rounded-2xl border border-sage-100 bg-sage-50/50 p-3"
          >
            <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-sage-500">
              Step {i + 1}
            </Text>
            <Text className="text-base">{step.instruction || "—"}</Text>
            <Text className="mt-1 text-right text-xs text-sage-500">
              {step.instruction?.length ?? 0}/{MAX_STEP_INSTRUCTION_LENGTH}
            </Text>
            {step.imageUri ? (
              <Image
                source={{ uri: step.imageUri }}
                className="mt-2 w-full rounded-xl"
                style={{ aspectRatio: 4 / 3 }}
                contentFit="cover"
              />
            ) : null}
          </View>
        ))}
      </View>
    );
  }

  return (
    <NestableScrollContainer
      className="flex-1"
      style={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <NestableDraggableFlatList
        data={fields}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        onDragEnd={({ from, to }) => {
          move(from, to);
        }}
        renderItem={({ getIndex, drag, isActive }) => {
          const index = getIndex() ?? 0;
          return (
            <ScaleDecorator activeScale={1.03}>
              <View
                className={`mb-3 rounded-2xl border border-sage-200 bg-white p-3 ${
                  isActive ? "shadow-lg" : ""
                }`}
              >
                <View className="mb-2 flex-row items-center justify-between">
                  <Pressable
                    onLongPress={drag}
                    delayLongPress={120}
                    className="flex-row items-center gap-2 py-1"
                  >
                    <Icon as={Drag} size={20} color="#75948c" />
                    <Text className="text-xs font-bold uppercase text-sage-500">
                      Step {index + 1}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel="Remove step"
                    hitSlop={8}
                    onPress={() => remove(index)}
                    disabled={fields.length <= 1}
                    className="p-1 disabled:opacity-30"
                  >
                    <Icon as={Delete} size={20} color="#e53e3e" />
                  </Pressable>
                </View>
                <Controller
                  control={control}
                  name={`cookingSteps.${index}.instruction`}
                  render={({ field: f }) => (
                    <>
                      <TextInput
                        value={f.value}
                        onChangeText={f.onChange}
                        onBlur={f.onBlur}
                        placeholder="Describe this step..."
                        placeholderTextColor="#75948c"
                        multiline
                        textAlignVertical="top"
                        maxLength={MAX_STEP_INSTRUCTION_LENGTH}
                        className="min-h-24 rounded-xl border border-sage-200 bg-sage-50/50 px-3 py-2 text-base"
                      />
                      <Text className="mt-1 text-right text-xs text-sage-500">
                        {f.value.length}/{MAX_STEP_INSTRUCTION_LENGTH}
                      </Text>
                    </>
                  )}
                />
                <Controller
                  control={control}
                  name={`cookingSteps.${index}.imageUri`}
                  render={({ field: f }) => (
                    <View className="mt-2 overflow-hidden rounded-xl border border-dashed border-sage-300">
                      {f.value ? (
                        <View className="relative">
                          <Pressable
                            onPress={async () => {
                              const uri = await pickStepImage();
                              if (uri) {
                                setValue(`cookingSteps.${index}.imageUri`, uri);
                              }
                            }}
                          >
                            <Image
                              source={{ uri: f.value }}
                              style={{ width: "100%", aspectRatio: 4 / 3 }}
                              contentFit="cover"
                            />
                          </Pressable>
                          <Pressable
                            className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1"
                            onPress={() =>
                              setValue(`cookingSteps.${index}.imageUri`, "")
                            }
                          >
                            <Text className="text-xs font-bold text-white">✕</Text>
                          </Pressable>
                        </View>
                      ) : (
                        <Pressable
                          onPress={async () => {
                            const uri = await pickStepImage();
                            if (uri) {
                              setValue(`cookingSteps.${index}.imageUri`, uri);
                            }
                          }}
                          className="flex-row items-center justify-center gap-2 py-6"
                        >
                          <Icon as={ImageIcon} size={20} color="#75948c" />
                          <Text className="text-sage-600">Add step photo</Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                />
              </View>
            </ScaleDecorator>
          );
        }}
        ListFooterComponent={
          <Pressable
            onPress={() => {
              if (fields.length >= MAX_COOKING_STEPS) return;
              append({ instruction: "", imageUri: "" });
            }}
            disabled={fields.length >= MAX_COOKING_STEPS}
            className="mb-6 self-start rounded-xl border border-dashed border-sage-400 px-4 py-2 active:bg-sage-50 disabled:opacity-40"
          >
            <Text className="text-sm font-semibold text-sage-700">+ Add step</Text>
          </Pressable>
        }
      />
    </NestableScrollContainer>
  );
}
