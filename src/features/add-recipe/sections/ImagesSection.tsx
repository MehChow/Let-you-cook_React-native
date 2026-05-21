import { RecipeImagesEditView } from "@/features/add-recipe/components/images/RecipeImagesEditView";
import { RecipeImagesPreview } from "@/features/add-recipe/components/images/RecipeImagesPreview";
import { useRecipeImagesField } from "@/features/add-recipe/hooks/useRecipeImagesField";

export interface ImagesSectionProps {
  mode: "edit" | "preview";
}

export function ImagesSection({ mode }: ImagesSectionProps) {
  const {
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
    gridGap,
  } = useRecipeImagesField();

  if (mode === "preview") {
    const uris = (previewImages ?? [])
      .map((r: { uri?: string }) => r.uri)
      .filter((uri: string | undefined): uri is string => Boolean(uri));

    return (
      <RecipeImagesPreview
        uris={uris}
        width={previewWidth}
        gridGap={gridGap}
      />
    );
  }

  return (
    <>
      <RecipeImagesEditView
        carouselIndex={carouselIndex}
        carouselRef={carouselRef}
        contentWidth={contentWidth}
        fields={fields}
        gridDragging={gridDragging}
        gridGap={gridGap}
        imagesError={imagesError}
        onAppendImage={onAppendImage}
        onCarouselMomentumScrollEnd={onCarouselMomentumScrollEnd}
        onGridReorder={onGridReorder}
        photoModels={photoModels}
        removeByClientKey={removeByClientKey}
        setGridDragging={setGridDragging}
      />
      {alertDialog}
    </>
  );
}
