import { fieldPads, fieldPatch, type FieldState } from "@spark/game-core";

export function acceptedFieldMotion(
  previous: FieldState | undefined,
  field: FieldState | undefined,
) {
  if (!previous || !field || previous === field) return;
  if (previous.phase === "located" && field.phase === "recheck")
    return { kind: "repair" as const, site: fieldPatch };
  const pad = fieldPads.find(({ id }) => id === field.last);
  if (!pad) return;
  if (previous.phase === "recheck" && field.phase === "verified")
    return { kind: "verified" as const, site: pad };
  if (
    previous.before[pad.id] !== field.before[pad.id] ||
    previous.after[pad.id] !== field.after[pad.id]
  )
    return { kind: "probe" as const, site: pad };
}

export type FieldMotion = NonNullable<ReturnType<typeof acceptedFieldMotion>>;

export const probeGroundOffset = { x: -0.69, z: 0.39 };

export function fieldMotionDuration(
  kind: FieldMotion["kind"],
  reduced: boolean,
) {
  return reduced ? 0.3 : kind === "repair" ? 1.96 : 1.36;
}

function ramp(value: number, start: number, end: number) {
  const t = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

export function toolPose(
  kind: FieldMotion["kind"] | undefined,
  time: number,
  reduced: boolean,
) {
  if (!kind || reduced)
    return { reach: 0, red: 0, black: 0, solder: 1, heat: 0, contact: false };
  if (kind === "repair") {
    const heat = ramp(time, 0.39, 0.58) * (1 - ramp(time, 1.42, 1.81));
    return {
      reach: ramp(time, 0, 0.45) * (1 - ramp(time, 1.45, 1.96)),
      red: 0,
      black: 0,
      solder: ramp(time, 0.47, 1.43),
      heat,
      contact: time >= 0.47 && time < 1.43,
    };
  }
  const black = ramp(time, 0.1, 0.49) * (1 - ramp(time, 1.0, 1.33));
  const red = ramp(time, 0.22, 0.62) * (1 - ramp(time, 0.96, 1.3));
  return {
    reach: ramp(time, 0, 0.36) * (1 - ramp(time, 1.0, 1.36)),
    red,
    black,
    solder: 1,
    heat: 0,
    contact: time >= 0.62 && time <= 0.96,
  };
}

export type ToolPose = ReturnType<typeof toolPose>;
