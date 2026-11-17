import * as pc from "playcanvas";
import { fieldPatch } from "@spark/game-core";
import type { Geometry } from "./geometry";
import type { FieldMotion } from "./interaction-motion";

export function buildFieldEffects(
  g: Geometry,
  root: pc.Entity,
  hand: pc.Entity,
) {
  const group = new pc.Entity("field-action-effects");
  root.addChild(group);
  const { shape, palette } = g;
  const tool = shape("box", [0, 0, 0], [1, 1, 1], palette.visor, group);
  const contact = shape("sphere", [0, 0, 0], [1, 1, 1], palette.suit, group);
  const confirmation = shape(
    "cylinder",
    [fieldPatch.x, 0.15, fieldPatch.z],
    [1, 1, 1],
    palette.healthy,
    group,
  );
  const tip = new pc.Vec3();
  const center = new pc.Vec3();
  group.enabled = false;

  return (
    motion: FieldMotion | undefined,
    elapsed: number,
    reduced: boolean,
    reach: number,
  ) => {
    group.enabled = !!motion;
    if (!motion) return;
    const { kind, site } = motion;
    const repair = kind === "repair";
    const color = kind === "verified" ? palette.healthy : palette.suit;
    contact.render!.material = color;
    contact.setPosition(site.x, 0.25, site.z);
    const pulse = reduced
      ? 0.18
      : Math.sin(Math.PI * Math.min(elapsed / 0.8, 1)) * 0.25;
    contact.setLocalScale(
      0.12 + pulse,
      0.1 + pulse * (repair ? 2 : 0.6),
      0.12 + pulse,
    );
    tool.enabled = reach > 0.05;
    if (tool.enabled) {
      const grip = hand.getPosition();
      tip.set(site.x, 0.22, site.z).lerp(grip, tip, reach);
      tool.setPosition(center.lerp(grip, tip, 0.5));
      tool.lookAt(tip);
      tool.setLocalScale(
        repair ? 0.12 : 0.065,
        repair ? 0.12 : 0.065,
        grip.distance(tip),
      );
      tool.render!.material = repair ? palette.copper : palette.visor;
    }
    confirmation.enabled = kind === "verified";
    if (confirmation.enabled)
      confirmation.setLocalScale(0.8 + pulse * 4, 0.045, 0.8 + pulse * 4);
  };
}
