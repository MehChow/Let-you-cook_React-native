import { MAX_RECIPE_IMAGES } from "@/features/add-recipe/constants";
import { useImagePicker } from "@/features/add-recipe/hooks/useImagePicker";
import type { AddRecipeFormValues } from "@/features/add-recipe/schema";
import { useEffect, useRef, useState } from "react";
import {
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";
import { ScrollView, useWindowDimensions } from "react-native";

/** Matches `px-4` wizard horizontal inset for the images step. */
export const RECIPE_IMAGES_EDIT_CONTENT_GUTTER = 32;
/** Preview cards use `mx-4` + `p-4`, so image content sits 32px in from each edge. */
export const RECIPE_IMAGES_PREVIEW_CONTENT_GUTTER = 64;

export const RECIPE_IMAGES_GRID_GAP = 12;

export interface RecipeImageFieldValue {
  clientKey: string;
  uri: string;
}

function newRecipeImageClientKey(): string {
  const c = globalThis.crypto;
  if (c && "randomUUID" in c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function useRecipeImagesField() {
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = screenWidth - RECIPE_IMAGES_EDIT_CONTENT_GUTTER;
  const previewWidth = screenWidth - RECIPE_IMAGES_PREVIEW_CONTENT_GUTTER;

  const { control, clearErrors } = useFormContext<AddRecipeFormValues>();
  const { errors } = useFormState({ control });
  const previewImages = useWatch({ control, name: "recipeImageUris" });
  const { pickImage, alertDialog } = useImagePicker();

  const carouselRef = useRef<ScrollView>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [gridDragging, setGridDragging] = useState(false);

  const {
    fields: recipeImageFields,
    append,
    remove,
    replace,
  } = useFieldArray({
    control,
    name: "recipeImageUris",
  });
  const fields = recipeImageFields as ((typeof recipeImageFields)[number] &
    RecipeImageFieldValue)[];
  const photoModels = fields.map((field) => ({
    uri: field.uri,
    clientKey: field.clientKey,
  }));
  const resetCarouselToFirst = () => {
    setCarouselIndex(0);
    carouselRef.current?.scrollTo({ x: 0, y: 0, animated: false });
  };

  const onGridReorder = (next: { uri: string; clientKey: string }[]) => {
    replace(next);
    resetCarouselToFirst();
  };

  const onAppendImage = async () => {
    if (fields.length >= MAX_RECIPE_IMAGES) return;
    const uri = await pickImage("recipe");
    if (uri) {
      append(
        { uri, clientKey: newRecipeImageClientKey() },
        { shouldFocus: false },
      );
    }
  };

  useEffect(() => {
    if (fields.length > 0 && errors.recipeImageUris) {
      clearErrors("recipeImageUris");
    }
  }, [clearErrors, errors.recipeImageUris, fields.length]);

  const removeByClientKey = (clientKey: string) => {
    const idx = fields.findIndex((field) => field.clientKey === clientKey);
    if (idx < 0) return;
    remove(idx);
    const nextCount = fields.length - 1;
    const nextIndex = nextCount <= 0 ? 0 : Math.min(carouselIndex, nextCount - 1);
    setCarouselIndex(nextIndex);
    carouselRef.current?.scrollTo({
      x: contentWidth * nextIndex,
      y: 0,
      animated: false,
    });
  };

  const onCarouselMomentumScrollEnd = (
    contentOffsetX: number,
    slideCount: number,
  ) => {
    const idx = Math.round(contentOffsetX / contentWidth);
    setCarouselIndex(Math.min(Math.max(idx, 0), Math.max(slideCount - 1, 0)));
  };

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
    alertDialog,
    onGridReorder,
    onAppendImage,
    removeByClientKey,
    onCarouselMomentumScrollEnd,
    gridGap: RECIPE_IMAGES_GRID_GAP,
  };
}
