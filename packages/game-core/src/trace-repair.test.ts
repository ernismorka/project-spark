import { expect, it } from "vitest";
import {
  commandTraceRepair,
  createTraceRepair,
  traceEnds,
  tracePowered,
  traceRoute,
  type TraceRepair,
} from "./trace-repair";

const act = (state: TraceRepair, event: unknown) =>
  commandTraceRepair(state, event, "technician");

it("refuses work and continuity while powered and tightens aim tolerance by difficulty", () => {
  const live = createTraceRepair();
  const contact = { type: "contact", ...traceEnds[0] };
  expect(act(live, contact)).toMatchObject({
    stage: "isolate",
    message: "need-power-off",
  });
  const isolated = act(live, { type: "power" });
  expect(tracePowered(isolated.stage)).toBe(false);
  expect(act(isolated, { type: "contact", x: NaN, z: 0 })).toBe(isolated);
  const edge = { ...contact, x: 0.18 };
  expect(commandTraceRepair(isolated, edge, "apprentice").ticks).toBe(1);
  expect(commandTraceRepair(isolated, edge, "engineer").message).toBe("miss");
});

it("keeps already finished contacts when another joint is lifted too soon or overheated", () => {
  const base: TraceRepair = {
    ...createTraceRepair(),
    stage: "solder",
    route: 3,
    ends: [true, false],
  };
  const touch = { type: "contact", ...traceEnds[1] };
  let state = act(act(base, touch), { type: "release" });
  expect(state).toMatchObject({
    message: "lifted",
    ends: [true, false],
    stage: "solder",
  });
  for (let i = 0; i < 25; i++) state = act(state, touch);
  expect(state).toMatchObject({
    message: "hot",
    latched: true,
    ends: [true, false],
  });
  expect(act(state, touch)).toBe(state);
  state = act(state, { type: "release" });
  for (let i = 0; i < 13; i++) state = act(state, touch);
  expect(state.message).toBe("release");
  expect(act(state, { type: "release" }).stage).toBe("rinse");
});

it("requires all routing anchors in order while letting the same drag recover", () => {
  const route: TraceRepair = { ...createTraceRepair(), stage: "route" };
  const wrong = act(route, { type: "contact", ...traceRoute[2] });
  expect(wrong).toMatchObject({ route: 0, message: "route-order" });
  const done = traceRoute.reduce(
    (state, point) => act(state, { type: "contact", ...point }),
    wrong,
  );
  expect(done).toMatchObject({ stage: "solder", route: 3 });
});
