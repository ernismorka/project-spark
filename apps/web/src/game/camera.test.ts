import { expect, it } from "vitest";
import { Entity } from "playcanvas";
import { FollowCamera, cameraSettings, clipDistance } from "./camera";
it("clips camera segments before solid boxes and permits unobstructed views", () => {
  expect(
    clipDistance({ x: 0, y: 1, z: -18 }, { x: 0, y: 1, z: -30 }),
  ).toBeLessThan(0.5);
  expect(clipDistance({ x: 20, y: 3, z: 30 }, { x: 20, y: 6, z: 38 })).toBe(1);
});
it("clamps pitch/zoom, smooths follow and snaps after checkpoint recovery", () => {
  const entity = new Entity();
  const camera = new FollowCamera(entity);
  camera.orbit(20, 100000);
  expect(camera.pitch).toBe(cameraSettings.maxPitch);
  camera.orbit(0, -100000);
  expect(camera.pitch).toBe(cameraSettings.minPitch);
  camera.wheel(1e6);
  expect(camera.zoom).toBe(cameraSettings.maxZoom);
  camera.wheel(-1e6);
  expect(camera.zoom).toBe(cameraSettings.minZoom);
  camera.update({ x: 20, y: 0, z: 20 }, 1);
  const initial = entity.getPosition().clone();
  camera.update({ x: 21, y: 0, z: 20 }, 1 / 60);
  expect(entity.getPosition().x - initial.x).toBeGreaterThan(0);
  expect(entity.getPosition().x - initial.x).toBeLessThan(1);
  camera.update({ x: 0, y: 0, z: 32 }, 1 / 60);
  expect(Math.abs(entity.getPosition().x)).toBeLessThan(4);
});
