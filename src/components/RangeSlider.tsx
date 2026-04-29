import * as React from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

type Range = readonly [number, number];

function clamp(n: number, min: number, max: number) {
  "worklet";
  return Math.max(min, Math.min(max, n));
}

function roundToStep(value: number, step: number) {
  "worklet";
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

function valueToPxWorklet(
  value: number,
  min: number,
  max: number,
  width: number
) {
  "worklet";
  if (!width || max === min) return 0;
  const ratio = (clamp(value, min, max) - min) / (max - min);
  return ratio * width;
}

function pxToValueWorklet(
  px: number,
  min: number,
  max: number,
  width: number,
  step: number
) {
  "worklet";
  if (!width || max === min) return min;
  const ratio = clamp(px / width, 0, 1);
  const raw = min + ratio * (max - min);
  const stepped = roundToStep(raw, step);
  return clamp(stepped, min, max);
}

type RangeSliderProps = {
  min: number;
  max: number;
  step: number;
  minGap?: number;
  value: Range;
  onChange: (next: Range) => void;

  /** Visual */
  trackHeight?: number;
  inactiveTrackColor?: string;
  activeTrackColor?: string;
  thumbSize?: number;
  thumbColor?: string;
  thumbBorderColor?: string;
  className?: string;
};

export default function RangeSlider({
  min,
  max,
  step,
  minGap = step,
  value,
  onChange,
  trackHeight = 6,
  inactiveTrackColor = "#cbd5e1",
  activeTrackColor = "#314943", // sage-700
  thumbSize = 18,
  thumbColor = "#ffffff",
  thumbBorderColor = "#314943",
  className,
}: RangeSliderProps) {
  const widthRef = React.useRef(0);
  const lastValueRef = React.useRef<Range>(value);
  const isDraggingRef = React.useRef(false);
  const pendingValueRef = React.useRef<Range | null>(null);
  const rafRef = React.useRef<number | null>(null);

  const leftPx = useSharedValue(0);
  const rightPx = useSharedValue(0);
  const leftValue = useSharedValue(value[0]);
  const rightValue = useSharedValue(value[1]);
  const widthSv = useSharedValue(0);
  const minSv = useSharedValue(min);
  const maxSv = useSharedValue(max);
  const stepSv = useSharedValue(step);
  const minGapSv = useSharedValue(Math.max(minGap, step));
  const lastEmittedLeft = useSharedValue(value[0]);
  const lastEmittedRight = useSharedValue(value[1]);
  const isDraggingSv = useSharedValue(false);

  const setDraggingState = React.useCallback((next: boolean) => {
    isDraggingRef.current = next;
  }, []);

  React.useEffect(() => {
    minSv.value = min;
    maxSv.value = max;
    stepSv.value = step;
    minGapSv.value = Math.max(minGap, step);
  }, [max, maxSv, min, minGap, minGapSv, minSv, step, stepSv]);

  const syncFromValue = React.useCallback(() => {
    if (isDraggingRef.current) return;
    const w = widthRef.current;
    if (!w) return;
    const minV = min;
    const maxV = max;
    const nextLeft = clamp(value[0], minV, maxV);
    const nextRight = clamp(value[1], minV, maxV);
    leftValue.value = nextLeft;
    rightValue.value = nextRight;
    lastEmittedLeft.value = nextLeft;
    lastEmittedRight.value = nextRight;
    lastValueRef.current = [nextLeft, nextRight];
    leftPx.value = valueToPxWorklet(nextLeft, minV, maxV, w);
    rightPx.value = valueToPxWorklet(nextRight, minV, maxV, w);
  }, [
    isDraggingRef,
    leftPx,
    leftValue,
    max,
    min,
    rightPx,
    rightValue,
    value,
    lastEmittedLeft,
    lastEmittedRight,
  ]);

  React.useEffect(() => {
    syncFromValue();
  }, [syncFromValue]);

  const emitChange = React.useCallback(
    (next: Range) => {
      const prev = lastValueRef.current;
      if (prev[0] === next[0] && prev[1] === next[1]) return;
      lastValueRef.current = next;
      onChange(next);
    },
    [onChange]
  );

  const flushQueuedEmit = React.useCallback(() => {
    rafRef.current = null;
    const next = pendingValueRef.current;
    if (!next) return;
    pendingValueRef.current = null;
    emitChange(next);
  }, [emitChange]);

  const queueEmitChange = React.useCallback(
    (next: Range) => {
      pendingValueRef.current = next;
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(flushQueuedEmit);
    },
    [flushQueuedEmit]
  );

  const emitChangeImmediate = React.useCallback(
    (next: Range) => {
      pendingValueRef.current = null;
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      emitChange(next);
    },
    [emitChange]
  );

  React.useEffect(() => {
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const leftStart = useSharedValue(0);
  const rightStart = useSharedValue(0);

  const leftGesture = React.useMemo(() => {
    return Gesture.Pan()
      .hitSlop({ top: 14, bottom: 14, left: 18, right: 18 })
      .onBegin(() => {
        isDraggingSv.value = true;
        runOnJS(setDraggingState)(true);
        leftStart.value = leftPx.value;
      })
      .onUpdate((e) => {
        const w = widthSv.value;
        if (!w) return;
        const nextPx = clamp(
          leftStart.value + e.translationX,
          0,
          rightPx.value
        );
        const nextVal = pxToValueWorklet(
          nextPx,
          minSv.value,
          maxSv.value,
          w,
          stepSv.value
        );
        const maxAllowed = rightValue.value - minGapSv.value;
        const clampedVal = clamp(nextVal, minSv.value, maxAllowed);
        leftValue.value = clampedVal;
        leftPx.value = valueToPxWorklet(
          clampedVal,
          minSv.value,
          maxSv.value,
          w
        );
        if (
          clampedVal !== lastEmittedLeft.value ||
          rightValue.value !== lastEmittedRight.value
        ) {
          lastEmittedLeft.value = clampedVal;
          lastEmittedRight.value = rightValue.value;
          runOnJS(queueEmitChange)([clampedVal, rightValue.value]);
        }
      })
      .onFinalize(() => {
        isDraggingSv.value = false;
        runOnJS(setDraggingState)(false);
        runOnJS(emitChangeImmediate)([leftValue.value, rightValue.value]);
      });
  }, [
    emitChangeImmediate,
    isDraggingSv,
    leftPx,
    leftStart,
    leftValue,
    maxSv,
    minGapSv,
    minSv,
    rightPx,
    rightValue,
    stepSv,
    widthSv,
    lastEmittedLeft,
    lastEmittedRight,
    queueEmitChange,
    setDraggingState,
  ]);

  const rightGesture = React.useMemo(() => {
    return Gesture.Pan()
      .hitSlop({ top: 14, bottom: 14, left: 18, right: 18 })
      .onBegin(() => {
        isDraggingSv.value = true;
        runOnJS(setDraggingState)(true);
        rightStart.value = rightPx.value;
      })
      .onUpdate((e) => {
        const w = widthSv.value;
        if (!w) return;
        const nextPx = clamp(
          rightStart.value + e.translationX,
          leftPx.value,
          w
        );
        const nextVal = pxToValueWorklet(
          nextPx,
          minSv.value,
          maxSv.value,
          w,
          stepSv.value
        );
        const minAllowed = leftValue.value + minGapSv.value;
        const clampedVal = clamp(nextVal, minAllowed, maxSv.value);
        rightValue.value = clampedVal;
        rightPx.value = valueToPxWorklet(
          clampedVal,
          minSv.value,
          maxSv.value,
          w
        );
        if (
          leftValue.value !== lastEmittedLeft.value ||
          clampedVal !== lastEmittedRight.value
        ) {
          lastEmittedLeft.value = leftValue.value;
          lastEmittedRight.value = clampedVal;
          runOnJS(queueEmitChange)([leftValue.value, clampedVal]);
        }
      })
      .onFinalize(() => {
        isDraggingSv.value = false;
        runOnJS(setDraggingState)(false);
        runOnJS(emitChangeImmediate)([leftValue.value, rightValue.value]);
      });
  }, [
    emitChangeImmediate,
    isDraggingSv,
    leftPx,
    leftValue,
    maxSv,
    minGapSv,
    minSv,
    rightPx,
    rightStart,
    rightValue,
    stepSv,
    widthSv,
    lastEmittedLeft,
    lastEmittedRight,
    queueEmitChange,
    setDraggingState,
  ]);

  const activeStyle = useAnimatedStyle(() => {
    const left = Math.min(leftPx.value, rightPx.value);
    const width = Math.max(0, Math.abs(rightPx.value - leftPx.value));
    return {
      left,
      width,
    };
  });

  const hitSize = Math.max(thumbSize + 18, 36);

  const leftThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftPx.value - hitSize / 2 }],
  }));

  const rightThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rightPx.value - hitSize / 2 }],
  }));

  return (
    <View
      className={className}
      onLayout={(e) => {
        const width = e.nativeEvent.layout.width;
        widthRef.current = width;
        widthSv.value = width;
        syncFromValue();
      }}
      style={{
        height: Math.max(thumbSize, trackHeight) + 10,
        justifyContent: "center",
      }}
    >
      {/* Track */}
      <View
        style={{
          height: trackHeight,
          borderRadius: trackHeight / 2,
          backgroundColor: inactiveTrackColor,
        }}
      />

      {/* Active range */}
      <Animated.View
        style={[
          {
            position: "absolute",
            height: trackHeight,
            borderRadius: trackHeight / 2,
            backgroundColor: activeTrackColor,
          },
          activeStyle,
        ]}
      />

      {/* Thumbs (separate gesture regions so both are draggable) */}
      <GestureDetector gesture={leftGesture}>
        <Animated.View
          style={[
            {
              position: "absolute",
              width: hitSize,
              height: hitSize,
              borderRadius: hitSize / 2,
              alignItems: "center",
              justifyContent: "center",
            },
            leftThumbStyle,
          ]}
        >
          <View
            pointerEvents="none"
            style={{
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              backgroundColor: thumbColor,
              borderWidth: 1,
              borderColor: thumbBorderColor,
              elevation: 2,
            }}
          />
        </Animated.View>
      </GestureDetector>

      <GestureDetector gesture={rightGesture}>
        <Animated.View
          style={[
            {
              position: "absolute",
              width: hitSize,
              height: hitSize,
              borderRadius: hitSize / 2,
              alignItems: "center",
              justifyContent: "center",
            },
            rightThumbStyle,
          ]}
        >
          <View
            pointerEvents="none"
            style={{
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              backgroundColor: thumbColor,
              borderWidth: 1,
              borderColor: thumbBorderColor,
              elevation: 2,
            }}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
