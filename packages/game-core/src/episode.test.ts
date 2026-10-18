import { expect, it } from "vitest";
import {
  createEpisode,
  commandEpisode as send,
  episodeStage,
  createWorkbench,
  commandWorkbench,
} from "./index";
import type { Episode } from "./episode";
const terminal = (): Episode => {
  const e = createEpisode();
  return {
    ...e,
    session: {
      ...e.session,
      phase: "complete",
      step: 5,
      player: { ...e.session.player, position: { x: 2, y: 0, z: -16 } },
    },
  };
};
const bench = (e: Episode, command: unknown) =>
  send(e, { type: "workbench", command });
function repair() {
  let e = send(terminal(), { type: "open-diagnostics" });
  for (const target of ["VCC", "SENSE"])
    e = send(e, { type: "measure-node", target });
  e = send(e, { type: "submit-diagnosis", fault: "r1-open" });
  e = send(e, { type: "repair-r1", target: "R1" });
  for (const target of ["VCC", "SENSE"])
    e = send(e, { type: "measure-repair", target });
  e = send(e, { type: "verify-repair" });
  return send(e, { type: "close-diagnostics" });
}
function construct() {
  let e = bench(repair(), {
    type: "part",
    part: { id: "R3", a: "SENSE", b: "GND", ohms: 1000 },
  });
  e = bench(e, { type: "run" });
  return e;
}
function program() {
  return bench(
    bench(construct(), {
      type: "text",
      text: "READ SENSE\nABOVE 1\nWRITE OUT",
    }),
    { type: "run" },
  );
}
it("locks construction and activation until the existing repair is verified", () => {
  for (const e of [createEpisode(), terminal()]) {
    expect(bench(e, { type: "run" })).toBe(e);
    expect(
      send(e, { type: "activate-device", completed: true, output: true }),
    ).toBe(e);
  }
  expect(episodeStage(repair())).toBe("construction");
  const locked = repair();
  expect(
    bench(locked, { type: "text", text: "READ SENSE\nABOVE 1\nWRITE OUT" }),
  ).toBe(locked);
  expect(repair().session.repair.readings).toEqual({ VCC: 5, SENSE: 2.5 });
});
it("requires construction evidence before an equivalent block/text controller can be commissioned", () => {
  const constructed = construct();
  expect(episodeStage(constructed)).toBe("programming");
  expect(
    constructed.workbench.result?.ok &&
      constructed.workbench.result.voltages.SENSE,
  ).toBeCloseTo(5 / 3);
  expect(constructed.workbench.output).toBe(false);
  const text = program();
  const blocks = bench(
    bench(constructed, {
      type: "set-program",
      program: [{ op: "read" }, { op: "above", volts: 1 }, { op: "write" }],
    }),
    { type: "run" },
  );
  expect(text).toEqual(blocks);
  expect(episodeStage(text)).toBe("activation");
  expect(text.workbench.output).toBe(true);
  expect(send(constructed, { type: "activate-device" })).toBe(constructed);
});
it("rejects skipping the OFF construction proof, invalid source, bad output and budget exhaustion", () => {
  const e = bench(repair(), {
    type: "part",
    part: { id: "R3", a: "SENSE", b: "GND", ohms: 1000 },
  });
  const skipped = bench(
    bench(e, { type: "text", text: "READ SENSE\nABOVE 1\nWRITE OUT" }),
    { type: "run" },
  );
  expect(skipped.programmed).toBe(false);
  expect(send(skipped, { type: "activate-device" })).toBe(skipped);
  for (const text of [
    "eval('activate')",
    "READ SENSE\nABOVE 5\nWRITE OUT",
    "READ SENSE\nWRITE OUT\nREPEAT 128",
  ]) {
    const failed = bench(bench(construct(), { type: "text", text }), {
      type: "run",
    });
    expect(failed.programmed).toBe(false);
    expect(send(failed, { type: "activate-device" })).toBe(failed);
  }
});
it("invalidates commissioning after edits and resets construction evidence after circuit changes", () => {
  const ready = program();
  const edit = bench(ready, {
    type: "text",
    text: "READ SENSE\nABOVE 2\nWRITE OUT",
  });
  expect(edit.constructed).toBe(true);
  expect(edit.programmed).toBe(false);
  expect(send(edit, { type: "activate-device" })).toBe(edit);
  const circuit = bench(ready, { type: "remove", id: "R3" });
  expect(circuit.constructed).toBe(false);
  expect(circuit.programmed).toBe(false);
  expect(episodeStage(bench(ready, { type: "reset" }))).toBe("construction");
});
it("requires terminal phase/range and ignores client flags and invalid commands", () => {
  const e = program();
  for (const changed of [
    { ...e, session: { ...e.session, phase: "diagnosing" as const } },
    {
      ...e,
      session: {
        ...e.session,
        player: { ...e.session.player, position: { x: 20, y: 0, z: 30 } },
      },
    },
  ])
    expect(send(changed, { type: "activate-device" })).toBe(changed);
  for (const c of [
    null,
    {},
    { type: "complete", output: true },
    { type: "workbench", completed: true },
  ])
    expect(send(e, c)).toBe(e);
  expect(send(e, { type: "activate-device", voltage: 999 }).activated).toBe(
    true,
  );
});
it("revalidates the current solver/interpreter instead of relying on stale completion flags", () => {
  const e = program();
  const stale = {
    ...e,
    workbench: commandWorkbench(e.workbench, { type: "remove", id: "R1" }),
  };
  expect(send(stale, { type: "activate-device" })).toBe(stale);
});
it("completes once, preserves electrical state and serializes/replays deterministically", () => {
  const ready = program();
  const active = send(ready, { type: "activate-device" });
  expect(episodeStage(active)).toBe("complete");
  expect(active.session).toBe(ready.session);
  expect(send(active, { type: "activate-device" })).toBe(active);
  expect(bench(active, { type: "reset" })).toBe(active);
  expect(JSON.parse(JSON.stringify(active))).toEqual(active);
  expect(send(active, { type: "restart-episode" })).toEqual({
    ...createEpisode(),
    session: { ...createEpisode().session, phase: "playing" },
  });
  expect(send(ready, { type: "restart-episode" }).workbench).toEqual(
    createWorkbench(),
  );
});
it("keeps title practice isolated from episode credit and mutation", () => {
  const e = createEpisode();
  const practice = commandWorkbench(createWorkbench(), { type: "run" });
  expect(practice.output).toBe(true);
  expect(e).toEqual(createEpisode());
  expect(bench(e, { type: "run", result: practice })).toBe(e);
});
it("keeps the editor usable after a proved circuit is edited and permits revalidation", () => {
  let e = bench(program(), {
    type: "part",
    part: { id: "R3", a: "SENSE", b: "GND", ohms: 2000 },
  });
  expect(e.constructed).toBe(false);
  expect(e.programmingUnlocked).toBe(true);
  e = bench(e, {
    type: "part",
    part: { id: "R3", a: "SENSE", b: "GND", ohms: 1000 },
  });
  e = bench(
    bench(e, { type: "text", text: "READ SENSE\nABOVE 2\nWRITE OUT" }),
    { type: "run" },
  );
  expect(e.constructed).toBe(true);
  expect(bench(e, { type: "reset" }).programmingUnlocked).toBe(false);
});
