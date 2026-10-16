import { describe, expect, it } from "vitest";
import type { DCCircuit, DCComponent, DCResult } from "@spark/shared";
import { solveDC, dcLimits } from "./index";
const source: DCComponent = {
  id: "V1",
  kind: "voltage-source",
  a: "VCC",
  b: "GND",
  volts: 5,
};
const r = (
  id: string,
  a: string,
  b: string,
  ohms: number,
  open = false,
): DCComponent => ({ id, kind: "resistor", a, b, ohms, open });
const circuit = (
  components: readonly DCComponent[],
  nodes: readonly string[] = ["GND", "VCC"],
): DCCircuit => ({ ground: "GND", nodes, components });
function solved(result: DCResult) {
  if (!result.ok) throw new Error(result.error);
  return result;
}
const divider = circuit(
  [source, r("R1", "VCC", "SENSE", 1000), r("R2", "SENSE", "GND", 1000)],
  ["GND", "VCC", "SENSE"],
);
describe("linear DC MNA", () => {
  it("matches Ohm law with source current positive a to b", () => {
    const s = solved(solveDC(circuit([source, r("R1", "VCC", "GND", 1000)])));
    expect(s.voltages).toEqual({ GND: 0, VCC: 5 });
    expect(s.currents.R1).toBeCloseTo(0.005, 12);
    expect(s.currents.V1).toBeCloseTo(-0.005, 12);
  });
  it("solves a series divider and parallel loading analytically", () => {
    const s = solved(solveDC(divider));
    expect(s.voltages.SENSE).toBeCloseTo(2.5, 12);
    expect(s.currents.R1).toBeCloseTo(0.0025, 12);
    const p = solved(
      solveDC(
        circuit(
          [...divider.components, r("R3", "SENSE", "GND", 1000)],
          divider.nodes,
        ),
      ),
    );
    expect(p.voltages.SENSE).toBeCloseTo(5 / 3, 12);
    expect(p.currents.R2).toBeCloseTo(1 / 600, 12);
  });
  it("supports a voltage source between non-ground nodes and negative polarity", () => {
    const c = circuit(
      [
        { id: "V1", kind: "voltage-source", a: "A", b: "B", volts: 6 },
        r("R1", "A", "GND", 1000),
        r("R2", "B", "GND", 2000),
      ],
      ["GND", "A", "B"],
    );
    const s = solved(solveDC(c));
    expect(s.voltages.A).toBeCloseTo(2, 12);
    expect(s.voltages.B).toBeCloseTo(-4, 12);
    expect(s.currents.V1).toBeCloseTo(-0.002, 12);
    const reversed = solved(
      solveDC(circuit([{ ...source, volts: -5 }, r("R1", "VCC", "GND", 1000)])),
    );
    expect(reversed.currents.R1).toBeCloseTo(-0.005, 12);
  });
  it("models an open resistor without injecting grounding conductance", () => {
    const s = solved(
      solveDC({
        ...divider,
        components: [
          source,
          r("R1", "VCC", "SENSE", 1000, true),
          r("R2", "SENSE", "GND", 1000),
        ],
      }),
    );
    expect(s.voltages.SENSE).toBe(0);
    expect(s.currents.R1).toBe(0);
    expect(s.currents.R2).toBe(0);
    expect(s.currents.V1).toBe(0);
  });
  it("permits a no-load source, self-connected resistors and ground-only circuit", () => {
    const s = solved(solveDC(circuit([source, r("R1", "VCC", "VCC", 1000)])));
    expect(s.currents.R1).toBe(0);
    expect(s.currents.V1).toBe(0);
    expect(solveDC(circuit([], ["GND"]))).toEqual({
      ok: true,
      voltages: { GND: 0 },
      currents: {},
    });
  });
  it("detects floating nodes including a disconnected open branch", () => {
    expect(
      solveDC(
        circuit(
          [source, r("R1", "VCC", "SENSE", 1000, true)],
          ["GND", "VCC", "SENSE"],
        ),
      ),
    ).toEqual({ ok: false, error: "floating-node" });
    expect(
      solveDC(circuit([r("R1", "A", "B", 1000)], ["GND", "A", "B"])),
    ).toEqual({ ok: false, error: "floating-node" });
  });
  it.each([5, 6])(
    "rejects redundant or contradictory parallel ideal sources (%s V)",
    (volts) => {
      expect(
        solveDC(
          circuit([
            source,
            { id: "V2", kind: "voltage-source", a: "VCC", b: "GND", volts },
          ]),
        ),
      ).toEqual({ ok: false, error: "singular-system" });
    },
  );
  it("validates KCL and signed power balance over several unequal networks", () => {
    for (const volts of [-12, 0, 3.3, 24])
      for (const resistance of [1, 1000, 1e6]) {
        const c = circuit(
          [
            { ...source, volts },
            r("R1", "VCC", "SENSE", resistance),
            r("R2", "SENSE", "GND", resistance * 2),
            r("R3", "SENSE", "GND", resistance * 3),
          ],
          divider.nodes,
        );
        const s = solved(solveDC(c));
        for (const node of c.nodes) {
          const leaving = c.components.reduce(
            (sum, item) =>
              sum +
              (item.a === node ? s.currents[item.id] : 0) -
              (item.b === node ? s.currents[item.id] : 0),
            0,
          );
          expect(leaving).toBeCloseTo(0, 8);
        }
        const power = c.components.reduce(
          (sum, item) =>
            sum +
            (s.voltages[item.a] - s.voltages[item.b]) * s.currents[item.id],
          0,
        );
        expect(power).toBeCloseTo(0, 8);
        expect(s.voltages.SENSE).toBeCloseTo(
          (volts * (6 / 5)) / (1 + 6 / 5),
          8,
        );
      }
  });
  it("is immutable, JSON serializable and independent of input order", () => {
    const frozen = Object.freeze({
      ...divider,
      nodes: Object.freeze([...divider.nodes]),
      components: Object.freeze(
        divider.components.map((c) => Object.freeze({ ...c })),
      ),
    });
    const a = solveDC(frozen);
    const b = solveDC({
      ...divider,
      nodes: [...divider.nodes].reverse(),
      components: [...divider.components].reverse(),
    });
    expect(b).toEqual(a);
    expect(JSON.parse(JSON.stringify(a))).toEqual(a);
    expect(
      Object.values(solved(a).voltages).every((v) => !Object.is(v, -0)),
    ).toBe(true);
  });
  it("handles supported resistance and source bounds and rejects ill-conditioned loops explicitly", () => {
    for (const ohms of [dcLimits.minOhms, dcLimits.maxOhms]) {
      const s = solved(
        solveDC(
          circuit([{ ...source, volts: 1000 }, r("R1", "VCC", "GND", ohms)]),
        ),
      );
      expect(s.currents.R1).toBeCloseTo(1000 / ohms, 8);
    }
    const result = solveDC(
      circuit([
        source,
        {
          id: "V2",
          kind: "voltage-source",
          a: "VCC",
          b: "GND",
          volts: 5.00000000001,
        },
      ]),
    );
    expect(result.ok).toBe(false);
  });
});
describe("untrusted circuit validation", () => {
  it.each([
    null,
    {},
    [],
    { ground: "GND", nodes: ["GND", "GND"], components: [] },
    { ground: "missing", nodes: ["GND"], components: [] },
    { ground: "GND", nodes: ["GND", "bad id"], components: [] },
    { ...divider, nodes: Array(17).fill("GND") },
    { ...divider, components: Array(33).fill(source) },
  ])("rejects invalid circuit %j", (value) =>
    expect(solveDC(value)).toEqual({ ok: false, error: "invalid-circuit" }),
  );
  it.each([0, -1, NaN, Infinity, 1e-4, 1e10])(
    "rejects unsupported resistance %s",
    (ohms) =>
      expect(solveDC(circuit([source, r("R1", "VCC", "GND", ohms)]))).toEqual({
        ok: false,
        error: "invalid-circuit",
      }),
  );
  it.each([NaN, Infinity, 1001])(
    "rejects unsupported source value %s",
    (volts) =>
      expect(solveDC(circuit([{ ...source, volts }]))).toEqual({
        ok: false,
        error: "invalid-circuit",
      }),
  );
  it.each([
    { ...source, id: "bad id" },
    { ...source, b: "missing" },
    { ...source, b: "VCC" },
    { ...source, id: "__proto__" },
    { id: "R1", kind: "resistor", a: "VCC", b: "GND", ohms: 1000, open: "yes" },
  ])("rejects invalid component %j", (component) =>
    expect(solveDC(circuit([component as DCComponent]))).toEqual({
      ok: false,
      error: "invalid-circuit",
    }),
  );
  it("rejects duplicate IDs and unsupported component categories", () => {
    expect(solveDC(circuit([source, source]))).toEqual({
      ok: false,
      error: "invalid-circuit",
    });
    expect(
      solveDC(
        circuit([
          {
            id: "C1",
            kind: "capacitor",
            a: "VCC",
            b: "GND",
          } as unknown as DCComponent,
        ]),
      ),
    ).toEqual({ ok: false, error: "unsupported-component" });
  });
});
