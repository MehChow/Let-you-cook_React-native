import {
  CIRCUMFERENCE,
  RADIUS,
  RING_SIZE,
  SEGMENT_EASING,
  STROKE_WIDTH,
} from "@/features/add-recipe/components/calories/calorieRing.constants";
import { useEffect } from "react";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface AnimatedRingSegmentProps {
  color: string;
  ratio: number;
  startRatio: number;
}

export function AnimatedRingSegment({
  color,
  ratio,
  startRatio,
}: AnimatedRingSegmentProps) {
  const ratioValue = useSharedValue(0);
  const startValue = useSharedValue(0);

  useEffect(() => {
    ratioValue.value = withTiming(ratio, {
      duration: 1500,
      easing: SEGMENT_EASING,
    });
    startValue.value = withTiming(startRatio, {
      duration: 1500,
      easing: SEGMENT_EASING,
    });
  }, [ratio, ratioValue, startRatio, startValue]);

  const animatedProps = useAnimatedProps(() => {
    const safeRatio = Math.max(ratioValue.value, 0);
    return {
      opacity: safeRatio > 0 ? 1 : 0,
      strokeDasharray: `${Math.max(safeRatio * CIRCUMFERENCE, 0.0001)} ${CIRCUMFERENCE}`,
      strokeDashoffset: -startValue.value * CIRCUMFERENCE,
    };
  });

  return (
    <AnimatedCircle
      cx={RING_SIZE / 2}
      cy={RING_SIZE / 2}
      r={RADIUS}
      stroke={color}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      fill="none"
      animatedProps={animatedProps}
    />
  );
}
