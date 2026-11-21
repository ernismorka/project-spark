import * as pc from "playcanvas";
import type { TraceStage } from "@spark/game-core";
import type { Geometry } from "./geometry";
import { traceToolbox } from "./trace-view";

type Gear =
  "scraper" | "swab" | "sprayer" | "iron" | "stripper" | "cable" | "meter";
type Position = [number, number, number];

const equipment: Partial<Record<TraceStage, Gear>> = {
  expose: "scraper",
  clean: "swab",
  flux: "sprayer",
  tin: "iron",
  prepare: "stripper",
  route: "cable",
  solder: "iron",
  rinse: "swab",
  continuity: "meter",
  seal: "sprayer",
};

export function placeSpan(
  mesh: pc.Entity,
  a: pc.Vec3,
  b: pc.Vec3,
  diameter: number,
  axis: pc.Vec3,
  rotation: pc.Quat,
) {
  axis.sub2(b, a);
  const length = axis.length();
  mesh.setLocalPosition((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  mesh.setLocalScale(diameter, Math.max(0.001, length), diameter);
  mesh.setLocalRotation(
    rotation.setFromDirections(pc.Vec3.UP, axis.normalize()),
  );
}

export function buildToolbox(g: Geometry, parent: pc.Entity) {
  const { shape, palette: p } = g;
  const box = new pc.Entity("ESD repair toolbox");
  box.setLocalPosition(traceToolbox.x, 0, traceToolbox.z);
  parent.addChild(box);
  const part = (
    pos: Position,
    size: Position,
    mat: pc.StandardMaterial,
    root = box,
  ) => shape("box", pos, size, mat, root);
  part([0, 0.26, 0], [2.26, 0.48, 1.38], p.toolCase);
  part([0, 0.11, 0], [2.32, 0.15, 1.41], p.chip);
  part([0, 0.51, 0], [2.14, 0.08, 1.28], p.visor);
  for (const x of [-1.08, 1.08]) {
    part([x, 0.55, 0], [0.12, 0.16, 1.42], p.toolCase);
    part([x, 0.33, 0.72], [0.24, 0.36, 0.08], p.chip);
  }
  for (const z of [-0.66, 0.66])
    part([0, 0.55, z], [2.13, 0.16, 0.1], p.toolCase);
  part([0, 0.38, 0.74], [0.61, 0.13, 0.16], p.chip);
  for (const x of [-0.62, 0.62])
    part([x, 0.52, 0.72], [0.21, 0.2, 0.08], p.silver);
  const lid = new pc.Entity("hinged toolbox lid");
  lid.setLocalPosition(0, 0.65, -0.7);
  box.addChild(lid);
  part([0, 0.05, 0.7], [2.33, 0.16, 1.43], p.toolCase, lid);
  part([0, 0.145, 0.7], [1.75, 0.045, 1.02], p.oxide, lid);
  part([0, -0.041, 0.7], [1.99, 0.037, 1.15], p.busEdge, lid);
  part([-0.48, -0.065, 0.97], [0.74, 0.021, 0.07], p.ink, lid);
  part([-0.65, -0.065, 1.1], [0.4, 0.021, 0.05], p.ink, lid);
  const inventory = [
    part([-0.55, 0.59, -0.2], [0.82, 0.15, 0.28], p.blue),
    part([-0.21, 0.61, 0.29], [0.85, 0.17, 0.19], p.silver),
    part([0.62, 0.62, 0.09], [0.33, 0.2, 0.79], p.suit),
  ];
  return {
    pose(open: number, equipped: boolean) {
      lid.setLocalEulerAngles(-open * 108, 0, 0);
      inventory[0].enabled = !equipped;
    },
  };
}

export function buildTraceEquipment(g: Geometry, body: pc.Entity) {
  const { shape, palette: p } = g;
  function build(name: Gear, tip: number) {
    const root = new pc.Entity(name);
    body.addChild(root);
    root.enabled = false;
    const box = (
      pos: Position,
      size: Position,
      material: pc.StandardMaterial,
    ) => shape("box", pos, size, material, root);
    const dome = (
      pos: Position,
      size: Position,
      material: pc.StandardMaterial,
    ) => shape("sphere", pos, size, material, root);
    const axis = new pc.Vec3();
    const rotation = new pc.Quat();
    const span = (
      a: Position,
      b: Position,
      d: number,
      material: pc.StandardMaterial,
    ) => {
      const mesh = shape("cylinder", [0, 0, 0], [1, 1, 1], material, root);
      placeSpan(mesh, new pc.Vec3(...a), new pc.Vec3(...b), d, axis, rotation);
      return mesh;
    };
    const left = new pc.Vec3(-0.28, 0.95, 0.32);
    const right = new pc.Vec3(0.32, 0.98, 0.28);
    span([-0.42, 0.965, 0.36], [-0.16, 0.965, 0.36], 0.106, p.visor);
    span([0.21, 0.995, 0.32], [0.43, 0.995, 0.32], 0.112, p.visor);
    span([-0.3, 0.965, 0.36], [0, 0.84, 0.39], 0.082, p.chip);
    span([0.31, 0.995, 0.32], [0.13, 0.85, 0.37], 0.09, p.chip);
    let moving: pc.Entity | undefined;
    switch (name) {
      case "iron":
        box([0.29, 1.1, 0], [0.34, 0.31, 0.82], p.visor);
        box([0.29, 1.29, 0.02], [0.25, 0.1, 0.63], p.toolCase);
        for (const z of [-0.18, -0.02, 0.14])
          box([0.475, 1.13, z], [0.031, 0.17, 0.065], p.silver);
        span([0.28, 1.06, 0.31], [0.1, 0.46, tip - 0.19], 0.3, p.chip);
        span(
          [0.12, 0.61, tip - 0.33],
          [0.035, 0.32, tip - 0.065],
          0.22,
          p.busCopper,
        );
        span([0.041, 0.34, tip - 0.08], [0, 0.238, tip], 0.095, p.silver);
        break;
      case "sprayer":
        box([0.04, 0.88, 0.47], [0.43, 0.24, 0.52], p.visor);
        dome([0.04, 1.08, 0.51], [0.31, 0.43, 0.33], p.traceFlux);
        box([0.04, 1.29, 0.51], [0.18, 0.08, 0.19], p.chip);
        span([0.04, 0.85, 0.66], [0, 0.48, tip - 0.12], 0.14, p.silver);
        span([0, 0.51, tip - 0.15], [0, 0.43, tip - 0.086], 0.23, p.busCopper);
        break;
      case "scraper":
        span([0, 0.91, 0.3], [0, 0.48, tip - 0.17], 0.34, p.blue);
        span([0, 0.8, 0.52], [0, 0.68, 0.72], 0.41, p.chip);
        box([0, 0.35, tip - 0.07], [0.48, 0.18, 0.33], p.visor);
        moving = box([0, 0.272, tip], [0.42, 0.1, 0.18], p.silver);
        break;
      case "swab":
        span([0.04, 0.87, 0.37], [0, 0.32, tip], 0.14, p.blue);
        box([0, 0.305, tip], [0.36, 0.14, 0.27], p.chip);
        dome([0, 0.257, tip], [0.39, 0.12, 0.31], p.white);
        break;
      case "stripper":
        box([0, 0.78, 0.52], [0.54, 0.25, 0.48], p.toolCase);
        span([-0.19, 0.73, 0.55], [-0.09, 0.36, tip], 0.17, p.silver);
        span([0.19, 0.73, 0.55], [0.09, 0.36, tip], 0.17, p.silver);
        break;
      case "cable":
        span([-0.35, 0.96, 0.36], [0.36, 0.99, 0.32], 0.25, p.blue);
        span([0, 0.96, 0.36], [0.05, 0.51, tip - 0.26], 0.24, p.blue);
        span([0.05, 0.51, tip - 0.26], [0, 0.31, tip], 0.23, p.blue);
        dome([0.05, 0.51, tip - 0.26], [0.24, 0.24, 0.24], p.blue);
        break;
      case "meter":
        box([0, 0.83, 0.44], [0.74, 0.22, 0.5], p.toolCase);
        box([0, 0.951, 0.48], [0.57, 0.038, 0.34], p.visor);
        box([0, 0.978, 0.39], [0.41, 0.018, 0.1], p.healthy);
        break;
    }
    return { root, tip, left, right, moving };
  }

  const tools = {
    scraper: build("scraper", 0.99),
    swab: build("swab", 0.96),
    sprayer: build("sprayer", 1.11),
    iron: build("iron", 1.37),
    stripper: build("stripper", 0.92),
    cable: build("cable", 1.07),
    meter: build("meter", 0.7),
  };
  let current: (typeof tools)[Gear] | undefined;
  return (stage: TraceStage, equipped: boolean) => {
    const gear = equipped ? equipment[stage] : undefined;
    const next = gear ? tools[gear] : undefined;
    if (next !== current) {
      if (current) current.root.enabled = false;
      if (next) next.root.enabled = true;
      current = next;
    }
    return { gear, tool: current };
  };
}
