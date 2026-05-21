import {
  SEGMENT_EASING,
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
  circumference: number;
  radius: number;
  ringSize: number;
  strokeWidth: number;
}

export function AnimatedRingSegment({
  color,
  ratio,
  startRatio,
  circumference,
  radius,
  ringSize,
  strokeWidth,
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
      strokeDasharray: `${Math.max(safeRatio * circumference, 0.0001)} ${circumference}`,
      strokeDashoffset: -startValue.value * circumference,
    };
  });

  return (
    <AnimatedCircle
      cx={ringSize / 2}
      cy={ringSize / 2}
      r={radius}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
      animatedProps={animatedProps}
    />
  );
}
