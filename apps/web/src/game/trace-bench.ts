import * as pc from "playcanvas";
import {
  fieldPatch,
  jumperTray,
  traceEnds,
  tracePast,
  tracePowered,
  traceRoute,
  type TraceDifficulty,
  type TraceRepair,
  type TraceStage,
} from "@spark/game-core";
import type { Geometry } from "./geometry";
import type { Workshop } from "./workshop-art";
import type { TraceAim } from "./trace-view";

export function buildTraceBench(
  g: Geometry,
  workshop: Workshop,
  root: pc.Entity,
) {
  const board = new pc.Entity("trace repair site");
  board.setLocalPosition(fieldPatch.x, 0, fieldPatch.z);
  root.addChild(board);
  const work = new pc.Entity("trace work area");
  board.addChild(work);
  const { shape, palette: p } = g;
  const fixed = (
    type: "box" | "sphere" | "cylinder" | "cone",
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    material: pc.StandardMaterial,
    parent = board,
  ) => shape(type, [x, y, z], [w, h, d], material, parent);

  const pads = traceEnds.map(({ x, z }) => {
    fixed("cylinder", x, 0.077, z, 0.51, 0.086, 0.51, p.chip);
    return fixed("cylinder", x, 0.119, z, 0.412, 0.06, 0.412, p.edge);
  });
  const terminalLights = traceEnds.map(({ z }, i) =>
    fixed("box", i ? 0.53 : -0.53, 0.119, z, 0.2, 0.055, 0.08, p.solderHeat),
  );
  const jump = (index: number) => {
    const a = traceRoute[index];
    const b = traceRoute[index + 1];
    const d = Math.hypot(b.x - a.x, b.z - a.z);
    const direction = new pc.Vec3(b.x - a.x, 0, b.z - a.z).normalize();
    const coatingOffset = index === 0 ? 0.053 : -0.053;
    const y = 0.182;
    const wire = fixed(
      "cylinder",
      (a.x + b.x) / 2 + coatingOffset * direction.x,
      y,
      (a.z + b.z) / 2 + coatingOffset * direction.z,
      0.104,
      d - 0.106,
      0.104,
      p.blue,
    );
    wire.setLocalRotation(
      new pc.Quat().setFromDirections(pc.Vec3.UP, direction),
    );
    const pad = index === 0 ? a : b;
    const tailOffset = index === 0 ? 0.065 : -0.065;
    const bare = fixed(
      "cylinder",
      pad.x + direction.x * tailOffset,
      y,
      pad.z + direction.z * tailOffset,
      0.062,
      0.14,
      0.062,
      p.copper,
    );
    bare.setLocalRotation(wire.getLocalRotation());
    return { wire, bare };
  };
  const jumper = [jump(0), jump(1)];
  const corner = fixed(
    "sphere",
    traceRoute[1].x,
    0.182,
    traceRoute[1].z,
    0.106,
    0.106,
    0.106,
    p.blue,
  );
  const joints = traceEnds.map(({ x, z }) =>
    fixed("sphere", x, 0.163, z, 0.255, 0.105, 0.255, p.silver),
  );
  const finish = traceEnds.map(({ x, z }) =>
    fixed("cylinder", x, 0.153, z, 0.462, 0.08, 0.462, p.traceSeal),
  );

  fixed("box", jumperTray.x, 0.12, jumperTray.z, 0.58, 0.2, 0.78, p.chip, work);
  fixed(
    "box",
    jumperTray.x,
    0.224,
    jumperTray.z,
    0.46,
    0.042,
    0.652,
    p.visor,
    work,
  );
  const stock = fixed(
    "cylinder",
    jumperTray.x,
    0.263,
    jumperTray.z,
    0.085,
    0.49,
    0.085,
    p.blue,
    work,
  );
  stock.setLocalEulerAngles(90, 0, 0);
  const stockEnds = [-0.245, 0.245].map((z) => {
    const part = fixed(
      "cylinder",
      jumperTray.x,
      0.263,
      jumperTray.z + z,
      0.053,
      0.13,
      0.053,
      p.copper,
      work,
    );
    part.setLocalEulerAngles(90, 0, 0);
    return part;
  });
  const guides = [traceEnds[0], traceEnds[1], traceRoute[1], jumperTray].map(
    ({ x, z }) =>
      fixed("cylinder", x, 0.065, z, 0.625, 0.037, 0.625, p.suit, work),
  );
  const routeGuide = fixed(
    "cylinder",
    traceRoute[1].x,
    0.108,
    traceRoute[1].z,
    0.274,
    0.055,
    0.274,
    p.visor,
    work,
  );
  for (const side of [-1, 1]) {
    fixed("box", side * 1.46, 0.06, 0, 0.038, 0.034, 1.92, p.ink, work);
    for (const z of [-0.95, 0.95])
      fixed("box", side * 1.29, 0.06, z, 0.37, 0.034, 0.038, p.ink, work);
  }
  for (const [x, z] of [
    [-0.95, -0.69],
    [0.95, 0.69],
  ]) {
    fixed("box", x * 0.78, 0.052, z, 0.51, 0.018, 0.065, p.traceSeal, work);
    fixed("cylinder", x, 0.065, z, 0.18, 0.032, 0.18, p.copper, work);
    fixed("cylinder", x, 0.086, z, 0.096, 0.015, 0.096, p.chip, work);
  }
  const continuityPins = traceEnds.map(({ x, z }, i) => {
    const pin = workshop(
      i ? "blackProbe" : "redProbe",
      work,
      x + 0.36,
      0.34,
      z + 0.31,
    );
    pin.lookAt(fieldPatch.x + x, 0.157, fieldPatch.z + z);
    return pin;
  });

  const tool = new pc.Entity("held trace tool");
  work.addChild(tool);
  const iron = workshop("solderPen", tool, 0, 0, 0.63);
  const glove = workshop("glove", tool, 0.13, 0.11, 0.48);
  glove.setLocalEulerAngles(90, 0, -8);
  const handle = fixed(
    "box",
    0.11,
    0.045,
    0.33,
    0.173,
    0.135,
    0.53,
    p.visor,
    tool,
  );
  handle.setLocalEulerAngles(0, 18, -10);
  const grip = fixed(
    "box",
    0.16,
    0.081,
    0.46,
    0.186,
    0.159,
    0.26,
    p.suit,
    tool,
  );
  grip.setLocalEulerAngles(0, 18, -10);
  const tip = fixed(
    "box",
    0.025,
    0.014,
    0.069,
    0.095,
    0.05,
    0.205,
    p.silver,
    tool,
  );
  tip.setLocalEulerAngles(0, 18, -10);
  const swab = fixed(
    "sphere",
    0,
    0.026,
    0.025,
    0.14,
    0.088,
    0.18,
    p.white,
    tool,
  );
  const nozzle = fixed(
    "cone",
    0,
    0.034,
    0.055,
    0.12,
    0.19,
    0.12,
    p.traceFlux,
    tool,
  );
  nozzle.setLocalEulerAngles(-90, 0, 0);
  const cutters = [-1, 1].map((side) => {
    const jaw = fixed(
      "box",
      side * 0.063,
      0.033,
      0.06,
      0.045,
      0.075,
      0.2,
      p.silver,
      tool,
    );
    jaw.setLocalEulerAngles(0, side * 23, 0);
    return jaw;
  });
  const cursor = fixed(
    "cylinder",
    0,
    0.155,
    0,
    0.073,
    0.033,
    0.073,
    p.healthy,
    work,
  );
  const sparks = Array.from({ length: 5 }, () =>
    fixed("box", 0, 0, 0, 0.019, 0.06, 0.02, p.solderSpark, work),
  );
  const sparkOffsets = [-0.28, -0.12, 0.03, 0.19, 0.33];
  board.enabled = false;
  let previous: TraceRepair | undefined;
  let previousOpen = false;
  let previousDifficulty: TraceDifficulty | undefined;
  let previousVerified = false;
  let toolHeight = 0.3;
  let lastTime = 0;
  const material = (entity: pc.Entity, mat: pc.StandardMaterial) => {
    if (entity.render!.material !== mat) entity.render!.material = mat;
  };
  return (
    repair: TraceRepair | undefined,
    open: boolean,
    verified: boolean,
    aim: TraceAim,
    difficulty: TraceDifficulty,
    reduced: boolean,
    time: number,
  ) => {
    board.enabled = !!repair;
    if (!repair) return;
    const { stage, ends, route, contact, heat } = repair;
    const thermal = stage === "tin" || stage === "solder";
    const takingContact =
      !tracePowered(stage) &&
      !["continuity", "restore", "done"].includes(stage);
    if (
      repair !== previous ||
      open !== previousOpen ||
      difficulty !== previousDifficulty ||
      verified !== previousVerified
    ) {
      previous = repair;
      previousOpen = open;
      previousDifficulty = difficulty;
      previousVerified = verified;
      work.enabled = open;
      tool.enabled = takingContact;
      cursor.enabled = takingContact;
      iron.enabled = thermal;
      handle.enabled = grip.enabled = !thermal;
      tip.enabled = stage === "expose";
      swab.enabled = stage === "clean" || stage === "rinse";
      nozzle.enabled = stage === "flux" || stage === "seal";
      for (const jaw of cutters)
        jaw.enabled = stage === "prepare" || stage === "route";
      const completed = (checkpoint: TraceStage, index: number) =>
        tracePast(stage, checkpoint) || (stage === checkpoint && ends[index]);
      for (let i = 0; i < pads.length; i++) {
        const sealed = completed("seal", i);
        finish[i].enabled = sealed;
        material(finish[i], verified ? p.healthy : p.traceSeal);
        const heated = thermal && contact === i && heat >= 35;
        material(
          pads[i],
          heated
            ? p.solderHeat
            : completed("tin", i)
              ? p.silver
              : completed("flux", i)
                ? p.traceFlux
                : completed("clean", i)
                  ? p.copper
                  : completed("expose", i)
                    ? p.brown
                    : p.edge,
        );
        joints[i].enabled =
          completed("solder", i) || (stage === "solder" && heated);
        material(
          joints[i],
          heated
            ? p.solderHeat
            : completed("rinse", i)
              ? p.silver
              : p.traceFlux,
        );
        material(
          terminalLights[i],
          tracePowered(stage) ? p.solderHeat : p.chip,
        );
        continuityPins[i].enabled =
          stage === "continuity" || repair.message === "continuity-pass";
      }
      for (let i = 0; i < jumper.length; i++) {
        jumper[i].wire.enabled = route > i + 1;
        jumper[i].bare.enabled = route > i * 2;
      }
      corner.enabled = route >= 2;
      stock.enabled = stage === "prepare";
      stockEnds.forEach((part) => {
        part.enabled = stage === "prepare" && repair.ticks > 0;
      });
      routeGuide.enabled = stage === "route";
      for (let i = 0; i < guides.length; i++) {
        guides[i].enabled =
          difficulty === "apprentice" &&
          takingContact &&
          (stage === "prepare"
            ? i === 3
            : stage === "route"
              ? i === [0, 2, 1][route]
              : i < 2 && !ends[i]);
      }
    }
    if (!open) return;
    const { x, z, engaged } = aim;
    const dt = Math.min(Math.max(time - lastTime, 0), 0.1);
    lastTime = time;
    const rest = engaged ? 0.162 : 0.3;
    toolHeight = reduced
      ? rest
      : pc.math.lerp(toolHeight, rest, 1 - Math.exp(-28 * dt));
    cursor.setLocalPosition(x, 0.155, z);
    tool.setLocalPosition(x, toolHeight, z);
    material(
      cursor,
      repair.message === "hot" || repair.message === "miss"
        ? p.red
        : engaged
          ? p.healthy
          : p.suit,
    );
    for (let i = 0; i < sparks.length; i++) {
      const spark = sparks[i];
      spark.enabled =
        !reduced && thermal && engaged && contact !== null && heat >= 42;
      if (!spark.enabled) continue;
      const t = (time * 4 + i * 0.37) % 1;
      spark.setLocalPosition(
        x + sparkOffsets[i] * t,
        0.17 + Math.sin(t * Math.PI) * 0.29,
        z + (0.3 - i * 0.11) * t,
      );
      spark.setEulerAngles(19 * i, 13, i * 38);
    }
  };
}
