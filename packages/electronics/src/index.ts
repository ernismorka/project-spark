import type { DCComponent, DCCircuit, DCResult } from "@spark/shared";
export const dcLimits = {
  nodes: 16,
  components: 32,
  minOhms: 1e-3,
  maxOhms: 1e9,
  maxVolts: 1000,
  pivot: 1e-12,
  absoluteResidual: 1e-8,
  relativeResidual: 1e-8,
} as const;
const idPattern = /^[A-Za-z][A-Za-z0-9_-]{0,31}$/;
const record = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);
function validate(
  value: unknown,
): DCCircuit | "invalid-circuit" | "unsupported-component" {
  if (
    !record(value) ||
    !Array.isArray(value.nodes) ||
    value.nodes.length < 1 ||
    value.nodes.length > dcLimits.nodes ||
    !Array.isArray(value.components) ||
    value.components.length > dcLimits.components ||
    typeof value.ground !== "string"
  )
    return "invalid-circuit";
  if (
    !Array.from(value.nodes).every(
      (n) => typeof n === "string" && idPattern.test(n),
    ) ||
    new Set(value.nodes).size !== value.nodes.length ||
    !value.nodes.includes(value.ground)
  )
    return "invalid-circuit";
  const ids = new Set<string>();
  for (const c of value.components) {
    if (
      !record(c) ||
      typeof c.id !== "string" ||
      !idPattern.test(c.id) ||
      ids.has(c.id) ||
      typeof c.a !== "string" ||
      typeof c.b !== "string" ||
      !value.nodes.includes(c.a) ||
      !value.nodes.includes(c.b)
    )
      return "invalid-circuit";
    ids.add(c.id);
    if (c.kind === "resistor") {
      if (
        typeof c.ohms !== "number" ||
        !Number.isFinite(c.ohms) ||
        c.ohms < dcLimits.minOhms ||
        c.ohms > dcLimits.maxOhms ||
        (c.open !== undefined && typeof c.open !== "boolean")
      )
        return "invalid-circuit";
    } else if (c.kind === "voltage-source") {
      if (
        typeof c.volts !== "number" ||
        !Number.isFinite(c.volts) ||
        Math.abs(c.volts) > dcLimits.maxVolts ||
        c.a === c.b
      )
        return "invalid-circuit";
    } else return "unsupported-component";
  }
  return value as unknown as DCCircuit;
}
function linearSolve(matrix: number[][], rhs: number[]): number[] | null {
  const n = rhs.length;
  const a = matrix.map((row, i) => {
    const scale = Math.max(...row.map(Math.abs));
    return [
      ...row.map((v) => (scale ? v / scale : v)),
      scale ? rhs[i] / scale : rhs[i],
    ];
  });
  for (let k = 0; k < n; k++) {
    let pivot = k;
    for (let row = k + 1; row < n; row++)
      if (Math.abs(a[row][k]) > Math.abs(a[pivot][k])) pivot = row;
    if (Math.abs(a[pivot][k]) < dcLimits.pivot) return null;
    [a[k], a[pivot]] = [a[pivot], a[k]];
    for (let row = k + 1; row < n; row++) {
      const factor = a[row][k] / a[k][k];
      a[row][k] = 0;
      for (let col = k + 1; col <= n; col++) a[row][col] -= factor * a[k][col];
    }
  }
  const result = Array<number>(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let value = a[row][n];
    for (let col = row + 1; col < n; col++) value -= a[row][col] * result[col];
    result[row] = value / a[row][row];
  }
  return result;
}
export function solveDC(value: unknown): DCResult {
  const circuit = validate(value);
  if (typeof circuit === "string") return { ok: false, error: circuit };
  const order = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
  const nodes = [...circuit.nodes]
    .filter((n) => n !== circuit.ground)
    .sort(order);
  const components = [...circuit.components].sort((a, b) => order(a.id, b.id));
  const connected = new Set([circuit.ground]);
  for (let pass = 0; pass < circuit.nodes.length; pass++)
    for (const c of components)
      if (!(c.kind === "resistor" && c.open)) {
        if (connected.has(c.a)) connected.add(c.b);
        if (connected.has(c.b)) connected.add(c.a);
      }
  if (connected.size !== circuit.nodes.length)
    return { ok: false, error: "floating-node" };
  const sources = components.filter((c) => c.kind === "voltage-source");
  const n = nodes.length,
    size = n + sources.length;
  const matrix = Array.from({ length: size }, () =>
    Array<number>(size).fill(0),
  );
  const rhs = Array<number>(size).fill(0);
  const nodeIndex = new Map(nodes.map((id, i) => [id, i]));
  const stamp = (
    row: number | undefined,
    col: number | undefined,
    amount: number,
  ) => {
    if (row !== undefined && col !== undefined) matrix[row][col] += amount;
  };
  for (const c of components)
    if (c.kind === "resistor" && !c.open) {
      const a = nodeIndex.get(c.a),
        b = nodeIndex.get(c.b),
        g = 1 / c.ohms;
      stamp(a, a, g);
      stamp(b, b, g);
      stamp(a, b, -g);
      stamp(b, a, -g);
    }
  sources.forEach((c, i) => {
    const a = nodeIndex.get(c.a),
      b = nodeIndex.get(c.b),
      index = n + i;
    stamp(a, index, 1);
    stamp(b, index, -1);
    stamp(index, a, 1);
    stamp(index, b, -1);
    rhs[index] = c.volts;
  });
  const solution = linearSolve(matrix, rhs);
  if (!solution) return { ok: false, error: "singular-system" };
  if (!solution.every(Number.isFinite))
    return { ok: false, error: "numerical-failure" };
  for (let row = 0; row < size; row++) {
    const products = matrix[row].map((v, col) => v * solution[col]);
    const residual = Math.abs(products.reduce((a, b) => a + b, 0) - rhs[row]);
    const scale =
      Math.abs(rhs[row]) + products.reduce((sum, v) => sum + Math.abs(v), 0);
    if (
      residual >
      dcLimits.absoluteResidual + dcLimits.relativeResidual * scale
    )
      return { ok: false, error: "numerical-failure" };
  }
  const clean = (x: number) => (Object.is(x, -0) ? 0 : x);
  // fromEntries creates own data properties even for unusual IDs; no prototype mutation.
  const voltages = Object.fromEntries([
    [circuit.ground, 0],
    ...nodes.map((id, i) => [id, clean(solution[i])]),
  ]) as Record<string, number>;
  const current = (c: DCComponent): number =>
    c.kind === "resistor"
      ? c.open
        ? 0
        : (voltages[c.a] - voltages[c.b]) / c.ohms
      : solution[n + sources.findIndex((s) => s.id === c.id)];
  const currents = Object.fromEntries(
    components.map((c) => [c.id, clean(current(c))]),
  );
  return { ok: true, voltages, currents };
}
