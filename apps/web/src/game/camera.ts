import * as pc from "playcanvas";
import { solids } from "@spark/game-core";
import type { Vec3 } from "@spark/shared";
export const cameraSettings = {
  sensitivity: 0.003,
  minPitch: 0.18,
  maxPitch: 1.15,
  minZoom: 3,
  maxZoom: 14,
  smoothing: 10,
};
export function clipDistance(from: Vec3, to: Vec3): number {
  const distance = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
  let fraction = 1;
  for (const s of solids) {
    let near = 0,
      far = 1;
    const min = {
      x: s.x - s.width / 2 - 0.3,
      y: -0.3,
      z: s.z - s.depth / 2 - 0.3,
    };
    const max = {
      x: s.x + s.width / 2 + 0.3,
      y: s.height + 0.3,
      z: s.z + s.depth / 2 + 0.3,
    };
    for (const axis of ["x", "y", "z"] as const) {
      const direction = to[axis] - from[axis];
      if (Math.abs(direction) < 1e-8) {
        if (from[axis] < min[axis] || from[axis] > max[axis]) {
          near = 2;
          break;
        }
      } else {
        const a = (min[axis] - from[axis]) / direction,
          b = (max[axis] - from[axis]) / direction;
        near = Math.max(near, Math.min(a, b));
        far = Math.min(far, Math.max(a, b));
      }
    }
    if (near <= far && near >= 0 && near <= 1)
      fraction = Math.min(
        fraction,
        Math.max(0, near - 0.05 / Math.max(distance, 0.05)),
      );
  }
  return fraction;
}
export class FollowCamera {
  yaw = 0;
  pitch = 0.48;
  zoom = 8;
  private target = new pc.Vec3();
  private initialized = false;
  private readonly desiredTarget = new pc.Vec3();
  private readonly offset = new pc.Vec3();
  private readonly desired = new pc.Vec3();
  private readonly overheadUp = new pc.Vec3();
  constructor(readonly entity: pc.Entity) {}
  orbit(x: number, y: number) {
    this.yaw -= x * cameraSettings.sensitivity;
    this.pitch = Math.max(
      cameraSettings.minPitch,
      Math.min(
        cameraSettings.maxPitch,
        this.pitch + y * cameraSettings.sensitivity,
      ),
    );
  }
  wheel(delta: number) {
    this.zoom = Math.max(
      cameraSettings.minZoom,
      Math.min(cameraSettings.maxZoom, this.zoom + delta * 0.01),
    );
  }
  update(position: Vec3, dt: number) {
    const desiredTarget = this.desiredTarget.set(
      position.x,
      position.y + 1.25,
      position.z,
    );
    if (!this.initialized || this.target.distance(desiredTarget) > 10) {
      this.target.copy(desiredTarget);
      this.initialized = true;
    }
    this.target.lerp(
      this.target,
      desiredTarget,
      1 - Math.exp(-cameraSettings.smoothing * dt),
    );
    // Do not let smoothed tracking cut through a component at corners.
    if (clipDistance(desiredTarget, this.target) < 1)
      this.target.copy(desiredTarget);
    const offset = this.offset.set(
      Math.sin(this.yaw) * Math.cos(this.pitch) * this.zoom,
      Math.sin(this.pitch) * this.zoom,
      Math.cos(this.yaw) * Math.cos(this.pitch) * this.zoom,
    );
    const desired = this.desired.copy(this.target).add(offset);
    const fraction = clipDistance(this.target, desired);
    if (this.zoom * fraction < 0.5) {
      // A nearby wall can leave no usable rear view. Use clear space overhead,
      // with a nonparallel up axis, rather than placing the camera at its target.
      desired
        .copy(this.target)
        .add(this.offset.set(0, Math.min(this.zoom, 3), 0));
      this.offset.mulScalar(clipDistance(this.target, desired));
      this.entity.setPosition(desired.copy(this.target).add(this.offset));
      this.entity.lookAt(
        this.target,
        this.overheadUp.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)),
      );
    } else {
      this.entity.setPosition(
        desired.copy(this.target).add(offset.mulScalar(fraction)),
      );
      this.entity.lookAt(this.target);
    }
  }
}
