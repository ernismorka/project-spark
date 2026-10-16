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
  if (state.diagnosis.outcome === "identified") return state;
  if (value.type === "measure-node") {
    if (
      !("target" in value) ||
      !diagnosticPoints.some((p) => p === value.target)
    )
      return state;
    const point = value.target as (typeof diagnosticPoints)[number];
    if (Object.hasOwn(state.diagnosis.readings, point)) return state;
    const result = solveDC(diagnosticCircuit);
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
