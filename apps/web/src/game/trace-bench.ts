import * as pc from "playcanvas";
import {
  fieldPatch,
  jumperTray,
  traceEnds,
  tracePast,
  tracePowered,
  traceRoute,
  type FieldState,
  type TraceDifficulty,
  type TraceStage,
} from "@spark/game-core";
import { buildEngineer } from "./engineer";
import { easePose } from "./engineer-motion";
import type { Geometry } from "./geometry";
import {
  buildToolbox,
  buildTraceEquipment,
  placeSpan,
} from "./trace-equipment";
import {
  overTraceToolbox,
  traceContactY,
  traceScale,
  traceToolbox,
  type TraceAim,
} from "./trace-view";
import type { Workshop } from "./workshop-art";

export function buildTraceBench(
  g: Geometry,
  workshop: Workshop,
  root: pc.Entity,
) {
  const { shape, solid, palette: p } = g;
  const board = new pc.Entity("localized feed bus");
  board.setLocalPosition(fieldPatch.x, 0, fieldPatch.z);
  root.addChild(board);
  const work = new pc.Entity("trace work area");
  board.addChild(work);

  shape("box", [0, 0.035, 0], [5.15, 0.053, 18.1], p.busMask, board);
  const north = [
    [-0.14, -10],
    [0.14, -10],
    [2.42, -8.05],
    [2.42, -2.1],
    [1.8, -2.48],
    [1.05, -2.15],
    [0.53, -2.76],
    [-0.33, -2.48],
    [-1.17, -2.83],
    [-1.61, -2.38],
    [-2.42, -2.63],
    [-2.42, -8.05],
  ] as const;
  const south = [
    [-2.42, 2.78],
    [-1.73, 2.57],
    [-1.16, 2.99],
    [-0.53, 2.56],
    [0.22, 2.9],
    [0.96, 2.44],
    [1.52, 2.8],
    [2.42, 2.32],
    [2.42, 8.05],
    [0.14, 10],
    [-0.14, 10],
    [-2.42, 8.05],
  ] as const;
  solid(board, north, 0.065, 0.195, [0, -5.4], p.busCopper, p.busEdge);
  solid(board, south, 0.065, 0.195, [0, 5.4], p.busCopper, p.busEdge);
  for (const [x, z, scale] of [
    [-1.17, -2.15, 0.42],
    [0.62, -1.92, 0.42],
    [-0.72, 2.26, 0.7],
    [1.72, 1.92, 0.62],
    [0.43, 0.79, 0.31],
  ]) {
    const fragment = shape(
      "box",
      [x, 0.08, z],
      [scale, 0.067, scale * 0.44],
      p.oxide,
      board,
    );
    fragment.setLocalEulerAngles(0, z * 27, -11);
  }
  for (const side of [-1, 1]) {
    for (const z of [-4.65, 4.7, -7.5, 7.9]) {
      const x = side * 2.93;
      shape("cylinder", [x, 0.086, z], [0.58, 0.064, 0.58], p.busCopper, board);
      shape("cylinder", [x, 0.124, z], [0.32, 0.021, 0.32], p.chip, board);
    }
    for (const z of [-5.7, 5.8]) {
      shape("box", [side * 3.54, 0.052, z], [0.11, 0.024, 1.32], p.ink, work);
      shape(
        "box",
        [side * 3.89, 0.052, z + 0.61],
        [0.76, 0.024, 0.11],
        p.ink,
        work,
      );
    }
  }
  // A chip capacitor beside the exposed feed gives the engineer a second scale reference.
  const bypass = new pc.Entity("C7 ceramic bypass capacitor");
  work.addChild(bypass);
  bypass.setLocalPosition(5.65, 0, -4.4);
  bypass.setLocalEulerAngles(0, 90, 0);
  shape("box", [0, 0.07, 0], [5.5, 0.09, 3.12], p.busCopper, bypass);
  shape("box", [0, 1.03, 0], [3.56, 1.8, 2.55], p.oxide, bypass);
  shape("box", [0, 1.96, 0], [3.1, 0.16, 2.16], p.brown, bypass);
  for (const side of [-1, 1]) {
    shape("box", [side * 1.93, 0.98, 0], [0.62, 1.85, 2.61], p.silver, bypass);
    shape(
      "box",
      [side * 2.21, 0.21, 0],
      [0.82, 0.29, 2.67],
      p.traceFlux,
      bypass,
    );
  }
  const toolbox = buildToolbox(g, board);

  const pads = traceEnds.map(({ z }) => {
    const at = z * traceScale;
    const surface = shape(
      "box",
      [0, 0.228, at],
      [2.24, 0.064, 1.64],
      p.oxide,
      board,
    );
    const compound = shape(
      "box",
      [0, 0.263, at],
      [1.89, 0.033, 1.34],
      p.traceFlux,
      board,
    );
    const joint = shape(
      "sphere",
      [0, 0.32, at],
      [1.1, 0.19, 0.72],
      p.silver,
      board,
    );
    const seal = shape(
      "sphere",
      [0, 0.342, at],
      [2.18, 0.43, 1.55],
      p.traceSeal,
      board,
    );
    const weld = shape(
      "sphere",
      [0, 0.293, at],
      [0.44, 0.116, 0.42],
      p.solderHeat,
      work,
    );
    const powerMark = shape(
      "box",
      [2.05, 0.229, at],
      [0.31, 0.056, 0.31],
      p.solderHeat,
      work,
    );
    return { surface, compound, joint, seal, weld, powerMark };
  });

  const cylinder = (material: pc.StandardMaterial, parent = board) =>
    shape("cylinder", [0, 0, 0], [1, 1, 1], material, parent);
  const axis = new pc.Vec3();
  const rotation = new pc.Quat();
  const wireHeight = 0.39;
  const anchors = traceRoute.map(
    ({ x, z }) => new pc.Vec3(x * traceScale, wireHeight, z * traceScale),
  );
  const cable = anchors.slice(0, 2).map((anchor, i) => {
    const end = anchors[i + 1];
    const wire = cylinder(p.blue);
    const tip = cylinder(p.busCopper);
    const trim = new pc.Vec3().lerp(anchor, end, i === 0 ? 0.113 : 0.887);
    placeSpan(
      wire,
      i === 0 ? trim : anchor,
      i === 0 ? end : trim,
      0.34,
      axis,
      rotation,
    );
    placeSpan(
      tip,
      i === 0 ? anchor : trim,
      i === 0 ? trim : end,
      0.237,
      axis,
      rotation,
    );
    return { wire, tip };
  });
  const bend = anchors[1];
  const elbow = shape(
    "sphere",
    [bend.x, bend.y, bend.z],
    [0.345, 0.345, 0.345],
    p.blue,
    board,
  );
  const liveCable = cylinder(p.blue, work);
  const trayX = jumperTray.x * traceScale;
  const trayZ = jumperTray.z * traceScale;
  shape("box", [trayX, 0.136, trayZ], [2.12, 0.23, 1.43], p.chip, work);
  shape("box", [trayX, 0.262, trayZ], [1.87, 0.067, 1.16], p.visor, work);
  const spool = new pc.Entity("jumper stock");
  spool.setLocalPosition(trayX, 0.337, trayZ);
  work.addChild(spool);
  shape(
    "cylinder",
    [0, 0, 0],
    [0.33, 1.45, 0.33],
    p.blue,
    spool,
  ).setLocalEulerAngles(0, 0, 90);
  const strip = [-1, 1].map((side) =>
    shape(
      "cylinder",
      [side * 0.81, 0, 0],
      [0.24, 0.34, 0.24],
      p.busCopper,
      spool,
    ),
  );
  for (const end of strip) end.setLocalEulerAngles(0, 0, 90);
  const guideNub = shape(
    "cylinder",
    [bend.x, 0.133, bend.z],
    [0.63, 0.21, 0.63],
    p.visor,
    work,
  );
  const hints = [...traceEnds, traceRoute[1], jumperTray].map(
    ({ x, z }, index) =>
      shape(
        "cylinder",
        [x * traceScale, index < 2 ? 0.207 : 0.08, z * traceScale],
        [2.45, 0.035, 2.1],
        p.suit,
        work,
      ),
  );
  const probes = traceEnds.map(({ z }, i) => {
    const along = z * traceScale;
    const probe = workshop(
      i ? "blackProbe" : "redProbe",
      work,
      1.18,
      0.54,
      along + 0.55,
    );
    probe.lookAt(fieldPatch.x, 0.34, fieldPatch.z + along);
    probe.setLocalScale(1.65, 1.65, 1.65);
    return probe;
  });

  const actor = buildEngineer(workshop, work);
  const equipment = buildTraceEquipment(g, actor.body);
  const cursor = shape("cylinder", [0, 0, 0], [0.17, 0.05, 0.17], p.suit, work);
  const particles = Array.from({ length: 8 }, () =>
    shape("box", [0, 0, 0], [0.041, 0.14, 0.042], p.solderSpark, work),
  );
  const left = new pc.Vec3();
  const right = new pc.Vec3();
  const pointer = new pc.Vec3();
  const standing = new pc.Vec3(traceToolbox.x + 0.54, 0, traceToolbox.z + 1.45);
  const home = standing.clone();
  const tilt = -0.82;
  const first = new pc.Vec3();
  board.enabled = false;
  let previous: FieldState | undefined;
  let previousDifficulty: TraceDifficulty | undefined;
  let lid = 0;
  let toolLift = 0.15;
  let previousGear: string | undefined;
  let pickUp = 1;
  function material(entity: pc.Entity, mat: pc.StandardMaterial) {
    if (entity.render!.material !== mat) entity.render!.material = mat;
  }
  return (
    field: FieldState | undefined,
    aim: TraceAim,
    difficulty: TraceDifficulty,
    reduced: boolean,
    dt: number,
    time: number,
  ) => {
    const open = !!field?.benchOpen;
    const repair = field?.traceRepair;
    board.enabled = !!field && field.phase !== "collect";
    if (!board.enabled) {
      lid = 0;
      standing.copy(home);
      return;
    }
    work.enabled = open;
    const stage: TraceStage = repair?.stage ?? "isolate";
    const thermal = stage === "solder" || stage === "tin";
    const route = repair?.route ?? 0;
    const heat = repair?.heat ?? 0;
    const finished = (checkpoint: TraceStage, i: number) =>
      tracePast(stage, checkpoint) ||
      (stage === checkpoint && !!repair?.ends[i]);

    if (field !== previous || difficulty !== previousDifficulty) {
      previous = field;
      previousDifficulty = difficulty;
      pads.forEach(({ surface, compound, joint, seal, weld, powerMark }, i) => {
        material(surface, finished("expose", i) ? p.busCopper : p.oxide);
        compound.enabled = finished("clean", i);
        material(
          compound,
          finished("tin", i)
            ? p.silver
            : finished("flux", i)
              ? p.traceFlux
              : p.copper,
        );
        joint.enabled = finished("solder", i);
        material(joint, finished("rinse", i) ? p.silver : p.traceFlux);
        seal.enabled = finished("seal", i);
        material(seal, field?.phase === "verified" ? p.healthy : p.traceSeal);
        weld.enabled = thermal && repair?.contact === i && heat >= 33;
        material(powerMark, tracePowered(stage) ? p.solderHeat : p.chip);
        probes[i].enabled =
          stage === "continuity" || repair?.message === "continuity-pass";
      });
      cable[0].tip.enabled = route >= 1;
      cable[0].wire.enabled = elbow.enabled = route >= 2;
      cable[1].wire.enabled = cable[1].tip.enabled = route >= 3;
      spool.enabled = stage === "prepare";
      for (const end of strip) end.enabled = !!repair?.ticks;
      guideNub.enabled = stage === "route";
      for (let i = 0; i < hints.length; i++) {
        hints[i].enabled =
          difficulty === "apprentice" &&
          (stage === "prepare"
            ? i === 3
            : stage === "route"
              ? i === [0, 2, 1][route]
              : !["isolate", "continuity", "restore", "done"].includes(stage) &&
                i < 2 &&
                !repair?.ends[i]);
      }
    }
    if (!open) {
      toolbox.pose(0, false);
      standing.copy(home);
      lid = 0;
      return;
    }

    lid = aim.toolbox ? Math.min(1, lid + (reduced ? 1 : dt * 1.65)) : 0;
    const equipped = aim.toolbox && (lid > 0.64 || aim.engaged);
    toolbox.pose(easePose(lid), equipped);
    const { gear, tool } = equipment(stage, equipped);
    if (gear !== previousGear) {
      pickUp = 0;
      previousGear = gear;
    }
    pickUp = Math.min(1, pickUp + (reduced || aim.engaged ? 1 : dt * 4.3));
    const working = aim.engaged && !!tool && gear !== "meter";
    const aimX = aim.x * traceScale;
    const aimZ = aim.z * traceScale;
    const tip = tool?.tip ?? 0;
    // After picking up the scraper, give the open lid clearance before
    // following the pointer around the rest of the work area.
    const clearingToolbox = !working && overTraceToolbox(aim.x, aim.z);
    const viewX =
      gear === "meter" ? -1.23 : clearingToolbox ? traceToolbox.x + 1.15 : aimX;
    const viewZ =
      gear === "meter" ? 0 : clearingToolbox ? traceToolbox.z + 1.52 : aimZ;
    const goalX = tool ? viewX - Math.sin(tilt) * tip : home.x - lid * 0.27;
    const goalZ = tool ? viewZ - Math.cos(tilt) * tip : home.z - lid * 0.34;
    const motion = 1 - Math.exp(-(working ? 32 : 10) * dt);
    const dx = goalX - standing.x;
    const dz = goalZ - standing.z;
    const stride = working ? 0 : Math.min(7, Math.hypot(dx, dz) * 2.5);
    standing.x += dx * (reduced ? 1 : motion);
    standing.z += dz * (reduced ? 1 : motion);
    actor.entity.setLocalPosition(standing.x, tool ? 0.02 : 0.045, standing.z);
    actor.animate(dt, time, stride, true, tool ? tilt : 2.92, 0, 0, 0, reduced);
    // Tools and their grip points live in the same body frame. Working removes
    // walk bob so the nozzle cannot slide across the selected copper surface.
    actor.body.setLocalPosition(0, 0, 0);
    actor.body.setLocalEulerAngles(0, 0, 0);
    actor.entity.setLocalEulerAngles(
      0,
      (tool ? tilt : 2.92) * pc.math.RAD_TO_DEG,
      0,
    );
    if (tool) {
      const desired = working ? 0 : 0.14;
      toolLift = pc.math.lerp(
        toolLift,
        desired,
        reduced ? 1 : 1 - Math.exp(-26 * dt),
      );
      const lift = toolLift - (1 - easePose(pickUp)) * 0.11;
      tool.root.setLocalPosition(0, lift, 0);
      left.copy(tool.left);
      right.copy(tool.right);
      left.y += lift;
      right.y += lift;
      actor.operate(left, right, thermal);
      tool.moving?.setLocalEulerAngles(
        0,
        working && !reduced ? Math.sin(time * 52) * 12 : 0,
        0,
      );
    } else if (lid > 0 && lid < 1) {
      left.set(-0.29, 0.82, 0.29);
      right.set(0.28, 0.82 + 0.22 * easePose(lid), 0.31);
      actor.operate(left, right, false);
    }

    cursor.enabled = !!tool && gear !== "meter" && !clearingToolbox;
    cursor.setLocalPosition(aimX, traceContactY + 0.018, aimZ);
    material(
      cursor,
      repair?.message === "miss" || repair?.message === "hot"
        ? p.red
        : working
          ? p.healthy
          : p.suit,
    );
    liveCable.enabled =
      gear === "cable" && working && route > 0 && route < anchors.length;
    if (liveCable.enabled) {
      pointer.set(aimX, wireHeight + 0.08, aimZ);
      placeSpan(liveCable, anchors[route - 1], pointer, 0.32, axis, rotation);
    }
    const hot = thermal && repair?.contact != null && heat >= 42;
    const spraying = gear === "sprayer" && repair?.contact != null;
    const abrasion = gear === "scraper" && repair?.contact != null;
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      particle.enabled =
        !reduced && working && (hot || spraying || (abrasion && i < 3));
      if (!particle.enabled) continue;
      const t = (time * (hot ? 3.1 : 4.8) + i * 0.279) % 1;
      const spread = t * (hot ? 1.16 : 0.29);
      const angle = i * 2.4;
      material(
        particle,
        hot ? p.solderSpark : spraying ? p.traceFlux : p.busCopper,
      );
      particle.setLocalPosition(
        aimX + Math.cos(angle) * spread,
        traceContactY +
          (spraying
            ? (1 - t) * 0.27
            : Math.sin(t * Math.PI) * (hot ? 0.84 : 0.19)),
        aimZ + Math.sin(angle) * spread,
      );
      particle.setLocalEulerAngles(18 * i, 17, 23 * i);
    }
    const gripError = tool
      ? Math.max(
          first
            .copy(actor.leftHand.getPosition())
            .distance(
              actor.body.getWorldTransform().transformPoint(left, pointer),
            ),
          first
            .copy(actor.hand.getPosition())
            .distance(
              actor.body.getWorldTransform().transformPoint(right, pointer),
            ),
        )
      : 0;
    return {
      foot: actor.entity.getPosition(),
      toolbox: lid >= 1 ? "open" : lid > 0 ? "opening" : "closed",
      gear,
      gripError,
    };
  };
}
