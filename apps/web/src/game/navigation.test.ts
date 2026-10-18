import { expect, it } from "vitest";
import { cameraDirection } from "./input";
import { objectiveTarget, targetBearing } from "./navigation";
it("keeps diagonal direction and speed consistent at every camera yaw", () => {
  for (const yaw of [0, Math.PI / 8, Math.PI / 4, Math.PI / 2, -2]) {
    const d = cameraDirection(1, -1, yaw);
    expect(Math.hypot(d.x, d.z)).toBeCloseTo(1);
    expect(d.x).toBeCloseTo((Math.cos(yaw) - Math.sin(yaw)) / Math.sqrt(2));
    expect(d.z).toBeCloseTo((-Math.sin(yaw) - Math.cos(yaw)) / Math.sqrt(2));
    expect(cameraDirection(0, 0, yaw)).toEqual({ x: 0, z: 0 });
    expect(
      Math.hypot(...Object.values(cameraDirection(0, -1, yaw))),
    ).toBeCloseTo(1);
  }
});
it("uses one objective destination and camera-relative target bearings", () => {
  expect([0, 1, 2, 3, 4, 5].map((step) => objectiveTarget(step).id)).toEqual([
    "START",
    "R1",
    "C1",
    "U1",
    "T1",
    "T1",
  ]);
  expect(targetBearing(0, -5, 0)).toBe(0);
  expect(targetBearing(5, 0, 0)).toBeCloseTo(Math.PI / 2);
  expect(targetBearing(0, -5, Math.PI)).toBeCloseTo(Math.PI);
});
