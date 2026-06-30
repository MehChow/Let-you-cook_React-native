import { useState } from "react";

export interface CookingStepDragField {
  id: string;
}

export function useCookingStepsDragDisplay(fields: CookingStepDragField[]) {
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState<number | null>(null);
  const displayIndexById = new Map<string, number>();

  fields.forEach((field, index) => {
    let displayIndex = index;

    if (
      dragFromIndex !== null &&
      placeholderIndex !== null &&
      dragFromIndex !== placeholderIndex
    ) {
      if (index === dragFromIndex) {
        displayIndex = placeholderIndex;
      } else if (dragFromIndex < placeholderIndex) {
        if (index > dragFromIndex && index <= placeholderIndex) {
          displayIndex = index - 1;
        }
      } else if (index >= placeholderIndex && index < dragFromIndex) {
        displayIndex = index + 1;
      }
    }

    displayIndexById.set(field.id, displayIndex);
  });

  const resetDragState = () => {
    setDragFromIndex(null);
    setPlaceholderIndex(null);
  };

  const beginDrag = (index: number) => {
    setDragFromIndex(index);
    setPlaceholderIndex(index);
  };

  return {
    beginDrag,
    displayIndexById,
    resetDragState,
    setPlaceholderIndex,
  };
}
