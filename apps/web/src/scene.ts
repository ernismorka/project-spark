import * as pc from "playcanvas";
import {
  components,
  nearbyComponents,
  movement,
  world,
} from "@spark/game-core";
import type { ExplorationCommand, Session } from "@spark/shared";
import { createGeometry } from "./game/geometry";
import { buildEngineer, buildWorld } from "./game/world";
import { FollowCamera } from "./game/camera";
import { bindInput } from "./game/input";
export interface SceneBridge {
  get: () => Session;
  dispatch: (command: ExplorationCommand, publish?: boolean) => void;
  publish: () => void;
  target: () => string | undefined;
}
export async function mountScene(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
  bridge: SceneBridge,
): Promise<() => void> {
  const device = await pc.createGraphicsDevice(canvas, {
    deviceTypes: [pc.DEVICETYPE_WEBGL2],
    antialias: true,
    alpha: false,
  });
  if (signal.aborted) {
    device.destroy();
    return () => {};
  }
  let app: pc.AppBase | undefined;
  let geometry: ReturnType<typeof createGeometry> | undefined;
  let input: ReturnType<typeof bindInput> | undefined;
  let observer: ResizeObserver | undefined;
  let update: ((dt: number) => void) | undefined;
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    input?.dispose();
    observer?.disconnect();
    if (update) app?.off("update", update);
    geometry?.dispose();
    app?.destroy();
    if (!app) device.destroy();
  };
  try {
    const options = new pc.AppOptions();
    options.graphicsDevice = device;
    options.componentSystems = [
      pc.RenderComponentSystem,
      pc.CameraComponentSystem,
      pc.LightComponentSystem,
    ];
    app = new pc.AppBase(canvas);
    app.init(options);
    app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio, 1.5);
    app.scene.ambientLight = new pc.Color(0.7, 0.8, 0.85);
    geometry = createGeometry(app.root);
    const pcb = buildWorld(geometry);
    const player = buildEngineer(geometry, app.root);
    const cameraEntity = new pc.Entity("follow-camera");
    cameraEntity.addComponent("camera", {
      clearColor: new pc.Color().fromString("#102b36"),
      fov: 58,
      nearClip: 0.08,
      farClip: 180,
    });
    app.root.addChild(cameraEntity);
    const camera = new FollowCamera(cameraEntity);
    const light = new pc.Entity();
    light.addComponent("light", {
      type: "directional",
      color: new pc.Color(1, 0.94, 0.83),
      intensity: 1.3,
    });
    light.setEulerAngles(45, 30, 0);
    app.root.addChild(light);
    input = bindInput(
      canvas,
      camera,
      bridge.get,
      bridge.dispatch,
      () => bridge.target() ?? nearbyComponents(bridge.get())[0]?.id,
    );
    let accumulator = 0,
      time = 0,
      publishTime = 0,
      lastPhase = bridge.get().phase;
    update = (delta: number) => {
      const dt = Math.min(delta, 0.1);
      time += dt;
      const state = bridge.get();
      if (state.phase !== lastPhase) {
        input!.release();
        lastPhase = state.phase;
      }
      if (state.phase === "playing") {
        accumulator += dt;
        while (accumulator >= movement.step) {
          bridge.dispatch(input!.step(), false);
          accumulator -= movement.step;
        }
      } else accumulator = 0;
      const next = bridge.get();
      player.entity.setPosition(
        next.player.position.x,
        next.player.position.y,
        next.player.position.z,
      );
      player.entity.setEulerAngles(0, (next.player.facing * 180) / Math.PI, 0);
      player.animate(
        time,
        Math.hypot(next.player.velocity.x, next.player.velocity.z),
        next.player.grounded,
      );
      camera.update(next.player.position, dt);
      const destination =
        next.step === 0
          ? { x: 0, z: 27 }
          : next.step === 1
            ? components[0]
            : next.step === 2
              ? components[1]
              : next.step === 3
                ? { x: 0, z: -17 }
                : components[4];
      pcb.marker.enabled = next.phase !== "complete";
      pcb.marker.setPosition(
        destination.x,
        4 + Math.sin(time * 2) * 0.2,
        destination.z,
      );
      canvas.dataset.playerX = next.player.position.x.toFixed(3);
      canvas.dataset.playerY = next.player.position.y.toFixed(3);
      canvas.dataset.playerZ = next.player.position.z.toFixed(3);
      canvas.dataset.cameraYaw = camera.yaw.toFixed(3);
      canvas.dataset.cameraZoom = camera.zoom.toFixed(2);
      canvas.dataset.phase = next.phase;
      canvas.dataset.missionStep = String(next.step);
      publishTime += dt;
      if (publishTime >= 0.1) {
        bridge.publish();
        publishTime = 0;
      }
    };
    const resize = () => {
      const parent = canvas.parentElement!;
      app!.resizeCanvas(
        Math.max(1, parent.clientWidth),
        Math.max(1, parent.clientHeight),
      );
    };
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement!);
    resize();
    camera.update(world.spawn, 1);
    app.on("update", update);
    app.start();
    return dispose;
  } catch (error) {
    dispose();
    throw error;
  }
}
