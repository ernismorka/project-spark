import type { BoardComponent, Solid } from "@spark/shared";
export const world = {
  halfWidth: 24,
  halfDepth: 40,
  spawn: { x: 0, y: 0, z: 32 },
} as const;
export const components: readonly BoardComponent[] = [
  {
    id: "R1",
    kind: "resistor",
    x: -7,
    z: 20,
    inspectable: true,
    scannable: true,
  },
  {
    id: "C1",
    kind: "capacitor",
    x: 7,
    z: 5,
    inspectable: true,
    scannable: true,
  },
  { id: "D1", kind: "led", x: -8, z: -8, inspectable: true, scannable: true },
  {
    id: "U1",
    kind: "microcontroller",
    x: 0,
    z: -25,
    inspectable: true,
    scannable: true,
    deviceRef: "controller-main",
  },
  {
    id: "T1",
    kind: "terminal",
    x: 0,
    z: -18,
    inspectable: true,
    scannable: false,
    deviceRef: "controller-main",
  },
];
export const solids: readonly Solid[] = [
  { id: "R1", x: -7, z: 20, width: 4, depth: 2, height: 1.4 },
  { id: "C1", x: 7, z: 5, width: 3, depth: 3, height: 5 },
  { id: "D1", x: -8, z: -8, width: 2.5, depth: 2.5, height: 2.6 },
  { id: "U1", x: 0, z: -25, width: 9, depth: 7, height: 3 },
  { id: "T1", x: 0, z: -18, width: 2.4, depth: 1.4, height: 1.5 },
  { id: "step-a", x: 15, z: -12, width: 4, depth: 6, height: 0.55 },
  { id: "step-b", x: 19, z: -12, width: 4, depth: 6, height: 1.1 },
];
export const movement = {
  step: 1 / 60,
  walk: 4.2,
  run: 7,
  acceleration: 20,
  gravity: 19,
  jump: 7.2,
  radius: 0.38,
  height: 1.7,
  interactionRange: 5,
} as const;
export function horizontalDistance(
  a: { x: number; z: number },
  b: { x: number; z: number },
) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}
