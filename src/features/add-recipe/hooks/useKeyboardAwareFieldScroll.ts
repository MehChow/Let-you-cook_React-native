import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import { Keyboard, Platform, ScrollView, TextInput } from "react-native";

type KeyboardAwareScrollable = {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void;
  scrollTo: (options: { x?: number; y?: number; animated?: boolean }) => void;
  scrollResponderScrollNativeHandleToKeyboard?: (
    nodeHandle: unknown,
    additionalOffset?: number,
    preventNegativeScrollOffset?: boolean,
  ) => void;
  getScrollResponder?: () => {
    scrollResponderScrollNativeHandleToKeyboard?: (
      nodeHandle: unknown,
      additionalOffset?: number,
      preventNegativeScrollOffset?: boolean,
    ) => void;
  } | null;
};

export interface UseKeyboardAwareFieldScrollResult<T> {
  scrollRef: RefObject<T | null>;
  onScroll: (offsetY: number) => void;
  onInputFocus: (input: TextInput | null) => void;
}

export function useKeyboardAwareFieldScroll<T = ScrollView>(
  keyboardHeight?: number,
): UseKeyboardAwareFieldScrollResult<T> {
  const scrollRef = useRef<T | null>(null);
  const focusedInputRef = useRef<TextInput | null>(null);
  const scrollOffsetRef = useRef(0);
  const keyboardVisibleRef = useRef(false);

  const scrollFocusedIntoView = useCallback(
    (kbHeight?: number) => {
      const focusedInput = focusedInputRef.current;
      const scrollView = scrollRef.current as KeyboardAwareScrollable | null;
      if (!focusedInput || !scrollView) {
        return false;
      }

      const responder =
        scrollView.scrollResponderScrollNativeHandleToKeyboard ??
        scrollView.getScrollResponder?.()
          ?.scrollResponderScrollNativeHandleToKeyboard;

      if (!responder) {
        return false;
      }

      const additionalOffset = Math.max(0, kbHeight ?? keyboardHeight ?? 0) + 12;
      responder(focusedInput, additionalOffset, true);
      return true;
    },
    [keyboardHeight],
  );

  const ensureFocusedVisible = useCallback(
    (kbHeight?: number) => {
      if (Platform.OS !== "android") return;

      const focusedInput = focusedInputRef.current;
      const scrollView = scrollRef.current as KeyboardAwareScrollable | null;
      if (!focusedInput || !scrollView) {
        return;
      }

      if (scrollFocusedIntoView(kbHeight)) {
        return;
      }

      focusedInput.measureInWindow((_x, inputY, _w, inputHeight) => {
        scrollView.measureInWindow(
          (_sx: number, scrollY: number, _sw: number, scrollHeight: number) => {
            const margin = 12;
            const keyboardInset = Math.max(0, kbHeight ?? keyboardHeight ?? 0);
            const visibleBottom = scrollY + scrollHeight - keyboardInset - margin;
            const inputBottom = inputY + inputHeight;
            const delta = inputBottom - visibleBottom;

            if (inputBottom <= visibleBottom) {
              return;
            }

            const nextOffset = scrollOffsetRef.current + delta;
            scrollOffsetRef.current = nextOffset;
            (scrollRef.current as KeyboardAwareScrollable | null)?.scrollTo({
              y: nextOffset,
              animated: true,
            });
          },
        );
      });
    },
    [keyboardHeight, scrollFocusedIntoView],
  );

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const sub = Keyboard.addListener("keyboardDidShow", (e) => {
      keyboardVisibleRef.current = true;
      const kb = e.endCoordinates?.height ?? keyboardHeight ?? 0;
      if (kb <= 0) return;

      setTimeout(() => {
        ensureFocusedVisible(kb);
      }, 50);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      keyboardVisibleRef.current = false;
    });

    return () => {
      sub.remove();
      hideSub.remove();
    };
  }, [ensureFocusedVisible, keyboardHeight]);

  const onInputFocus = useCallback(
    (input: TextInput | null) => {
      if (!input) return;
      focusedInputRef.current = input;
      if (!keyboardVisibleRef.current) return;

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
