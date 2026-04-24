import * as React from "react";
import { View } from "react-native";
import {
  Gesture,
  GestureDetector,
  type GestureTouchEvent,
} from "react-native-gesture-handler";
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
  lastValueRef.current = value;

  const leftPx = useSharedValue(0);
  const rightPx = useSharedValue(0);

  const pxToValue = React.useCallback(
    (px: number) => {
      const w = widthRef.current;
      if (!w || max === min) return min;
      const ratio = clamp(px / w, 0, 1);
      const raw = min + ratio * (max - min);
      const stepped = roundToStep(raw, step);
      return clamp(stepped, min, max);
    },
    [max, min, step]
  );

  const valueToPx = React.useCallback(
    (v: number) => {
      const w = widthRef.current;
      if (!w || max === min) return 0;
      const ratio = (clamp(v, min, max) - min) / (max - min);
      return ratio * w;
    },
    [max, min]
  );

  const syncFromValue = React.useCallback(() => {
    const w = widthRef.current;
    if (!w) return;
    leftPx.value = valueToPx(value[0]);
    rightPx.value = valueToPx(value[1]);
  }, [leftPx, rightPx, value, valueToPx]);

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

  const minGapValue = Math.max(minGap, step);

  const onLeftDrag = React.useCallback(
    (e: GestureTouchEvent, startPx: number) => {
      const w = widthRef.current;
      if (!w) return;
      const nextPx = clamp(startPx + e.translationX, 0, rightPx.value);
      const nextVal = pxToValue(nextPx);
      const maxAllowed = lastValueRef.current[1] - minGapValue;
      const clampedVal = clamp(nextVal, min, maxAllowed);
      const finalPx = valueToPx(clampedVal);
      leftPx.value = finalPx;
      runOnJS(emitChange)([clampedVal, lastValueRef.current[1]]);
    },
    [emitChange, leftPx, min, minGapValue, pxToValue, rightPx, valueToPx]
  );

  const onRightDrag = React.useCallback(
    (e: GestureTouchEvent, startPx: number) => {
      const w = widthRef.current;
      if (!w) return;
      const nextPx = clamp(startPx + e.translationX, leftPx.value, w);
      const nextVal = pxToValue(nextPx);
      const minAllowed = lastValueRef.current[0] + minGapValue;
      const clampedVal = clamp(nextVal, minAllowed, max);
      const finalPx = valueToPx(clampedVal);
      rightPx.value = finalPx;
      runOnJS(emitChange)([lastValueRef.current[0], clampedVal]);
    },
    [emitChange, leftPx, max, minGapValue, pxToValue, rightPx, valueToPx]
  );

  const leftStart = useSharedValue(0);
  const rightStart = useSharedValue(0);

  const leftGesture = React.useMemo(() => {
    return Gesture.Pan()
      .hitSlop({ top: 14, bottom: 14, left: 18, right: 18 })
      .onBegin(() => {
        leftStart.value = leftPx.value;
      })
      .onUpdate((e) => {
        runOnJS(onLeftDrag)(e, leftStart.value);
      });
  }, [leftPx, leftStart, onLeftDrag]);

  const rightGesture = React.useMemo(() => {
    return Gesture.Pan()
      .hitSlop({ top: 14, bottom: 14, left: 18, right: 18 })
      .onBegin(() => {
        rightStart.value = rightPx.value;
      })
      .onUpdate((e) => {
        runOnJS(onRightDrag)(e, rightStart.value);
      });
  }, [onRightDrag, rightPx, rightStart]);

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
        widthRef.current = e.nativeEvent.layout.width;
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

