import { solveDC } from "@spark/electronics";
import type { DCCircuit, Session } from "@spark/shared";
import { components, horizontalDistance, movement } from "./world";
export const diagnosticCircuit: DCCircuit = {
  ground: "GND",
  nodes: ["GND", "VCC", "SENSE"],
  components: [
    { id: "V1", kind: "voltage-source", a: "VCC", b: "GND", volts: 5 },
    {
      id: "R1",
      kind: "resistor",
      a: "VCC",
      b: "SENSE",
      ohms: 1000,
      open: true,
    },
    { id: "R2", kind: "resistor", a: "SENSE", b: "GND", ohms: 1000 },
  ],
};
export const diagnosticPoints = ["VCC", "SENSE"] as const;
export function diagnosticCommand(
  state: Session,
  value: unknown,
): Session | undefined {
  if (
    !value ||
    typeof value !== "object" ||
    !("type" in value) ||
    typeof value.type !== "string" ||
    ![
      "open-diagnostics",
      "close-diagnostics",
      "measure-node",
      "submit-diagnosis",
      "repair-r1",
      "measure-repair",
      "verify-repair",
    ].includes(String(value.type))
  )
    return undefined;
  if (value.type === "open-diagnostics") {
    if (
      state.phase !== "complete" ||
      state.step !== 5 ||
      horizontalDistance(
        state.player.position,
        components.find((c) => c.id === "T1")!,
      ) > movement.interactionRange ||
      Math.abs(state.player.position.y) > 2
    )
      return state;
    return {
      ...state,
      phase: "diagnosing",
      diagnosis: state.diagnosis ?? {
        readings: {},
        outcome: "collect-evidence",
        attempts: 0,
      },
    };
  }
  if (state.phase !== "diagnosing" || !state.diagnosis) return state;
  if (value.type === "close-diagnostics")
    return { ...state, phase: "complete" };
  // Local command authority: only a diagnosed, nearby terminal session can repair.
  // No client-supplied circuit, voltage or completion flag is accepted.
  if (["repair-r1", "measure-repair", "verify-repair"].includes(value.type)) {
    if (
      state.step !== 5 ||
      state.diagnosis.outcome !== "identified" ||
      !diagnosticPoints.every((p) =>
        Object.hasOwn(state.diagnosis!.readings, p),
      ) ||
      horizontalDistance(
        state.player.position,
        components.find((c) => c.id === "T1")!,
      ) > movement.interactionRange ||
      Math.abs(state.player.position.y) > 2
    )
      return state;
    if (value.type === "repair-r1") {
      if (
        !("target" in value) ||
        value.target !== "R1" ||
        state.repair.r1 !== "open"
      )
        return state;
      return {
        ...state,
        repair: { r1: "restored", readings: {}, completed: false },
      };
    }
    if (state.repair.r1 !== "restored" || state.repair.completed) return state;
    const result = solveDC(episodeCircuit(state));
    if (!result.ok) return state;
    if (value.type === "measure-repair") {
      if (
        !("target" in value) ||
        !diagnosticPoints.some((p) => p === value.target)
      )
        return state;
      const point = value.target as (typeof diagnosticPoints)[number];
      if (Object.hasOwn(state.repair.readings, point)) return state;
      return {
        ...state,
        repair: {
          ...state.repair,
          readings: {
            ...state.repair.readings,
            [point]: result.voltages[point],
          },
        },
      };
    }
    if (
      !diagnosticPoints.every(
        (p) =>
          Object.hasOwn(state.repair.readings, p) &&
          state.repair.readings[p] === result.voltages[p],
      )
    )
      return state;
    const r1 = diagnosticCircuit.components.find((c) => c.id === "R1")!;
    const r2 = diagnosticCircuit.components.find((c) => c.id === "R2")!;
    if (
      r1.kind !== "resistor" ||
      r2.kind !== "resistor" ||
      Math.abs(
        result.voltages.SENSE -
          (result.voltages.VCC * r2.ohms) / (r1.ohms + r2.ohms),
      ) > 1e-8 ||
      result.currents.R1 <= 0
    )
      return state;
    return { ...state, repair: { ...state.repair, completed: true } };
  }
  if (state.diagnosis.outcome === "identified") return state;
  if (value.type === "measure-node") {
    if (
      !("target" in value) ||
      !diagnosticPoints.some((p) => p === value.target)
    )
      return state;
    const point = value.target as (typeof diagnosticPoints)[number];
    if (Object.hasOwn(state.diagnosis.readings, point)) return state;
    const result = solveDC(episodeCircuit(state));
    if (!result.ok) return state;
    return {
      ...state,
      diagnosis: {
        ...state.diagnosis,
        readings: {
          ...state.diagnosis.readings,
          [point]: result.voltages[point],
        },
      },
    };
  }
  if (value.type === "submit-diagnosis") {
    if (
      !("fault" in value) ||
      !["r1-open", "r2-open", "source-off"].some(
        (fault) => fault === value.fault,
      ) ||
      !diagnosticPoints.every((p) =>
        Object.hasOwn(state.diagnosis!.readings, p),
      )
    )
      return state;
    return {
      ...state,
      diagnosis: {
        ...state.diagnosis,
        outcome: value.fault === "r1-open" ? "identified" : "incorrect",
        attempts: state.diagnosis.attempts + 1,
      },
    };
  }
  return state;
}

/** A fixed episode instance, not a general editor. The M2 solver stays unchanged. */
export function episodeCircuit(state: Session): DCCircuit {
  return {
    ...diagnosticCircuit,
    components: diagnosticCircuit.components.map((c) =>
      c.id === "R1" && c.kind === "resistor"
        ? { ...c, open: state.repair.r1 === "open" }
        : c,
    ),
  };
}
