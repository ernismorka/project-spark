import * as pc from "playcanvas";
import {
  nearbyComponents,
  movement,
  world,
  type FieldState,
} from "@spark/game-core";
import type { ExplorationCommand, Language, Session } from "@spark/shared";
import { createGeometry } from "./game/geometry";
import { buildFieldFixtures, buildWorld } from "./game/world";
import { buildEngineer } from "./game/engineer";
import { loadWorkshop } from "./game/workshop-art";
import { buildJournalPages } from "./game/journal-pages";
import { buildWorkshopDecals } from "./game/workshop-decals";
import {
  advanceJournal,
  easePose,
  journalKeys,
  type JournalStage,
} from "./game/engineer-motion";
import { FollowCamera } from "./game/camera";
import { bindInput } from "./game/input";
import { objectiveTarget } from "./game/navigation";
import type { Difficulty } from "./difficulty";
import {
  acceptedFieldMotion,
  type FieldMotion,
} from "./game/interaction-motion";
import { buildFieldEffects } from "./game/field-effects";
export interface SceneBridge {
  get: () => Session;
  dispatch: (command: ExplorationCommand, publish?: boolean) => void;
  publish: () => void;
  target: () => string | undefined;
  activated?: () => boolean;
  field: () => FieldState | undefined;
  fieldUse: () => boolean;
  journalToggle: () => boolean;
  journalStage: (stage: JournalStage) => void;
  language: () => Language;
  difficulty: () => Difficulty;
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
  let pages: ReturnType<typeof buildJournalPages> | undefined;
  let decals: ReturnType<typeof buildWorkshopDecals> | undefined;
  let input: ReturnType<typeof bindInput> | undefined;
  let observer: ResizeObserver | undefined;
  let update: ((dt: number) => void) | undefined;
  let disposed = false;
  let batchGroupId: number | undefined;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    input?.dispose();
    observer?.disconnect();
    if (update) app?.off("update", update);
    if (batchGroupId !== undefined) app?.batcher?.removeGroup(batchGroupId);
    pages?.dispose();
    decals?.dispose();
    geometry?.dispose();
    app?.destroy();
    if (!app) device.destroy();
  };
  try {
    const options = new pc.AppOptions();
    options.graphicsDevice = device;
    options.batchManager = pc.BatchManager;
    options.resourceHandlers = [pc.ContainerHandler];
    options.componentSystems = [
      pc.RenderComponentSystem,
      pc.CameraComponentSystem,
      pc.LightComponentSystem,
    ];
    app = new pc.AppBase(canvas);
    app.init(options);
    const renderer = device as pc.WebglGraphicsDevice;
    const software = /swiftshader|llvmpipe|softpipe|software rasterizer/i.test(
      String(renderer.unmaskedRenderer),
    );
    // Software adapters shade on the CPU. Keep the accessible journal at CSS
    // resolution while reducing the amount of 3D work on these adapters.
    device.maxPixelRatio = Math.min(
      window.devicePixelRatio,
      software ? 0.5 : 1.5,
    );
    app.scene.ambientLight = software
      ? new pc.Color(0.55, 0.64, 0.77)
      : new pc.Color(0.44, 0.53, 0.66);
    const air = new pc.Color().fromString("#627e98");
    app.scene.fog.type = pc.FOG_LINEAR;
    app.scene.fog.color.copy(air);
    app.scene.fog.start = 19;
    app.scene.fog.end = 108;
    batchGroupId = app.batcher!.addGroup("static-board", false, 64)!.id;
    geometry = createGeometry(app.root, device, batchGroupId);
    const workshop = await loadWorkshop(
      app,
      signal,
      software ? geometry.palette : undefined,
    );
    const pcb = buildWorld(geometry, workshop, app.root, batchGroupId);
    decals = buildWorkshopDecals(device, app.root, batchGroupId);
    app.batcher!.generate([batchGroupId]);
    const player = buildEngineer(workshop, app.root);
    pages = buildJournalPages(device, player.left, player.right);
    const fieldFixtures = buildFieldFixtures(geometry, app.root, player.body);
    const animateField = buildFieldEffects(geometry, app.root, player.hand);
    const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
    const cameraEntity = new pc.Entity("follow-camera");
    cameraEntity.addComponent("camera", {
      clearColor: air,
      fov: 58,
      nearClip: 0.08,
      farClip: 180,
    });
    app.root.addChild(cameraEntity);
    const camera = new FollowCamera(cameraEntity);
    const light = new pc.Entity();
    light.addComponent("light", {
      type: "directional",
      color: new pc.Color(1, 0.91, 0.81),
      intensity: software ? 1.42 : 1.66,
    });
    light.setEulerAngles(52, 38, 0);
    app.root.addChild(light);
    if (!software) {
      const fill = new pc.Entity("cool bounce");
      fill.addComponent("light", {
        type: "directional",
        color: new pc.Color(0.63, 0.81, 1),
        intensity: 0.62,
      });
      fill.setEulerAngles(27, -139, 0);
      app.root.addChild(fill);
    }
    let journal = 0;
    let journalStage: JournalStage = "closed";
    canvas.dataset.journal = journalStage;
    input = bindInput(
      canvas,
      camera,
      bridge.get,
      bridge.dispatch,
      () => bridge.target() ?? nearbyComponents(bridge.get())[0]?.id,
      bridge.fieldUse,
      {
        locked: () => !!bridge.field()?.notebook || journal > 0,
        toggle: () => {
          if (journal > 0 && !bridge.field()?.notebook) return true;
          return bridge.journalToggle();
        },
      },
    );
    let accumulator = 0,
      time = 0,
      publishTime = 0,
      lastPhase = bridge.get().phase;
    let lastState: Session | undefined;
    let renderDirty = true;
    let lastActivated = false;
    let lastField: FieldState | undefined;
    let lastDifficulty: Difficulty | undefined;
    let lastLanguage: Language | undefined;
    let lastReduced = motionPreference.matches;
    let fieldMotion: FieldMotion | undefined;
    let motionTime = 0;
    update = (delta: number) => {
      const state = bridge.get();
      const activated = bridge.activated?.() ?? false;
      const field = bridge.field();
      const difficulty = bridge.difficulty();
      const language = bridge.language();
      const reduced = motionPreference.matches;
      const opening = !!field?.notebook;
      const visible = !canvas.closest("main[inert]") && !document.hidden;
      app!.autoRender =
        visible &&
        (state.phase === "playing" ||
          state !== lastState ||
          activated !== lastActivated ||
          field !== lastField ||
          difficulty !== lastDifficulty ||
          language !== lastLanguage ||
          reduced !== lastReduced ||
          journal !== Number(opening) ||
          renderDirty);
      if (!visible) {
        renderDirty = true;
        accumulator = 0;
        input!.release();
        return;
      }
      if (!app!.autoRender) return;
      renderDirty = false;
      lastState = state;
      lastActivated = activated;
      const started = acceptedFieldMotion(lastField, field);
      lastField = field;
      lastDifficulty = difficulty;
      lastLanguage = language;
      lastReduced = reduced;
      const dt = Math.min(delta, 0.1);
      time += dt;
      journal = advanceJournal(journal, opening, dt, reduced);
      const stage = opening
        ? journal === 1
          ? "open"
          : "opening"
        : journal > 0
          ? "closing"
          : "closed";
      if (stage !== journalStage) {
        journalStage = stage;
        canvas.dataset.journal = stage;
        bridge.journalStage(stage);
      }
      if (field && journal > 0) pages!.write(field, language, difficulty);
      if (started) {
        fieldMotion = started;
        motionTime = 0;
      } else motionTime += dt;
      if (
        state.phase !== "playing" ||
        journal > 0 ||
        motionTime >= (reduced ? 0.35 : 0.8)
      )
        fieldMotion = undefined;
      if (state.phase !== lastPhase) {
        input!.release();
        lastPhase = state.phase;
      }
      if (state.phase === "playing" && journal === 0) {
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
      decals!.follow(
        next.player.position.x,
        next.player.position.y,
        next.player.position.z,
      );
      const speed =
        journal > 0
          ? 0
          : Math.hypot(next.player.velocity.x, next.player.velocity.z);
      const reach =
        fieldMotion && !reduced && speed < 1.2
          ? Math.min(1, motionTime * 7, (0.8 - motionTime) * 5)
          : 0;
      const facing =
        reach > 0 && fieldMotion
          ? Math.atan2(
              fieldMotion.site.x - next.player.position.x,
              fieldMotion.site.z - next.player.position.z,
            )
          : next.player.facing;
      player.animate(
        dt,
        time,
        speed,
        next.player.grounded,
        facing,
        reach,
        journal,
        camera.yaw,
        reduced,
      );
      canvas.dataset.journalBook = String(player.book.enabled);
      animateField(fieldMotion, motionTime, reduced, reach);
      canvas.dataset.interactionMotion = fieldMotion?.kind ?? "idle";
      canvas.dataset.interactionTool = String(reach > 0.05);
      camera.update(
        next.player.position,
        dt,
        reduced,
        easePose((journal - journalKeys.camera) / (1 - journalKeys.camera)),
        canvas.clientWidth / Math.max(1, canvas.clientHeight),
      );
      const destination = objectiveTarget(next.step);
      pcb.marker.enabled =
        difficulty !== "engineer" && !field && next.phase !== "complete";
      canvas.dataset.probeHighlights = String(
        fieldFixtures(
          field,
          next.step === 5 && next.phase === "complete" && !next.diagnosis,
          difficulty,
          reach,
          journal > 0,
        ),
      );
      canvas.dataset.guidanceBeacon = String(pcb.marker.enabled);
      pcb.marker.setPosition(
        destination.x,
        4 + (reduced ? 0 : Math.sin(time * 2) * 0.2),
        destination.z,
      );
      canvas.dataset.playerX = next.player.position.x.toFixed(3);
      canvas.dataset.playerY = next.player.position.y.toFixed(3);
      canvas.dataset.playerZ = next.player.position.z.toFixed(3);
      canvas.dataset.cameraYaw = camera.yaw.toFixed(3);
      canvas.dataset.cameraZoom = camera.zoom.toFixed(2);
      const cameraPosition = cameraEntity.getPosition();
      canvas.dataset.cameraDistance = Math.hypot(
        cameraPosition.x - next.player.position.x,
        cameraPosition.y - next.player.position.y - 1.25,
        cameraPosition.z - next.player.position.z,
      ).toFixed(3);
      pcb.status(
        next.repair.r1 === "restored" ||
          field?.phase === "recheck" ||
          field?.phase === "verified",
        next.repair.completed || field?.phase === "verified",
        activated,
      );
      canvas.dataset.deviceStatus = activated ? "active" : "offline";
      canvas.dataset.circuitStatus =
        next.repair.completed || field?.phase === "verified"
          ? "verified"
          : field?.phase === "recheck"
            ? "restored"
            : next.repair.r1;
      canvas.dataset.phase = next.phase;
      canvas.dataset.missionStep = String(next.step);
      publishTime += dt;
      if (publishTime >= 0.1) {
        bridge.publish();
        publishTime = 0;
      }
    };
    const resize = () => {
      renderDirty = true;
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
