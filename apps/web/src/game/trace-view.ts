export interface TraceAim {
  x: number;
  z: number;
  engaged: boolean;
}

export function traceViewHeight(aspect: number) {
  return Math.max(3.5, 3.7 / Math.max(aspect, 0.25));
}
