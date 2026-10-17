import { describe, expect, it } from "vitest";
import { commandSession, createSession, diagnosticCircuit } from "./index";
import { solveDC } from "@spark/electronics";
import type { Session } from "@spark/shared";
const terminal = (): Session => {
  const s = createSession();
  return {
    ...s,
    phase: "complete",
    step: 5,
    player: { ...s.player, position: { x: 3, y: 0, z: -18 } },
  };
};
const open = (s = terminal()) =>
  commandSession(s, { type: "open-diagnostics" });
const measure = (s: Session, target: string) =>
  commandSession(s, { type: "measure-node", target });
const submit = (s: Session, fault: string) =>
  commandSession(s, { type: "submit-diagnosis", fault });
describe("terminal diagnostic command boundary", () => {
  it("requires completed First Contact, terminal proximity and supported state", () => {
    for (const s of [
      createSession(),
      { ...terminal(), step: 4 },
      { ...terminal(), phase: "playing" as const },
      {
        ...terminal(),
        player: { ...terminal().player, position: { x: 20, y: 0, z: 20 } },
      },
      {
        ...terminal(),
        player: { ...terminal().player, position: { x: 0, y: 5, z: -18 } },
      },
    ])
      expect(open(s)).toBe(s);
    const s = open();
    expect(s.phase).toBe("diagnosing");
    expect(s.player).toEqual(terminal().player);
  });
  it("computes measurements, ignores supplied readings and deduplicates evidence", () => {
    const s = open();
    const a = commandSession(s, {
      type: "measure-node",
      target: "VCC",
      value: 999,
    });
    expect(a.diagnosis?.readings).toEqual({ VCC: 5 });
    expect(measure(a, "VCC")).toBe(a);
    const b = measure(a, "SENSE");
    expect(b.diagnosis?.readings).toEqual({ VCC: 5, SENSE: 0 });
    expect(measure(b, "GND")).toBe(b);
    expect(measure(b, "__proto__")).toBe(b);
    expect(measure(terminal(), "VCC")).toEqual(terminal());
  });
  it("rejects diagnoses without evidence and invalid answers without changing state", () => {
    let s = open();
    expect(submit(s, "r1-open")).toBe(s);
    s = measure(s, "VCC");
    expect(submit(s, "r1-open")).toBe(s);
    s = measure(s, "SENSE");
    expect(submit(s, "invented")).toBe(s);
    expect(commandSession(s, { type: "submit-diagnosis", fault: 17 })).toBe(s);
  });
  it("accepts evidence-based diagnosis and prevents duplicate completion", () => {
    let s = measure(measure(open(), "VCC"), "SENSE");
    s = submit(s, "r2-open");
    expect(s.diagnosis?.outcome).toBe("incorrect");
    expect(s.diagnosis?.attempts).toBe(1);
    s = submit(s, "source-off");
    expect(s.diagnosis?.outcome).toBe("incorrect");
    s = submit(s, "r1-open");
    expect(s.diagnosis?.outcome).toBe("identified");
    expect(s.diagnosis?.attempts).toBe(3);
    expect(submit(s, "r1-open")).toBe(s);
    expect(measure(s, "VCC")).toBe(s);
    expect(s.step).toBe(5);
  });
  it("retains evidence on close/reopen, is serializable and freezes movement", () => {
    const s = measure(open(), "VCC");
    expect(
      commandSession(s, { type: "step", x: 1, z: 0, jump: true, run: true }),
    ).toBe(s);
    const closed = commandSession(s, { type: "close-diagnostics" });
    expect(closed.phase).toBe("complete");
    expect(open(closed).diagnosis).toEqual(s.diagnosis);
    expect(JSON.parse(JSON.stringify(closed))).toEqual(closed);
  });
  it("matches the healthy reference and distinguishes all three training hypotheses", () => {
    const healthy = {
      ...diagnosticCircuit,
      components: diagnosticCircuit.components.map((c) =>
        c.kind === "resistor" ? { ...c, open: false } : c,
      ),
    };
    const h = solveDC(healthy);
    expect(h.ok && h.voltages.SENSE).toBe(2.5);
    const openR2 = solveDC({
      ...healthy,
      components: healthy.components.map((c) =>
        c.id === "R2" ? { ...c, open: true } : c,
      ),
    });
    expect(openR2.ok && openR2.voltages.SENSE).toBe(5);
    const off = solveDC({
      ...healthy,
      components: healthy.components.map((c) =>
        c.kind === "voltage-source" ? { ...c, volts: 0 } : c,
      ),
    });
    expect(off.ok && off.voltages.VCC).toBe(0);
    expect(off.ok && off.voltages.SENSE).toBe(0);
  });
});
