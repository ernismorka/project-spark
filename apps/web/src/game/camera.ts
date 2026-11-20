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
export const journalEyeHeight = 1.67;
export type ToolCamera = { site: { x: number; z: number }; blend: number };
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
  pitch = 0.47;
  zoom = 7.3;
  private displayedZoom = this.zoom;
  private target = new pc.Vec3();
  private initialized = false;
  private readonly desiredTarget = new pc.Vec3();
  private readonly offset = new pc.Vec3();
  private readonly desired = new pc.Vec3();
  private readonly overheadUp = new pc.Vec3();
  private readonly journalView = new pc.Vec3();
  private readonly journalTarget = new pc.Vec3();
  private readonly view = new pc.Vec3();
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
  update(
    position: Vec3,
    dt: number,
    reducedMotion = false,
    journal = 0,
    aspect = 1.7,
    tool?: ToolCamera,
  ) {
    this.displayedZoom +=
      (this.zoom - this.displayedZoom) *
      (reducedMotion ? 1 : 1 - Math.exp(-12 * dt));
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
      Math.sin(this.yaw) * Math.cos(this.pitch) * this.displayedZoom,
      Math.sin(this.pitch) * this.displayedZoom,
      Math.cos(this.yaw) * Math.cos(this.pitch) * this.displayedZoom,
    );
    const desired = this.desired.copy(this.target).add(offset);
    const fraction = clipDistance(this.target, desired);
    if (this.displayedZoom * fraction < 0.5) {
      // A nearby wall can leave no usable rear view. Use clear space overhead,
      // with a nonparallel up axis, rather than placing the camera at its target.
      desired
        .copy(this.target)
        .add(this.offset.set(0, Math.min(this.displayedZoom, 3), 0));
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
    if (this.entity.camera) {
      const pageFov = Math.max(
        61,
        2 * Math.atan(0.78 / Math.max(aspect, 0.4)) * pc.math.RAD_TO_DEG,
      );
      this.entity.camera.fov = pc.math.lerp(58, pageFov, journal);
    }
    if (journal === 0) {
      if (!tool || tool.blend <= 0) return;
      const { site, blend } = tool;
      this.journalTarget.set(
        (position.x + site.x) * 0.5,
        position.y + 0.67,
        (position.z + site.z) * 0.5,
      );
      this.journalView.set(site.x - position.x, 0, site.z - position.z);
      if (this.journalView.lengthSq() < 0.04)
        this.journalView.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      this.journalView.normalize();
      const x = this.journalView.x;
      const z = this.journalView.z;
      this.journalView.set(
        this.journalTarget.x + x * 2.45 + z * 1.65,
        position.y + 2.15,
        this.journalTarget.z + z * 2.45 - x * 1.65,
      );
      const clearance = clipDistance(this.journalTarget, this.journalView);
      if (clearance < 0.55)
        this.journalView.set(
          this.journalTarget.x + z * 2.2,
          position.y + 2.8,
          this.journalTarget.z - x * 2.2,
        );
      this.view.lerp(this.entity.getPosition(), this.journalView, blend);
      this.view.lerp(
        this.journalTarget,
        this.view,
        clipDistance(this.journalTarget, this.view),
      );
      this.journalTarget.lerp(this.target, this.journalTarget, blend);
      this.entity.setPosition(this.view);
      this.entity.lookAt(this.journalTarget);
      return;
    }
    const c = Math.cos(this.yaw);
    const s = Math.sin(this.yaw);
    this.journalTarget.set(
      position.x - 0.515 * s,
      position.y + 1.095,
      position.z - 0.515 * c,
    );
    this.journalView.set(
      position.x + 0.025 * s,
      position.y + journalEyeHeight,
      position.z + 0.025 * c,
    );
    this.view.lerp(this.entity.getPosition(), this.journalView, journal);
    this.view.lerp(
      desiredTarget,
      this.view,
      clipDistance(desiredTarget, this.view),
    );
    this.journalTarget.lerp(this.target, this.journalTarget, journal);
    this.entity.setPosition(this.view);
    this.entity.lookAt(this.journalTarget);
  }
}
