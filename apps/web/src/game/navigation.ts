import { components } from "@spark/game-core";
import type { Session } from "@spark/shared";
export function objectiveTarget(step: Session["step"]) {
  return step === 0
    ? { id: "START", x: 0, z: 27 }
    : step === 1
      ? components[0]
      : step === 2
        ? components[1]
        : step === 3
          ? { id: "U1", x: 0, z: -17 }
          : components[4];
}
export function targetBearing(dx: number, dz: number, yaw: number) {
  return Math.atan2(dx, -dz) + yaw;
}
