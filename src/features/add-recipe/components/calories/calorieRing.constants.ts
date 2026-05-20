import { Easing } from "react-native-reanimated";

export const RING_SIZE = 144;
export const STROKE_WIDTH = 9;
export const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
export const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
export const SEGMENT_EASING = Easing.out(Easing.exp);
