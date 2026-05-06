import { MAX_RECIPE_IMAGES } from "@/features/add-recipe/constants";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import * as ImagePicker from "expo-image-picker";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";
import { Alert, ScrollView, useWindowDimensions } from "react-native";

/** Matches `px-4` wizard horizontal inset for the images step. */
export const RECIPE_IMAGES_EDIT_CONTENT_GUTTER = 32;
/** Preview cards use `px-6` (24*2) from screen edges for image strip width. */
export const RECIPE_IMAGES_PREVIEW_CONTENT_GUTTER = 48;

export const RECIPE_IMAGES_GRID_GAP = 12;

function newRecipeImageClientKey(): string {
  const c = globalThis.crypto;
  if (c && "randomUUID" in c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

async function pickImageFromLibrary(): Promise<string | null> {
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
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

export function useRecipeImagesField() {
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = screenWidth - RECIPE_IMAGES_EDIT_CONTENT_GUTTER;
  const previewWidth = screenWidth - RECIPE_IMAGES_PREVIEW_CONTENT_GUTTER;

  const { control, clearErrors } = useFormContext<AddRecipeFormValues>();
  const { errors } = useFormState({ control });
  const previewImages = useWatch({ control, name: "recipeImageUris" });

  const carouselRef = useRef<ScrollView>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [gridDragging, setGridDragging] = useState(false);

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "recipeImageUris",
  });

  const photoModels = useMemo(
    () => fields.map((f) => ({ uri: f.uri, clientKey: f.clientKey })),
    [fields]
  );

  const resetCarouselToFirst = useCallback(() => {
    setCarouselIndex(0);
    carouselRef.current?.scrollTo({ x: 0, y: 0, animated: false });
  }, []);

  const onGridReorder = useCallback(
    (next: { uri: string; clientKey: string }[]) => {
      replace(next);
      resetCarouselToFirst();
    },
    [replace, resetCarouselToFirst]
  );

  useEffect(() => {
    if (fields.length === 0) {
      setCarouselIndex(0);
      return;
    }
    if (carouselIndex >= fields.length) {
      setCarouselIndex(fields.length - 1);
      carouselRef.current?.scrollTo({
        x: contentWidth * (fields.length - 1),
        y: 0,
        animated: false,
      });
    }
  }, [carouselIndex, contentWidth, fields.length]);

  const onAppendImage = useCallback(async () => {
    if (fields.length >= MAX_RECIPE_IMAGES) return;
    const uri = await pickImageFromLibrary();
    if (uri) {
      append(
        { uri, clientKey: newRecipeImageClientKey() },
        { shouldFocus: false }
      );
    }
  }, [append, fields.length]);

  useEffect(() => {
    if (fields.length > 0 && errors.recipeImageUris) {
      clearErrors("recipeImageUris");
    }
  }, [clearErrors, errors.recipeImageUris, fields.length]);

  const removeByClientKey = useCallback(
    (clientKey: string) => {
      const idx = fields.findIndex((f) => f.clientKey === clientKey);
      if (idx >= 0) remove(idx);
    },
    [fields, remove]
  );

  const onCarouselMomentumScrollEnd = useCallback(
    (contentOffsetX: number, slideCount: number) => {
      const idx = Math.round(contentOffsetX / contentWidth);
      setCarouselIndex(Math.min(Math.max(idx, 0), Math.max(slideCount - 1, 0)));
    },
    [contentWidth]
  );

  const imagesError = errors.recipeImageUris?.message as string | undefined;

  return {
    contentWidth,
    previewWidth,
    previewImages,
    imagesError,
    fields,
    photoModels,
    carouselRef,
    carouselIndex,
    gridDragging,
    setGridDragging,
    onGridReorder,
    onAppendImage,
    removeByClientKey,
    onCarouselMomentumScrollEnd,
    gridGap: RECIPE_IMAGES_GRID_GAP,
  };
}
