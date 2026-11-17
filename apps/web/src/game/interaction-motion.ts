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
