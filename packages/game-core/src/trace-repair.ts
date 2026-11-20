import { solveDC } from "@spark/electronics";

export const traceStages = [
  "isolate",
  "expose",
  "clean",
  "flux",
  "tin",
  "prepare",
  "route",
  "solder",
  "rinse",
  "continuity",
  "seal",
  "restore",
  "done",
] as const;

export type TraceStage = (typeof traceStages)[number];
export type TraceDifficulty = "apprentice" | "technician" | "engineer";
export type TracePoint = Readonly<{ x: number; z: number }>;
export const traceEnds = [
  { x: 0, z: -0.69 },
  { x: 0, z: 0.69 },
] as const;
export const jumperTray = { x: -1.08, z: 0.34 } as const;
export const traceRoute = [
  traceEnds[0],
  { x: 0.55, z: 0 },
  traceEnds[1],
] as const;
export const traceTickMs = 50;

export const traceTuning = {
  apprentice: { radius: 0.29, minimum: 44, maximum: 91 },
  technician: { radius: 0.22, minimum: 52, maximum: 84 },
  engineer: { radius: 0.15, minimum: 60, maximum: 76 },
} as const;

export type TraceMessage =
  | "ready"
  | "power-off"
  | "power-on"
  | "need-power-off"
  | "keep-isolated"
  | "miss"
  | "lifted"
  | "hot"
  | "release"
  | "contact-good"
  | "route-order"
  | "continuity-open"
  | "clean-first"
  | "continuity-pass";

export interface TraceRepair {
  readonly stage: TraceStage;
  readonly ends: readonly [boolean, boolean];
  readonly route: number;
  readonly heat: number;
  readonly ticks: number;
  readonly contact: 0 | 1 | null;
  readonly latched: boolean;
  readonly message: TraceMessage;
}

export function createTraceRepair(): TraceRepair {
  return {
    stage: "isolate",
    ends: [false, false],
    route: 0,
    heat: 0,
    ticks: 0,
    contact: null,
    latched: false,
    message: "ready",
  };
}

export const tracePowered = (stage: TraceStage) =>
  stage === "isolate" || stage === "done";

export function tracePast(stage: TraceStage, checkpoint: TraceStage) {
  return traceStages.indexOf(stage) > traceStages.indexOf(checkpoint);
}

export function cancelTraceContact(state: TraceRepair): TraceRepair {
  if (!state.latched && !state.ticks && !state.heat && state.contact === null)
    return state;
  return {
    ...state,
    heat: 0,
    ticks: 0,
    contact: null,
    latched: false,
    message: "lifted",
  };
}

function report(state: TraceRepair, message: TraceMessage): TraceRepair {
  return state.message === message ? state : { ...state, message };
}

function nextStage(
  state: TraceRepair,
  message: TraceMessage,
  latched = false,
): TraceRepair {
  return {
    ...state,
    stage: traceStages[traceStages.indexOf(state.stage) + 1],
    ends: [false, false],
    heat: 0,
    contact: null,
    ticks: 0,
    message,
    latched,
  };
}

function finishEnd(
  state: TraceRepair,
  end: 0 | 1,
  latched: boolean,
): TraceRepair {
  const ends: [boolean, boolean] = [state.ends[0], state.ends[1]];
  ends[end] = true;
  return ends.every(Boolean)
    ? nextStage(state, "contact-good", latched)
    : {
        ...state,
        ends,
        contact: null,
        heat: 0,
        ticks: 0,
        latched,
        message: "contact-good",
      };
}

// The board supply is isolated here. This closed test fixture uses the same
// ideal solver as field voltage and maps both pads to one node only after both joints.
function testContinuity(joined: boolean) {
  const result = solveDC({
    ground: "GND",
    nodes: joined ? ["GND", "SOURCE"] : ["GND", "SOURCE", "LOAD"],
    components: [
      { id: "TEST", kind: "voltage-source", a: "SOURCE", b: "GND", volts: 1 },
      {
        id: "SENSE",
        kind: "resistor",
        a: joined ? "SOURCE" : "LOAD",
        b: "GND",
        ohms: 1000,
      },
    ],
  });
  return result.ok && result.currents.SENSE > 0;
}

