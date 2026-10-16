import type { Session, ExplorationCommand } from "@spark/shared";
import type { FollowCamera } from "./camera";
export const controls = {
  forward: "KeyW",
  back: "KeyS",
  left: "KeyA",
  right: "KeyD",
  run: "ShiftLeft",
  jump: "Space",
  interact: "KeyE",
  scan: "KeyF",
  pause: "Escape",
};
export function bindInput(
  canvas: HTMLCanvasElement,
  camera: FollowCamera,
  get: () => Session,
  dispatch: (command: ExplorationCommand) => void,
  target: () => string | undefined,
) {
  const keys = new Set<string>();
  let jump = false;
  let dragging = false;
  let disposed = false;
  const clear = () => {
    keys.clear();
    jump = false;
    dragging = false;
  };
  const release = () => {
    clear();
    if (document.pointerLockElement === canvas) document.exitPointerLock();
  };
  const lock = () => {
    if (get().phase === "playing" && !disposed) {
      canvas.focus({ preventScroll: true });
      canvas.requestPointerLock?.()?.catch(() => {
        /* Drag-to-orbit remains available when the browser denies lock. */
      });
    }
  };
  const keydown = (e: KeyboardEvent) => {
    if (e.code === controls.pause) {
      if (get().phase === "inspecting") dispatch({ type: "close-inspection" });
      else if (get().phase === "playing") dispatch({ type: "pause" });
      release();
      return;
    }
    if (
      get().phase !== "playing" ||
      (e.target instanceof HTMLElement &&
        ["BUTTON", "SELECT", "INPUT"].includes(e.target.tagName))
    )
      return;
    if ([...Object.values(controls), "ShiftRight"].includes(e.code)) {
      e.preventDefault();
      keys.add(e.code);
    }
    if (!e.repeat && e.code === controls.jump) jump = true;
    const id = target();
    if (
      !e.repeat &&
      id &&
      (e.code === controls.interact || e.code === controls.scan)
    ) {
      dispatch({
        type: e.code === controls.scan ? "scan" : "interact",
        target: id,
      });
      release();
    }
  };
  const keyup = (e: KeyboardEvent) => keys.delete(e.code);
  const down = () => {
    if (get().phase === "playing") {
      dragging = true;
      lock();
    }
  };
  const up = () => {
    dragging = false;
  };
  const mouse = (e: MouseEvent) => {
    if (
      get().phase === "playing" &&
      (document.pointerLockElement === canvas || dragging)
    )
      camera.orbit(e.movementX, e.movementY);
  };
  const wheel = (e: WheelEvent) => {
    if (get().phase === "playing") {
      e.preventDefault();
      camera.wheel(e.deltaY);
    }
  };
  const change = () => {
    if (!document.pointerLockElement && get().phase === "playing") {
      clear();
      dispatch({ type: "pause" });
    }
  };
  const blur = () => {
    if (get().phase === "playing") dispatch({ type: "pause" });
    release();
  };
  window.addEventListener("keydown", keydown);
  window.addEventListener("keyup", keyup);
  window.addEventListener("blur", blur);
  document.addEventListener("pointerlockchange", change);
  canvas.addEventListener("mousedown", down);
  window.addEventListener("mouseup", up);
  window.addEventListener("mousemove", mouse);
  canvas.addEventListener("wheel", wheel, { passive: false });
  return {
    release,
    lock,
    step: () => {
      const x =
          Number(keys.has(controls.right)) - Number(keys.has(controls.left)),
        z =
          Number(keys.has(controls.back)) - Number(keys.has(controls.forward));
      const c = Math.cos(camera.yaw),
        s = Math.sin(camera.yaw);
      const result: ExplorationCommand = {
        type: "step",
        x: Math.max(-1, Math.min(1, x * c + z * s)),
        z: Math.max(-1, Math.min(1, -x * s + z * c)),
        run: keys.has(controls.run) || keys.has("ShiftRight"),
        jump,
      };
      jump = false;
      return result;
    },
    dispose: () => {
      disposed = true;
      release();
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", blur);
      document.removeEventListener("pointerlockchange", change);
      canvas.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mousemove", mouse);
      canvas.removeEventListener("wheel", wheel);
    },
  };
}
