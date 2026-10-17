import { describe, expect, it } from "vitest";
import { commandSession as send, createSession, episodeCircuit } from "./index";
import { solveDC } from "@spark/electronics";
import type { Session } from "@spark/shared";
function terminal(): Session {
  const s = createSession();
  return send(
    {
      ...s,
      phase: "complete",
      step: 5,
      player: { ...s.player, position: { x: 3, y: 0, z: -18 } },
    },
    { type: "open-diagnostics" },
  );
}
function diagnosed() {
  let s = terminal();
  for (const target of ["VCC", "SENSE"])
    s = send(s, { type: "measure-node", target });
  return send(s, { type: "submit-diagnosis", fault: "r1-open" });
}
const repair = (s: Session) => send(s, { type: "repair-r1", target: "R1" });
function verified() {
  let s = repair(diagnosed());
  for (const target of ["VCC", "SENSE"])
    s = send(s, { type: "measure-repair", target });
  return send(s, { type: "verify-repair" });
}
describe("The Dark Circuit", () => {
  it("rejects repair before evidence and diagnosis, or outside terminal authority", () => {
    for (const s of [
      createSession(),
      terminal(),
      send(terminal(), { type: "measure-node", target: "VCC" }),
    ])
      expect(repair(s)).toBe(s);
    const d = diagnosed();
    for (const s of [
      { ...d, phase: "complete" as const },
      { ...d, step: 4 },
      { ...d, player: { ...d.player, position: { x: 20, y: 0, z: 0 } } },
      { ...d, player: { ...d.player, position: { x: 0, y: 3, z: -18 } } },
      { ...d, diagnosis: { ...d.diagnosis!, readings: {} } },
      { ...d, diagnosis: { ...d.diagnosis!, outcome: "incorrect" as const } },
    ])
      expect(repair(s)).toBe(s);
  });
  it("rejects invalid commands, unsupported repairs and duplicates", () => {
    const s = diagnosed();
    for (const cmd of [
      null,
      {},
      { type: "repair-r1" },
      { type: "repair-r1", target: "R2" },
      { type: "repair-r1", target: 17 },
      { type: "repair-r1", target: "__proto__" },
      { type: "repair-component", target: "R1" },
    ])
      expect(send(s, cmd)).toBe(s);
    const r = repair(s);
    expect(repair(r)).toBe(r);
    expect(r.diagnosis).toBe(s.diagnosis);
    expect(r.repair).toEqual({
      r1: "restored",
      readings: {},
      completed: false,
    });
  });
  it("solves the actual changed circuit and keeps before/after evidence separate", () => {
    const d = diagnosed();
    const before = solveDC(episodeCircuit(d));
    expect(before.ok && before.voltages).toEqual({ GND: 0, SENSE: 0, VCC: 5 });
    expect(before.ok && before.currents.R1).toBe(0);
    const r = repair(d);
    const after = solveDC(episodeCircuit(r));
    expect(after.ok && after.voltages.SENSE).toBe(2.5);
    expect(after.ok && after.currents.R1).toBeCloseTo(0.0025, 12);
    expect(after.ok && after.currents.R2).toBeCloseTo(0.0025, 12);
    const a = send(r, { type: "measure-repair", target: "SENSE", value: 999 });
    expect(a.repair.readings.SENSE).toBe(2.5);
    expect(a.diagnosis?.readings.SENSE).toBe(0);
    expect(send(a, { type: "measure-repair", target: "SENSE" })).toBe(a);
    expect(send(a, { type: "measure-repair", target: "GND" })).toBe(a);
  });
  it("requires fresh readings and explicit verification; completion is idempotent", () => {
    const d = diagnosed();
    expect(send(d, { type: "verify-repair" })).toBe(d);
    expect(send(d, { type: "measure-repair", target: "VCC" })).toBe(d);
    let r = repair(d);
    expect(send(r, { type: "verify-repair" })).toBe(r);
    r = send(r, { type: "measure-repair", target: "VCC" });
    expect(send(r, { type: "verify-repair" })).toBe(r);
    const v = verified();
    expect(v.repair.completed).toBe(true);
    expect(send(v, { type: "verify-repair" })).toBe(v);
    expect(repair(v)).toBe(v);
    expect(send(v, { type: "measure-repair", target: "VCC" })).toBe(v);
    const stale = {
      ...v,
      repair: { ...v.repair, completed: false, readings: { VCC: 5, SENSE: 0 } },
    };
    expect(send(stale, { type: "verify-repair" })).toBe(stale);
  });
  it("persists on close/reopen and serialization; replay restores the full episode", () => {
    for (const s of [diagnosed(), repair(diagnosed()), verified()]) {
      const closed = send(s, { type: "close-diagnostics" });
      expect(send(closed, { type: "open-diagnostics" })).toEqual(s);
      expect(JSON.parse(JSON.stringify(s))).toEqual(s);
      expect(send(s, { type: "restart-episode" })).toEqual({
        ...createSession(),
        phase: "playing",
      });
      expect(send(closed, { type: "restart-episode" })).toEqual({
        ...createSession(),
        phase: "playing",
      });
    }
    const s = createSession();
    expect(send(s, { type: "restart-episode" })).toBe(s);
    expect(verified()).toEqual(verified());
  });
});
