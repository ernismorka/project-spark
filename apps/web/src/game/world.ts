import * as pc from "playcanvas";
import {
  components,
  fieldPads,
  fieldPatch,
  fieldTerminal,
  solids,
  world,
  type FieldState,
} from "@spark/game-core";
import type { Geometry } from "./geometry";
import type { Difficulty } from "../difficulty";
import type { Workshop } from "./workshop-art";
import { probeGroundOffset } from "./interaction-motion";
export function buildWorld(
  g: Geometry,
  workshop: Workshop,
  root: pc.Entity,
  batch: number,
) {
  const { shape, palette: p } = g;
  for (const name of ["board", "westRail", "eastRail", "connector", "bench"])
    workshop(name, root, 0, 0, 0, batch);
  for (const z of [-39, 39]) shape("box", [0, -0.1, z], [46, 0.1, 0.2], p.ink);
  for (const x of [-20, 20])
    for (const z of [-24, -12, 0, 12, 24])
      shape("box", [x, 0.027, z], [1.4, 0.025, 0.08], p.ink);
  // Conductive traces form legible routes; decorative paths are not a simulated circuit.
  for (const x of [-14, -7, 0, 7, 14]) {
    const outer = Math.abs(x) === 14;
    const trace = outer ? p.edge : p.copper;
    shape("box", [x, 0.02, 0], [x === 0 ? 0.32 : 0.14, 0.025, 74], trace);
    for (const z of [-30, -8, 5, 20, 32])
      shape("cylinder", [x, 0.04, z], [0.55, 0.035, 0.55], trace);
  }
  for (const z of [-30, -8, 5, 20, 32])
    shape("box", [0, 0.02, z], [36, 0.025, 0.14], p.copper);
  for (const { x, z, kind } of components) {
    if (kind === "terminal") {
      for (const side of [-1, 1])
        shape("box", [x + side * 1.7, 0.04, z], [0.15, 0.04, 3], p.ink);
      shape("terminal", [x, 0, z], [1, 1, 1], p.terminal);
    } else {
      workshop(kind, root, x, 0, z, batch);
      const width = kind === "microcontroller" ? 5 : 2.2;
      for (const side of [-1, 1]) {
        shape("box", [x + side * width, 0.03, z], [0.08, 0.03, 3.4], p.ink);
        for (const end of [-1, 1])
          shape(
            "box",
            [x + side * (width - 0.32), 0.03, z + end * 1.68],
            [0.64, 0.03, 0.08],
            p.ink,
          );
      }
    }
  }
  // Narrow, broken-up parallel paths give the silkscreen a visible scale from the player camera.
  for (const side of [-1, 1]) {
    for (const z of [-25, -13, 1, 15, 28]) {
      shape("box", [side * 17.35, 0.025, z], [0.13, 0.022, 6], p.copper);
      const corner = shape(
        "box",
        [side * 18.45, 0.025, z + 4.1],
        [0.13, 0.022, 3.1],
        p.copper,
      );
      corner.setLocalEulerAngles(0, side * 45, 0);
      shape(
        "cylinder",
        [side * 19.5, 0.052, z + 5.15],
        [0.53, 0.048, 0.53],
        p.copper,
      );
      shape(
        "cylinder",
        [side * 19.5, 0.08, z + 5.15],
        [0.26, 0.029, 0.26],
        p.edge,
      );
    }
  }
  for (const s of solids.filter((s) => s.id.startsWith("step")))
    shape(
      "box",
      [s.x, s.height / 2, s.z],
      [s.width, s.height, s.depth],
      p.edge,
    );
  const { x: spawnX, z: spawnZ } = world.spawn;
  workshop("launchPad", root, spawnX, 0, spawnZ, batch);
  for (const side of [-1, 1]) {
    const stroke = shape(
      "box",
      [spawnX + side * 0.32, 0.08, spawnZ - 2.7],
      [0.14, 0.025, 0.9],
      p.ink,
    );
    stroke.setEulerAngles(0, side * 45, 0);
  }
  const marker = shape("cone", [0, 4, 26], [0.6, 0.9, 0.6], p.suit);
  marker.setEulerAngles(180, 0, 0);
  // Abstract terminal status beacon, not a simulated LED.
  const beacon = shape("box", [0, 2.5, -18], [2.2, 0.5, 0.5], p.chip);
  const restoredTrace = shape("box", [0, 0.08, -14], [0.6, 0.08, 7], p.healthy);
  restoredTrace.enabled = false;
  // An abstract service-status display; no MCU execution or LED model is implied.
  const activeDisplay = shape("box", [0, 3.1, -25], [6, 0.12, 3], p.healthy);
  activeDisplay.enabled = false;
  // Animated/changed status geometry must remain outside immutable board batches.
  for (const entity of [marker, beacon, restoredTrace, activeDisplay])
    entity.render!.batchGroupId = -1;
  return {
    marker,
    status: (repaired: boolean, verified: boolean, activated = false) => {
      beacon.render!.material = verified
        ? p.healthy
        : repaired
          ? p.suit
          : p.chip;
      restoredTrace.enabled = verified;
      activeDisplay.enabled = activated;
    },
  };
}
export function buildFieldFixtures(
  g: Geometry,
  root: pc.Entity,
  workshop: Workshop,
) {
  const board = new pc.Entity("field-fixtures");
  root.addChild(board);
  const pads = new pc.Entity("probe-pads");
  board.addChild(pads);
  const { shape, palette: p } = g;
  for (const pad of fieldPads) {
    shape("cylinder", [pad.x, 0.09, pad.z], [0.95, 0.14, 0.95], p.silver, pads);
    shape(
      "cylinder",
      [pad.x + probeGroundOffset.x, 0.072, pad.z + probeGroundOffset.z],
      [0.31, 0.077, 0.31],
      p.visor,
      pads,
    );
  }
  const highlights = fieldPads.map(({ id, x, z }) => ({
    id,
    ring: shape("cylinder", [x, 0.07, z], [1.42, 0.07, 1.42], p.suit, pads),
  }));
  shape("box", [-5.25, 0.05, -15], [3.5, 0.04, 0.22], p.copper, pads);
  const marker = shape(
    "cone",
    [fieldPatch.x, 2, fieldPatch.z],
    [0.65, 0.9, 0.65],
    p.suit,
    board,
  );
  marker.setEulerAngles(180, 0, 0);
  const stored = workshop(
    "fieldMeter",
    board,
    fieldTerminal.x + 0.55,
    1.43,
    fieldTerminal.z,
  );
  stored.setLocalScale(0.52, 0.52, 0.52);
  stored.setLocalEulerAngles(-76, 0, -10);
  board.enabled = false;
  let previousField: FieldState | undefined;
  let previousAvailable = false;
  let previousDifficulty: Difficulty | undefined;
  let highlighted = 0;
  return (
    field: FieldState | undefined,
    available: boolean,
    difficulty: Difficulty,
  ) => {
    const phase = field?.phase;
    if (
      field === previousField &&
      available === previousAvailable &&
      difficulty === previousDifficulty
    )
      return highlighted;
    previousField = field;
    previousAvailable = available;
    previousDifficulty = difficulty;
    board.enabled = !!phase || available;
    pads.enabled = !!phase;
    stored.enabled = available && !phase;
    marker.enabled =
      difficulty !== "engineer" && phase === "located" && !field?.benchOpen;
    const sweep =
      phase === "collect"
        ? field?.before
        : phase === "recheck"
          ? field?.after
          : undefined;
    highlighted = 0;
    for (const { id, ring } of highlights) {
      ring.enabled =
        difficulty === "apprentice" &&
        sweep !== undefined &&
        sweep[id] === undefined;
      if (ring.enabled) highlighted++;
    }
    return highlighted;
  };
}