export function commandTraceRepair(
  state: TraceRepair,
  event: unknown,
  difficulty: TraceDifficulty,
): TraceRepair {
  if (
    !event ||
    typeof event !== "object" ||
    !("type" in event) ||
    state.stage === "done"
  )
    return state;

  if (event.type === "power") {
    if (state.stage === "isolate") return nextStage(state, "power-off");
    if (state.stage === "restore") return nextStage(state, "power-on");
    return report(state, "keep-isolated");
  }
  if (event.type === "continuity") {
    if (tracePowered(state.stage)) return report(state, "need-power-off");
    if (!testContinuity(tracePast(state.stage, "solder")))
      return report(state, "continuity-open");
    if (state.stage === "rinse") return report(state, "clean-first");
    if (state.stage === "continuity")
      return nextStage(state, "continuity-pass");
    return report(state, "continuity-pass");
  }

  const tuning = traceTuning[difficulty];
  const thermal = state.stage === "tin" || state.stage === "solder";
  if (event.type === "cancel") return cancelTraceContact(state);
  if (event.type === "release") {
    if (thermal && state.contact !== null && !state.latched) {
      if (
        state.heat >= tuning.minimum &&
        state.heat <= tuning.maximum &&
        state.ticks >= 8
      )
        return finishEnd(state, state.contact, false);
      return { ...cancelTraceContact(state), message: "lifted" };
    }
    return state.latched
      ? { ...state, latched: false, heat: 0 }
      : cancelTraceContact(state);
  }
  if (
    event.type !== "contact" ||
    !("x" in event) ||
    !("z" in event) ||
    typeof event.x !== "number" ||
    typeof event.z !== "number" ||
    !Number.isFinite(event.x) ||
    !Number.isFinite(event.z)
  )
    return state;
  if (tracePowered(state.stage)) return report(state, "need-power-off");
  if (
    state.latched ||
    state.stage === "restore" ||
    state.stage === "continuity"
  )
    return state;

  const { x, z } = event;
  const hits = (point: TracePoint) =>
    Math.hypot(x - point.x, z - point.z) <= tuning.radius;
  if (state.stage === "route") {
    const point = traceRoute[state.route];
    if (!point || !hits(point))
      return traceRoute.slice(state.route + 1).some(hits)
        ? report(state, "route-order")
        : state;
    const routed = {
      ...state,
      route: state.route + 1,
      message: "contact-good",
    } as const;
    return routed.route === traceRoute.length
      ? nextStage(routed, "contact-good", true)
      : routed;
  }
  if (state.stage === "prepare") {
    if (!hits(jumperTray)) return report(cancelTraceContact(state), "miss");
    if (state.ticks < 4)
      return { ...state, ticks: state.ticks + 1, message: "ready" };
    return nextStage(state, "contact-good", true);
  }

  const end = hits(traceEnds[0]) ? 0 : hits(traceEnds[1]) ? 1 : null;
  if (end === null || state.ends[end])
    return report(cancelTraceContact(state), "miss");
  if (state.contact !== null && state.contact !== end)
    return { ...cancelTraceContact(state), latched: true, message: "lifted" };
  const ticks = state.ticks + 1;
  if (!thermal && ticks >= (state.stage === "expose" ? 5 : 4))
    return finishEnd(state, end, true);
  const heat = thermal
    ? state.heat + (state.heat >= tuning.minimum ? 3 : 5)
    : 0;
  if (heat > tuning.maximum)
    return {
      ...state,
      ticks: 0,
      contact: null,
      heat: Math.min(100, heat),
      latched: true,
      message: "hot",
    };
  return {
    ...state,
    ticks,
    contact: end,
    heat,
    message: heat >= tuning.minimum ? "release" : "ready",
  };
}
