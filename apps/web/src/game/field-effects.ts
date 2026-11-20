import * as pc from "playcanvas";
import { tracePowered, type FieldState } from "@spark/game-core";
import type { Language } from "@spark/shared";
import { fieldVoltage } from "../FieldDiagnostics";
import {
  probeGroundOffset,
  type FieldMotion,
  type ToolPose,
} from "./interaction-motion";
import type { Workshop } from "./workshop-art";

function createLeads(device: pc.GraphicsDevice, root: pc.Entity) {
  const rings = 12;
  const sides = 5;
  const perLead = rings * sides;
  const vertices = new Float32Array(perLead * 2 * 3);
  const colors = new Uint8Array(perLead * 2 * 4);
  const indices: number[] = [];
  for (let lead = 0; lead < 2; lead++) {
    for (let i = 0; i < perLead; i++) {
      colors.set(
        lead === 0 ? [206, 46, 39, 255] : [34, 43, 54, 255],
        (lead * perLead + i) * 4,
      );
      if (i >= perLead - sides) continue;
      const a = lead * perLead + i;
      const b = i % sides === sides - 1 ? a - sides + 1 : a + 1;
      indices.push(a, b, a + sides, b, b + sides, a + sides);
    }
  }
  const mesh = new pc.Mesh(device);
  mesh.setPositions(vertices);
  mesh.setColors32(colors);
  mesh.setIndices(indices);
  mesh.update(pc.PRIMITIVE_TRIANGLES);
  const material = new pc.StandardMaterial();
  material.useLighting = false;
  material.diffuse.set(0, 0, 0);
  material.emissive.set(1, 1, 1);
  material.emissiveVertexColor = true;
  material.cull = pc.CULLFACE_NONE;
  material.update();
  const entity = new pc.Entity("flexible probe leads");
  entity.addComponent("render", {
    meshInstances: [new pc.MeshInstance(mesh, material, entity)],
  });
  entity.enabled = false;
  root.addChild(entity);
  return {
    entity,
    curve(lead: number, from: pc.Vec3, to: pc.Vec3) {
      const bow = lead === 0 ? 0.19 : -0.19;
      const dx = to.x - from.x;
      const dz = to.z - from.z;
      const horizontal = Math.max(0.01, Math.hypot(dx, dz));
      const sideX = dz / horizontal;
      const sideZ = -dx / horizontal;
      for (let ring = 0; ring < rings; ring++) {
        const t = ring / (rings - 1);
        const swing = Math.sin(t * Math.PI);
        const x = pc.math.lerp(from.x, to.x, t) + swing * bow;
        const y = Math.max(0.105, pc.math.lerp(from.y, to.y, t) - swing * 0.28);
        const z = pc.math.lerp(from.z, to.z, t) - swing * bow;
        for (let side = 0; side < sides; side++) {
          const theta = (side * Math.PI * 2) / sides;
          const a = (lead * perLead + ring * sides + side) * 3;
          const radial = Math.cos(theta) * 0.017;
          vertices[a] = x + radial * sideX;
          vertices[a + 1] = y + Math.sin(theta) * 0.017;
          vertices[a + 2] = z + radial * sideZ;
        }
      }
    },
    upload() {
      mesh.setPositions(vertices);
      mesh.update(pc.PRIMITIVE_TRIANGLES);
    },
    dispose() {
      material.destroy();
    },
  };
}

function buildMeterScreen(device: pc.GraphicsDevice, meter: pc.Entity) {
  const surface = document.createElement("canvas");
  surface.width = 256;
  surface.height = 128;
  const ctx = surface.getContext("2d")!;
  const texture = new pc.Texture(device, {
    name: "multimeter LCD",
    width: surface.width,
    height: surface.height,
    mipmaps: true,
    minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR,
    addressU: pc.ADDRESS_CLAMP_TO_EDGE,
    addressV: pc.ADDRESS_CLAMP_TO_EDGE,
  });
  texture.setSource(surface);
  const material = new pc.StandardMaterial();
  material.useLighting = false;
  material.diffuse.set(0, 0, 0);
  material.emissive.set(1, 1, 1);
  material.emissiveMap = texture;
  material.update();
  const geometry = new pc.Geometry();
  geometry.positions = [
    -0.187, -0.093, 0, 0.187, -0.093, 0, -0.187, 0.093, 0, 0.187, 0.093, 0,
  ];
  geometry.normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
  geometry.uvs = [0, 1, 1, 1, 0, 0, 1, 0];
  geometry.indices = [0, 1, 2, 1, 3, 2];
  const mesh = pc.Mesh.fromGeometry(device, geometry);
  const screen = new pc.Entity("solver voltage LCD");
  screen.setLocalPosition(0, 0.247, 0.159);
  screen.addComponent("render", {
    meshInstances: [new pc.MeshInstance(mesh, material, screen)],
  });
  meter.addChild(screen);
  let previous = "";
  return {
    update(site: string, voltage: string) {
      const key = site + voltage;
      if (key === previous) return;
      previous = key;
      ctx.fillStyle = "#aedac0";
      ctx.fillRect(0, 0, 256, 128);
      ctx.fillStyle = "#183e39";
      ctx.font = "bold 23px monospace";
      ctx.fillText("DC", 14, 28);
      if (site) ctx.fillText(site, 202, 28);
      ctx.fillRect(14, 37, 228, 2);
      ctx.font = "bold 52px monospace";
      ctx.fillText(voltage, 14, 96, 230);
      ctx.font = "bold 15px monospace";
      ctx.fillText("REF  GND", 14, 117);
      texture.upload();
    },
    dispose() {
      material.destroy();
      texture.destroy();
    },
  };
}

