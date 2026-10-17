import { expect, it } from "vitest";
import {
  createWorkbench,
  workbenchChallenge,
  commandWorkbench as send,
  parseProgram,
  printProgram,
} from "./programming";
it("blocks and text share deterministic execution and solved inputs", () => {
  const s = createWorkbench();
  const a = send(s, { type: "run" });
  const b = send(send(s, { type: "text", text: printProgram(s.program) }), {
    type: "run",
  });
  expect(a).toEqual(b);
  expect(a.output).toBe(true);
  expect(a.result?.ok && a.result.voltages.SENSE).toBe(2.5);
  expect(send(s, { type: "run" })).toEqual(a);
});
it("building and removing actual branches changes solver-backed controller output", () => {
  let s = createWorkbench();
  s = send(s, {
    type: "part",
    part: { id: "R3", a: "SENSE", b: "GND", ohms: 1000 },
  });
  s = send(s, { type: "run" });
  expect(s.result?.ok && s.result.voltages.SENSE).toBeCloseTo(5 / 3);
  expect(s.output).toBe(false);
  s = send(send(s, { type: "remove", id: "R3" }), { type: "run" });
  expect(s.output).toBe(true);
  s = send(send(s, { type: "remove", id: "R1" }), { type: "remove", id: "R2" });
  expect(send(s, { type: "run" }).error).toBe("circuit");
});
it("rejects arbitrary code, malformed programs and out-of-bounds values", () => {
  for (const text of [
    "while(true){}",
    "READ window",
    "ABOVE NaN",
    "ABOVE 6",
    "REPEAT 0",
    "REPEAT 129",
    "WRITE OUT; alert(1)",
    "",
    "READ SENSE\n".repeat(33),
  ])
    expect(parseProgram(text)).toBeNull();
  const s = createWorkbench();
  expect(send(s, { type: "text", text: "eval('x')" }).error).toBe("program");
  for (const part of [
    { id: "R9", a: "VCC", b: "GND", ohms: 1 },
    { id: "R3", a: "SENSE", b: "SENSE", ohms: 1 },
    { id: "R3", a: "SENSE", b: "GND", ohms: 0 },
  ])
    expect(send(s, { type: "part", part })).toBe(s);
  expect(send(s, { type: "set-program", program: new Array(3) }).error).toBe(
    "program",
  );
});
it("bounds loops, clears output on failure and resets/replays serializably", () => {
  const s = send(createWorkbench(), {
    type: "text",
    text: "READ SENSE\nWRITE OUT\nREPEAT 128",
  });
  const r = send(s, { type: "run" });
  expect(r.error).toBe("budget");
  expect(r.trace).toHaveLength(128);
  expect(r.output).toBe(false);
  const finite = send(
    send(s, { type: "text", text: "READ SENSE\nABOVE 2\nWRITE OUT\nREPEAT 2" }),
    { type: "run" },
  );
  expect(finite.error).toBeNull();
  expect(finite.trace).toHaveLength(8);
  expect(JSON.parse(JSON.stringify(finite))).toEqual(finite);
  expect(send(finite, { type: "reset" })).toEqual(createWorkbench());
});
it("uses strict thresholds, finite block parameters and clears stale results", () => {
  const s = send(createWorkbench(), { type: "run" });
  const invalid = send(s, { type: "text", text: "alert(1)" });
  expect(invalid.output).toBe(false);
  expect(invalid.trace).toEqual([]);
  expect(send(invalid, { type: "run" })).toBe(invalid);
  for (const p of [
    [{ op: "above", volts: Infinity }],
    [{ op: "repeat", count: 1.5 }],
    Array.from({ length: 33 }, () => ({ op: "read" })),
  ])
    expect(send(s, { type: "set-program", program: p }).error).toBe("program");
  const equal = send(
    send(s, { type: "text", text: "READ SENSE\nABOVE 2.5\nWRITE OUT" }),
    { type: "run" },
  );
  expect(equal.output).toBe(false);
  expect(
    send(s, {
      type: "part",
      part: { id: "R3", a: "GND", b: "SENSE", ohms: 1000 },
    }).result,
  ).toBeNull();
});

it("awards the challenge only for its solved circuit and program, not a disconnected shortcut", () => {
  let s = send(createWorkbench(), {
    type: "part",
    part: { id: "R3", a: "SENSE", b: "GND", ohms: 1000 },
  });
  expect(workbenchChallenge(s)).toBe(false);
  s = send(s, { type: "run" });
  expect(workbenchChallenge(s)).toBe(true);
  s = send(send(s, { type: "remove", id: "R1" }), { type: "run" });
  expect(workbenchChallenge(s)).toBe(false);
});
it("round trips finite small block thresholds without losing text equivalence", () => {
  const program = [
    { op: "read" as const },
    { op: "above" as const, volts: 1e-7 },
    { op: "write" as const },
  ];
  expect(parseProgram(printProgram(program))).toEqual(program);
});
