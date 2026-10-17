import { solveDC } from "@spark/electronics";
import type { DCCircuit, DCResult } from "@spark/shared";
export type Instruction =
  | { op: "read" }
  | { op: "above"; volts: number }
  | { op: "write" }
  | { op: "repeat"; count: number };
export interface Part {
  id: string;
  a: string;
  b: string;
  ohms: number;
}
export interface Workbench {
  parts: readonly Part[];
  program: readonly Instruction[];
  result: DCResult | null;
  trace: readonly {
    step: number;
    op: string;
    value: number;
    output: boolean;
  }[];
  output: boolean;
  error: "circuit" | "program" | "budget" | null;
}
export const programmingLimits = {
  instructions: 32,
  steps: 128,
  parts: 8,
  text: 2048,
} as const;
export function createWorkbench(): Workbench {
  return {
    parts: [
      { id: "R1", a: "VCC", b: "SENSE", ohms: 1000 },
      { id: "R2", a: "SENSE", b: "GND", ohms: 1000 },
    ],
    program: [{ op: "read" }, { op: "above", volts: 2 }, { op: "write" }],
    result: null,
    trace: [],
    output: false,
    error: null,
  };
}
const nodes = ["VCC", "SENSE", "GND"];
export function workbenchCircuit(parts: readonly Part[]): DCCircuit {
  return {
    ground: "GND",
    nodes,
    components: [
      { id: "V1", kind: "voltage-source", a: "VCC", b: "GND", volts: 5 },
      ...parts.map((p) => ({ ...p, kind: "resistor" as const })),
    ],
  };
}
export function parseProgram(text: unknown): readonly Instruction[] | null {
  if (typeof text !== "string" || text.length > programmingLimits.text)
    return null;
  const lines = text.trim().split(/\r?\n/);
  if (!text.trim() || lines.length > programmingLimits.instructions)
    return null;
  const program: Instruction[] = [];
  for (const line of lines) {
    const tokens = line.trim().split(/\s+/);
    if (tokens.length === 2 && tokens[0] === "READ" && tokens[1] === "SENSE")
      program.push({ op: "read" });
    else if (
      tokens.length === 2 &&
      tokens[0] === "ABOVE" &&
      /^\d+(\.\d+)?$/.test(tokens[1])
    )
      program.push({ op: "above", volts: Number(tokens[1]) });
    else if (
      tokens.length === 2 &&
      tokens[0] === "WRITE" &&
      tokens[1] === "OUT"
    )
      program.push({ op: "write" });
    else if (
      tokens.length === 2 &&
      tokens[0] === "REPEAT" &&
      /^\d+$/.test(tokens[1])
    )
      program.push({ op: "repeat", count: Number(tokens[1]) });
    else return null;
  }
  return validProgram(program) ? program : null;
}
export function printProgram(program: readonly Instruction[]): string {
  return program
    .map((i) =>
      i.op === "read"
        ? "READ SENSE"
        : i.op === "above"
          ? "ABOVE " + i.volts
          : i.op === "write"
            ? "WRITE OUT"
            : "REPEAT " + i.count,
    )
    .join("\n");
}
function validProgram(value: unknown): value is readonly Instruction[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= programmingLimits.instructions &&
    Array.from(value).every(
      (i) =>
        i &&
        typeof i === "object" &&
        (i.op === "read" ||
          i.op === "write" ||
          (i.op === "above" &&
            Number.isFinite(i.volts) &&
            i.volts >= 0 &&
            i.volts <= 5) ||
          (i.op === "repeat" &&
            Number.isInteger(i.count) &&
            i.count >= 1 &&
            i.count <= 128)),
    )
  );
}
export function commandWorkbench(s: Workbench, c: unknown): Workbench {
  if (!c || typeof c !== "object" || !("type" in c)) return s;
  if (c.type === "reset") return createWorkbench();
  if (c.type === "set-program") {
    if (!("program" in c) || !validProgram(c.program))
      return { ...s, error: "program", output: false, trace: [], result: null };
    // Copy into a closed instruction representation; discard unrecognized properties.
    const program = c.program.map((i) =>
      i.op === "above"
        ? { op: i.op, volts: i.volts }
        : i.op === "repeat"
          ? { op: i.op, count: i.count }
          : { op: i.op },
    ) as Instruction[];
    return {
      ...s,
      program,
      result: null,
      trace: [],
      output: false,
      error: null,
    };
  }
  if (c.type === "text") {
    const p = parseProgram("text" in c ? c.text : null);
    return p
      ? commandWorkbench(s, { type: "set-program", program: p })
      : { ...s, error: "program", output: false, trace: [], result: null };
  }
  if (c.type === "part") {
    if (!("part" in c) || !c.part || typeof c.part !== "object") return s;
    const p = c.part as Part;
    if (
      !/^R[1-8]$/.test(p.id) ||
      !nodes.includes(p.a) ||
      !nodes.includes(p.b) ||
      p.a === p.b ||
      !Number.isFinite(p.ohms) ||
      p.ohms < 1 ||
      p.ohms > 1000000
    )
      return s;
    const parts = [
      ...s.parts.filter((x) => x.id !== p.id),
      { id: p.id, a: p.a, b: p.b, ohms: p.ohms },
    ].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    return { ...s, parts, result: null, trace: [], output: false, error: null };
  }
  if (c.type === "remove" && "id" in c && s.parts.some((p) => p.id === c.id))
    return {
      ...s,
      parts: s.parts.filter((p) => p.id !== c.id),
      result: null,
      trace: [],
      output: false,
      error: null,
    };
  if (c.type !== "run") return s;
  if (s.error === "program") return s;
  const result = solveDC(workbenchCircuit(s.parts));
  if (!result.ok)
    return { ...s, result, trace: [], output: false, error: "circuit" };
  if (!validProgram(s.program))
    return { ...s, result, trace: [], output: false, error: "program" };
  let value = 0,
    output = false,
    pc = 0,
    step = 0;
  const repeats = new Map<number, number>();
  const trace: Workbench["trace"][number][] = [];
  while (pc < s.program.length && step < programmingLimits.steps) {
    const i = s.program[pc];
    step++;
    if (i.op === "read") value = result.voltages.SENSE;
    if (i.op === "above") value = value > i.volts ? 1 : 0;
    if (i.op === "write") output = value !== 0;
    trace.push({ step, op: i.op, value, output });
    if (i.op === "repeat") {
      const left = repeats.get(pc) ?? i.count;
      if (left > 1) {
        repeats.set(pc, left - 1);
        pc = 0;
        continue;
      }
      repeats.delete(pc);
    }
    pc++;
  }
  // Budget exhaustion is atomic: no partial output is committed.
  return pc < s.program.length
    ? { ...s, result, trace, output: false, error: "budget" }
    : { ...s, result, trace, output, error: null };
}