export function buildFieldEffects(
  device: pc.GraphicsDevice,
  workshop: Workshop,
  root: pc.Entity,
  body: pc.Entity,
  hand: pc.Entity,
  leftHand: pc.Entity,
) {
  const meter = workshop("fieldMeter", body);
  meter.setLocalScale(0.76, 0.76, 0.76);
  const dial = workshop("meterDial", meter, 0, -0.047, 0.135);
  const screen = buildMeterScreen(device, meter);
  const effects = new pc.Entity("field contact tools");
  root.addChild(effects);
  const probes = [
    workshop("redProbe", effects),
    workshop("blackProbe", effects),
  ];
  const leads = createLeads(device, effects);
  const target = new pc.Vec3();
  const tip = new pc.Vec3();
  const grip = new pc.Vec3();
  const rest = new pc.Vec3();
  const axis = new pc.Vec3();
  const jack = new pc.Vec3();
  const cable = new pc.Vec3();

  // The tool models' local -Z axes run from grip to the actual contact tip.
  function aim(
    tool: pc.Entity,
    start: pc.Vec3,
    end: pc.Vec3,
    amount: number,
    length: number,
  ) {
    tip.lerp(start, end, amount);
    tip.y += Math.sin(amount * Math.PI) * 0.19;
    axis.sub2(start, end).normalize();
    grip.copy(axis).mulScalar(length).add(tip);
    tool.setPosition(grip);
    tool.lookAt(tip);
  }

  let shownSite = "";
  let shownVolts: number | undefined;
  let observedField: FieldState | undefined;
  return {
    update(
      field: FieldState | undefined,
      motion: FieldMotion | undefined,
      pose: ToolPose,
      elapsed: number,
      language: Language,
      readingBook: boolean,
      reduced: boolean,
    ) {
      meter.enabled = !!field && !readingBook && !field.benchOpen;
      if (field !== observedField || pose.contact || !motion || reduced) {
        if (!motion || reduced || pose.contact || elapsed > 0.95) {
          const site =
            field?.traceRepair && !tracePowered(field.traceRepair.stage)
              ? undefined
              : field?.last;
          shownSite = site ?? "";
          const readings =
            field?.phase === "collect" || field?.phase === "located"
              ? field.before
              : field?.after;
          shownVolts = site ? readings?.[site] : undefined;
        }
        observedField = field;
      }
      const voltage = fieldVoltage(language, shownVolts);
      if (meter.enabled) {
        meter.setLocalPosition(
          -0.51,
          0.79 + pose.reach * 0.24,
          0.13 + pose.reach * 0.17,
        );
        meter.setLocalEulerAngles(
          -9 - pose.reach * 16,
          2,
          -12 * (1 - pose.reach),
        );
        dial.setLocalEulerAngles(0, 0, -24 + pose.reach * 31);
        screen.update(shownSite, voltage);
      }
      const active = !!motion && pose.reach > 0.012;
      effects.enabled = active;
      if (!active || !motion) return voltage;
      const { x, z } = motion.site;
      leads.entity.enabled = true;
      for (let i = 0; i < 2; i++) {
        const red = i === 0;
        rest.copy((red ? hand : leftHand).getPosition());
        target.set(
          x + (red ? 0 : probeGroundOffset.x),
          red ? 0.158 : 0.112,
          z + (red ? 0 : probeGroundOffset.z),
        );
        const probe = probes[i];
        aim(probe, rest, target, red ? pose.red : pose.black, 0.345);
        meter
          .getWorldTransform()
          .transformPoint(jack.set(red ? 0.176 : -0.176, -0.248, 0.173), jack);
        probe.getWorldTransform().transformPoint(cable.set(0, 0, 0.14), cable);
        leads.curve(i, jack, cable);
      }
      leads.upload();
      return voltage;
    },
    dispose() {
      screen.dispose();
      leads.dispose();
    },
  };
}
