import { solveDC } from "@spark/electronics";
import type { DCCircuit, Session } from "@spark/shared";
import { diagnosticCircuit } from "./diagnosis";
import { components, horizontalDistance } from "./world";
import type { TraceRepair } from "./trace-repair";

export const fieldPads = [
  { id: "P1", x: -3.5, z: -15, node: "VCC" },
  { id: "P2", x: -7, z: 16, node: "FEED" },
  { id: "P3", x: 7, z: 9, node: "SENSE" },
] as const;
export const fieldPatch = { id: "FEED-LINK", x: -4.35, z: -3 } as const;
export const fieldTerminal = components[4];
export const fieldRange = 2.4;
export type PadId = (typeof fieldPads)[number]["id"];
export type FieldReadings = Readonly<Partial<Record<PadId, number>>>;
export type FieldState = Readonly<{
  phase: "collect" | "located" | "recheck" | "verified";
  before: FieldReadings;
  after: FieldReadings;
  notebook: boolean;
  incorrect: boolean;
  last: PadId | null;
  benchOpen?: boolean;
  traceRepair?: TraceRepair;
}>;

export function createField(): FieldState {
  return {
    phase: "collect",
    before: {},
    after: {},
    notebook: false,
    incorrect: false,
    last: null,
  };
}

// A broken feed splits one ideal net. R1 and R2 still reference the downstream
// island to ground; restoring the feed joins the pads on the same ideal node.
export function fieldCircuit(restored: boolean): DCCircuit {
  return {
    ...diagnosticCircuit,
    nodes: restored
      ? diagnosticCircuit.nodes
      : [...diagnosticCircuit.nodes, "FEED"],
    components: diagnosticCircuit.components.map((part) =>
      part.kind === "resistor" && part.id === "R1"
        ? { ...part, a: restored ? "VCC" : "FEED", open: false }
        : part,
    ),
  };
}

type FieldTarget =
  (typeof fieldPads)[number] | typeof fieldPatch | typeof fieldTerminal;
export function fieldDestinations(field: FieldState): readonly FieldTarget[] {
  switch (field.phase) {
    case "located":
      return [fieldPatch];
    case "verified":
      return [fieldTerminal];
    default: {
      const readings = field.phase === "collect" ? field.before : field.after;
      return fieldPads.filter((pad) => readings[pad.id] === undefined);
    }
  }
}

export function atFieldSite(session: Session, site: { x: number; z: number }) {
  return (
    session.player.grounded &&
    Math.abs(session.player.position.y) <= 0.5 &&
    horizontalDistance(session.player.position, site) <= fieldRange
  );
}

export function fieldTarget(field: FieldState, session: Session) {
  if (session.phase !== "playing") return undefined;
  return fieldDestinations(field).find((site) => atFieldSite(session, site));
}

export function useFieldSite(
  field: FieldState,
  session: Session,
  id: unknown,
): FieldState {
  if (fieldTarget(field, session)?.id !== id || typeof id !== "string")
    return field;
  if (field.phase === "located") return field;
  const pad = fieldPads.find((point) => point.id === id);
  if (!pad) return field;
  const restored = field.phase === "recheck";
  const result = solveDC(fieldCircuit(restored));
  if (!result.ok) return field;
  const node = restored && pad.node === "FEED" ? "VCC" : pad.node;
  const reading = result.voltages[node];
  if (!restored)
    return {
      ...field,
      before: { ...field.before, [pad.id]: reading },
      last: pad.id,
    };
  const after = { ...field.after, [pad.id]: reading };
  const verified =
    fieldPads.every((point) => {
      const restoredNode = point.node === "FEED" ? "VCC" : point.node;
      return (
        Math.abs(
          (after[point.id] ?? Infinity) - result.voltages[restoredNode],
        ) <= 1e-8
      );
    }) && result.currents.R1 > 0;
  return {
    ...field,
    phase: verified ? "verified" : "recheck",
    after,
    last: pad.id,
  };
}

export function localizeFieldFault(
  field: FieldState,
  fault: unknown,
  upstream: unknown,
  downstream: unknown,
): FieldState {
  if (
    !field.notebook ||
    field.phase !== "collect" ||
    !["source", "feed", "divider"].some((choice) => choice === fault) ||
    !fieldPads.some((pad) => pad.id === upstream) ||
    !fieldPads.some((pad) => pad.id === downstream) ||
    upstream === downstream ||
    !fieldPads.every((pad) => field.before[pad.id] !== undefined)
  )
    return field;
  const located = fault === "feed" && upstream === "P1" && downstream === "P2";
  return located
    ? { ...field, phase: "located", incorrect: false }
    : { ...field, incorrect: true };
}
