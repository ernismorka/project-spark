import { components } from "@spark/game-core";
import type { Session } from "@spark/shared";
const padExit = { id: "START", x: 0, z: 27 };
const controllerApproach = { ...components[3], x: 0, z: -17 };

export function objectiveTarget(step: Session["step"]) {
  return step === 0
    ? padExit
    : step === 1
      ? components[0]
      : step === 2
        ? components[1]
        : step === 3
          ? controllerApproach
          : components[4];
}
export function targetBearing(dx: number, dz: number, yaw: number) {
  return Math.atan2(dx, -dz) + yaw;
}
