import * as pc from "playcanvas";
import { components, solids, world } from "@spark/game-core";
import type { Geometry } from "./geometry";
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
  // Conductive traces form legible routes; decorative paths are not a simulated circuit.
  for (const x of [-14, -7, 0, 7, 14]) {
    shape("box", [x, 0.02, 0], [0.13, 0.025, 74], p.copper);
    for (const z of [-30, -8, 5, 20, 32])
      shape("cylinder", [x, 0.04, z], [0.55, 0.035, 0.55], p.copper);
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
      for (const side of [-1, 1])
        shape("box", [x + side * 2, 0.3, z], [0.2, 0.6, 0.2], p.silver);
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
      shape("box", [x, 0.6, z], [2.4, 1.2, 1.4], p.chip);
      const screen = shape("box", [x, 1.4, z], [2.1, 0.7, 0.14], p.blue);
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
  shape("cylinder", [world.spawn.x, 0.03, world.spawn.z], [4, 0.04, 4], p.ink);
  const marker = shape("cone", [0, 4, 26], [0.6, 0.9, 0.6], p.suit);
  marker.setEulerAngles(180, 0, 0);
  // Abstract terminal status beacon, not a simulated LED.
  const beacon = shape("box", [0, 2.5, -18], [2.2, 0.5, 0.5], p.chip);
  const restoredTrace = shape("box", [0, 0.08, -14], [0.6, 0.08, 7], p.healthy);
  restoredTrace.enabled = false;
  return {
    marker,
    status: (repaired: boolean, verified: boolean) => {
      beacon.render!.material = verified
        ? p.healthy
        : repaired
          ? p.suit
          : p.chip;
      restoredTrace.enabled = verified;
    },
  };
}
export function buildEngineer(g: Geometry, root: pc.Entity) {
  const player = new pc.Entity("engineer");
  root.addChild(player);
  const { shape, palette: p } = g;
  shape("box", [0, 0.92, 0], [0.65, 0.7, 0.4], p.suit, player);
  shape("sphere", [0, 1.5, 0], [0.65, 0.65, 0.65], p.white, player);
  shape("box", [0, 1.52, 0.29], [0.48, 0.24, 0.12], p.visor, player);
  shape("box", [0, 0.98, -0.28], [0.45, 0.5, 0.22], p.blue, player);
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
      player,
    ),
  );
  return {
    entity: player,
    animate: (time: number, speed: number, grounded: boolean) => {
      limbs.forEach((limb, i) =>
        limb.setLocalEulerAngles(
          grounded
            ? Math.sin(time * 11 + (i % 2) * Math.PI) *
                Math.min(speed / 4, 1) *
                28
            : -15,
          0,
          0,
        ),
      );
    },
  };
}
