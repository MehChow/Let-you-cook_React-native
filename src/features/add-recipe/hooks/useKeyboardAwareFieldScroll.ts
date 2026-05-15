import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import { Keyboard, Platform, ScrollView, TextInput } from "react-native";

type MeasurableScrollView = ScrollView & {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void;
};

export interface UseKeyboardAwareFieldScrollResult {
  scrollRef: RefObject<ScrollView | null>;
  onScroll: (offsetY: number) => void;
  onInputFocus: (input: TextInput | null) => void;
}

export function useKeyboardAwareFieldScroll(keyboardHeight?: number): UseKeyboardAwareFieldScrollResult {
  const scrollRef = useRef<ScrollView | null>(null);
  const focusedInputRef = useRef<TextInput | null>(null);
  const scrollOffsetRef = useRef(0);

  const ensureFocusedVisible = useCallback(
    (kbHeight?: number) => {
      if (Platform.OS !== "android") return;

      const focusedInput = focusedInputRef.current;
      const scrollView = scrollRef.current as MeasurableScrollView | null;
      if (!focusedInput || !scrollView) return;

      focusedInput.measureInWindow((_x, inputY, _w, inputHeight) => {
        scrollView.measureInWindow(
          (_sx: number, scrollY: number, _sw: number, scrollHeight: number) => {
            const margin = 12;
            const keyboardInset = Math.max(0, kbHeight ?? keyboardHeight ?? 0);
            const visibleBottom = scrollY + scrollHeight - keyboardInset - margin;
            const inputBottom = inputY + inputHeight;

            if (inputBottom <= visibleBottom) return;

            const nextOffset =
              scrollOffsetRef.current + (inputBottom - visibleBottom);
            scrollRef.current?.scrollTo({ y: nextOffset, animated: true });
          },
        );
      });
    },
    [keyboardHeight],
  );

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const sub = Keyboard.addListener("keyboardDidShow", (e) => {
      const kb = e.endCoordinates?.height ?? keyboardHeight ?? 0;
      if (kb <= 0) return;

      setTimeout(() => {
        ensureFocusedVisible(kb);
      }, 50);
    });

    return () => sub.remove();
  }, [ensureFocusedVisible, keyboardHeight]);

  const onInputFocus = useCallback(
    (input: TextInput | null) => {
      if (!input) return;
      focusedInputRef.current = input;
      setTimeout(() => ensureFocusedVisible(), 0);
    },
    [ensureFocusedVisible],
  );

  const onScroll = useCallback((offsetY: number) => {
    scrollOffsetRef.current = offsetY;
  }, []);

  return {
    scrollRef,
    onScroll,
    onInputFocus,
  };
}
