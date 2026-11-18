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
export function buildWorld(g: Geometry) {
  const { shape, palette: p } = g;
  shape(
    "box",
    [0, -0.5, 0],
    [world.halfWidth * 2, 1, world.halfDepth * 2],
    p.board,
  );
  for (const x of [-23, 23]) shape("box", [x, -0.1, 0], [0.2, 0.1, 78], p.ink);
  for (const z of [-39, 39]) shape("box", [0, -0.1, z], [46, 0.1, 0.2], p.ink);
  for (const x of [-20, 20])
    for (const z of [-24, -12, 0, 12, 24])
      shape("box", [x, 0.027, z], [1.4, 0.025, 0.08], p.ink);
  // Conductive traces form legible routes; decorative paths are not a simulated circuit.
  for (const x of [-14, -7, 0, 7, 14]) {
    const outer = Math.abs(x) === 14;
    const trace = outer ? p.edge : p.copper;
    shape("box", [x, 0.02, 0], [x === 0 ? 0.23 : 0.1, 0.025, 74], trace);
    for (const z of [-30, -8, 5, 20, 32])
      shape("cylinder", [x, 0.04, z], [0.55, 0.035, 0.55], trace);
  }
  for (const z of [-30, -8, 5, 20, 32])
    shape("box", [0, 0.02, z], [36, 0.025, 0.14], p.copper);
  for (const c of components) {
    const { x, z } = c;
    if (c.kind === "resistor") {
      const body = shape("cylinder", [x, 0.95, z], [1.45, 3.4, 1.45], p.white);
      body.setEulerAngles(0, 0, 90);
      for (const [offset, mat] of [
        [-0.9, p.brown],
        [-0.3, p.chip],
        [0.3, p.red],
        [1.2, p.copper],
      ] as const) {
        const band = shape(
          "cylinder",
          [x + offset, 0.95, z],
          [1.48, 0.2, 1.48],
          mat,
        );
        band.setEulerAngles(0, 0, 90);
      }
      for (const side of [-1, 1]) {
        shape("box", [x + side * 2, 0.04, z], [0.9, 0.04, 0.85], p.copper);
        shape("box", [x + side * 2, 0.3, z], [0.2, 0.6, 0.2], p.silver);
      }
    } else if (c.kind === "capacitor") {
      shape("cylinder", [x, 2.5, z], [3, 5, 3], p.blue);
      shape("cylinder", [x, 5.03, z], [2.9, 0.1, 2.9], p.silver);
      shape("box", [x, 5.1, z], [2.3, 0.05, 0.08], p.chip);
      shape("box", [x, 5.1, z], [0.08, 0.05, 2.3], p.chip);
      shape("box", [x + 1.46, 2.7, z], [0.06, 3.6, 0.5], p.white);
    } else if (c.kind === "led") {
      shape("cylinder", [x, 0.6, z], [2.5, 0.3, 2.5], p.red);
      shape("cylinder", [x, 1.4, z], [2.1, 1.6, 2.1], p.red);
      shape("sphere", [x, 2.15, z], [2.1, 1.8, 2.1], p.red);
      for (const side of [-1, 1])
        shape("box", [x + side * 0.5, 0.3, z], [0.12, 0.6, 0.12], p.silver);
    } else if (c.kind === "microcontroller") {
      shape("box", [x, 1.5, z], [9, 3, 7], p.chip);
      shape("sphere", [x - 3, 3.05, z + 2], [0.45, 0.1, 0.45], p.white);
      for (let i = 0; i < 12; i++)
        for (const side of [-1, 1])
          shape(
            "box",
            [x - 3.9 + i * 0.7, 0.5, z + side * 4],
            [0.25, 0.4, 1.3],
            p.silver,
          );
      shape("box", [x, 3.03, z], [4, 0.05, 0.1], p.ink);
    } else {
      for (const side of [-1, 1])
        shape("box", [x + side * 1.7, 0.04, z], [0.15, 0.04, 3], p.ink);
      shape("rounded", [x, 0.16, z], [2.4, 0.32, 1.4], p.copper);
      shape("rounded", [x, 0.69, z], [2.24, 1.14, 1.32], p.white);
      shape("rounded", [x, 0.68, z + 0.64], [1.94, 0.64, 0.12], p.chip);
      for (const socketX of [-0.55, 0.55]) {
        const socket = shape(
          "cylinder",
          [x + socketX, 0.69, z + 0.71],
          [0.24, 0.07, 0.24],
          p.copper,
        );
        socket.setEulerAngles(90, 0, 0);
      }
      const bezel = shape(
        "rounded",
        [x, 1.32, z + 0.22],
        [1.98, 0.69, 0.26],
        p.visor,
      );
      bezel.setEulerAngles(-20, 0, 0);
      const screen = shape(
        "rounded",
        [x, 1.32, z + 0.35],
        [1.68, 0.43, 0.08],
        p.blue,
      );
      screen.setEulerAngles(-20, 0, 0);
    }
  }
  for (const s of solids.filter((s) => s.id.startsWith("step")))
    shape(
      "box",
      [s.x, s.height / 2, s.z],
      [s.width, s.height, s.depth],
      p.edge,
    );
  // Oversized board corner mounting holes and connector skyline.
  for (const x of [-21, 21])
    for (const z of [-37, 37]) {
      shape("cylinder", [x, 0.025, z], [2, 0.05, 2], p.copper);
      shape("cylinder", [x, 0.06, z], [1.2, 0.06, 1.2], p.chip);
    }
  for (let i = 0; i < 10; i++)
    shape("box", [-16 + i * 3.5, 0.06, -38], [1.7, 0.08, 3], p.copper);
  const { x: spawnX, z: spawnZ } = world.spawn;
  shape("cylinder", [spawnX, 0.035, spawnZ], [4, 0.05, 4], p.copper);
  shape("cylinder", [spawnX, 0.065, spawnZ], [3.6, 0.04, 3.6], p.edge);
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
export function buildEngineer(g: Geometry, root: pc.Entity) {
  const player = new pc.Entity("engineer");
  root.addChild(player);
  const { shape, palette: p } = g;
  const body = new pc.Entity("engineer-pose");
  player.addChild(body);
  shape("box", [0, 0.92, 0], [0.65, 0.7, 0.4], p.suit, body);
  shape("sphere", [0, 1.5, 0], [0.65, 0.65, 0.65], p.white, body);
  shape("box", [0, 1.52, 0.29], [0.48, 0.24, 0.12], p.visor, body);
  shape("box", [0, 0.98, -0.28], [0.45, 0.5, 0.22], p.blue, body);
  const limbs = [
    [-0.22, 0.31, 0],
    [0.22, 0.31, 0],
    [-0.47, 0.93, 0],
    [0.47, 0.93, 0],
  ].map((v, i) =>
    shape(
      "box",
      v as [number, number, number],
      [i < 2 ? 0.24 : 0.2, i < 2 ? 0.55 : 0.6, 0.25],
      i < 2 ? p.chip : p.suit,
      body,
    ),
  );
  let stride = 0;
  let heading = Math.PI;
  let amplitude = 0;
  return {
    entity: player,
    body,
    hand: limbs[3],
    animate: (
      dt: number,
      time: number,
      speed: number,
      grounded: boolean,
      facing: number,
      reach: number,
      reduced: boolean,
    ) => {
      const ease = reduced ? 1 : 1 - Math.exp(-14 * dt);
      heading +=
        Math.atan2(Math.sin(facing - heading), Math.cos(facing - heading)) *
        ease;
      player.setEulerAngles(0, heading * pc.math.RAD_TO_DEG, 0);
      amplitude += (Math.min(speed / 5, 1) - amplitude) * ease;
      stride += speed * dt * 2.5;
      const idle = reduced ? 0 : Math.sin(time * 2.6) * 0.022 * (1 - amplitude);
      const bounce =
        reduced || !grounded
          ? 0
          : Math.abs(Math.sin(stride)) * amplitude * 0.05;
      body.setLocalPosition(0, idle + bounce - reach * 0.08, 0);
      body.setLocalEulerAngles(reach * 15, 0, 0);
      limbs.forEach((limb, i) =>
        limb.setLocalEulerAngles(
          (grounded
            ? Math.sin(stride + (i % 2) * Math.PI) *
              amplitude *
              (reduced ? 12 : 33)
            : -15) - (i === 3 ? reach * 52 : i === 2 ? reach * 20 : 0),
          0,
          0,
        ),
      );
    },
  };
}

export function buildFieldFixtures(
  g: Geometry,
  root: pc.Entity,
  engineer: pc.Entity,
) {
  const board = new pc.Entity("field-fixtures");
  root.addChild(board);
  const pads = new pc.Entity("probe-pads");
  board.addChild(pads);
  const { shape, palette: p } = g;
  for (const pad of fieldPads)
    shape("cylinder", [pad.x, 0.09, pad.z], [0.95, 0.14, 0.95], p.silver, pads);
  const highlights = fieldPads.map(({ id, x, z }) => ({
    id,
    ring: shape("cylinder", [x, 0.07, z], [1.42, 0.07, 1.42], p.suit, pads),
  }));
  shape("box", [-5.25, 0.05, -15], [3.5, 0.04, 0.22], p.copper, pads);
  const gap = shape(
    "box",
    [fieldPatch.x, 0.06, fieldPatch.z],
    [0.3, 0.06, 1],
    p.board,
    board,
  );
  const patch = shape(
    "box",
    [fieldPatch.x, 0.11, fieldPatch.z],
    [0.5, 0.14, 1.65],
    p.suit,
    board,
  );
  const marker = shape(
    "cone",
    [fieldPatch.x, 2, fieldPatch.z],
    [0.65, 0.9, 0.65],
    p.suit,
    board,
  );
  marker.setEulerAngles(180, 0, 0);
  const stored = shape(
    "box",
    [fieldTerminal.x + 0.85, 1.24, fieldTerminal.z],
    [0.38, 0.18, 0.35],
    p.suit,
    board,
  );
  const meter = shape(
    "box",
    [0.5, 0.94, 0.21],
    [0.27, 0.36, 0.15],
    p.suit,
    engineer,
  );
  shape("box", [0, 0.12, 0.51], [0.7, 0.3, 0.03], p.visor, meter);
  board.enabled = false;
  meter.enabled = false;
  let previousField: FieldState | undefined;
  let previousAvailable = false;
  let previousDifficulty: Difficulty | undefined;
  let highlighted = 0;
  return (
    field: FieldState | undefined,
    available: boolean,
    difficulty: Difficulty,
    reach: number,
  ) => {
    if (field) {
      meter.setLocalPosition(0.5, 0.94 + reach * 0.26, 0.21 + reach * 0.16);
      meter.setLocalEulerAngles(-reach * 24, 0, 0);
    }
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
    meter.enabled = !!phase;
    marker.enabled = difficulty !== "engineer" && phase === "located";
    gap.enabled = phase === "located";
    patch.enabled = phase === "recheck" || phase === "verified";
    patch.render!.material = phase === "verified" ? p.healthy : p.suit;
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
