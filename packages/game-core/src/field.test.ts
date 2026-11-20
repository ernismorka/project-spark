import { expect, it } from "vitest";
import {
  commandEpisode as send,
  createEpisode,
  episodeStage,
  type Episode,
} from "./episode";
import { fieldPads, fieldPatch, fieldTerminal, type PadId } from "./field";
import {
  jumperTray,
  traceEnds,
  traceRoute,
  type TracePoint,
} from "./trace-repair";

const at = (
  episode: Episode,
  point: { x: number; z: number },
  y = 0,
): Episode => ({
  ...episode,
  session: {
    ...episode.session,
    player: {
      ...episode.session.player,
      position: { x: point.x, y, z: point.z },
      grounded: y === 0,
    },
  },
});
const terminal = () => {
  const episode = createEpisode();
  return at(
    { ...episode, session: { ...episode.session, phase: "complete", step: 5 } },
    fieldTerminal,
  );
};
const measure = (episode: Episode, id: PadId) =>
  send(
    at(
      episode,
      fieldPads.find((pad) => pad.id === id)!,
    ),
    { type: "field-use", target: id },
  );
const diagnose = {
  type: "field-diagnose",
  fault: "feed",
  upstream: "P1",
  downstream: "P2",
};

it("guards meter pickup, range, phase and the evidence notebook", () => {
  const early = createEpisode();
  expect(send(early, { type: "start-field" })).toBe(early);
  const remote = at(terminal(), { x: 10, z: 10 });
  expect(send(remote, { type: "start-field" })).toBe(remote);
  const classic = send(terminal(), { type: "open-diagnostics" });
  const closed = send(classic, { type: "close-diagnostics" });
  expect(send(closed, { type: "start-field" })).toBe(closed);
  const playing = send(terminal(), { type: "start-field" });
  expect(send(playing, { type: "field-use", target: "P2" })).toBe(playing);
  expect(send(playing, { type: "open-diagnostics" })).toBe(playing);
  const airborne = at(playing, fieldPads[0], 1);
  expect(send(airborne, { type: "field-use", target: "P1" })).toBe(airborne);
  const notebook = send(playing, { type: "field-notebook" });
  expect(notebook.session.phase).toBe("paused");
  expect(send(notebook, diagnose)).toBe(notebook);
  expect(send(notebook, { type: "resume" })).toBe(notebook);
});

it("requires distinct evidence, a local repair and a fresh solver sweep before T1 commissioning", () => {
  let episode = send(terminal(), { type: "start-field" });
  for (const { id } of fieldPads) episode = measure(episode, id);
  expect(episode.field?.before).toEqual({ P1: 5, P2: 0, P3: 0 });
  const fallen = at(episode, { x: 25, z: 15 }, -10);
  const recovered = send(fallen, {
    type: "step",
    x: 0,
    z: 0,
    run: false,
    jump: false,
  });
  expect(recovered.session.recoveries).toBe(1);
  expect(recovered.field).toBe(episode.field);
  expect(send(episode, diagnose)).toBe(episode);
  episode = send(episode, { type: "field-notebook" });
  const wrong = send(episode, { ...diagnose, downstream: "P3" });
  expect(wrong.field?.incorrect).toBe(true);
  expect(wrong.field?.before).toBe(episode.field?.before);
  episode = send(wrong, diagnose);
  expect(episode.field?.phase).toBe("located");
  const patch = { type: "field-use", target: fieldPatch.id };
  episode = send(episode, { type: "field-notebook" });
  expect(send(episode, patch)).toBe(episode);
  episode = send(at(episode, fieldPatch), patch);
  expect(episode.field?.phase).toBe("located");
  expect(episode.field?.benchOpen).toBe(true);
  expect(episode.session.phase).toBe("paused");
  expect(send(episode, { type: "resume" })).toBe(episode);
  expect(measure(episode, "P1").field).toBe(episode.field);
  const act = (event: unknown) => {
    episode = send(episode, {
      type: "field-repair",
      event,
      difficulty: "technician",
    });
  };
  const hold = (point: TracePoint, ticks: number) => {
    for (let i = 0; i < ticks; i++) act({ type: "contact", ...point });
    act({ type: "release" });
  };
  act({ type: "continuity" });
  expect(episode.field?.traceRepair?.message).toBe("need-power-off");
  act({ type: "power" });
  act({ type: "continuity" });
  expect(episode.field?.traceRepair?.message).toBe("continuity-open");
  hold(traceEnds[0], 5);
  episode = send(episode, { type: "close-field-repair" });
  expect(episode.session.phase).toBe("playing");
  expect(episode.field?.traceRepair?.ends).toEqual([true, false]);
  expect(measure(episode, "P2").field).toBe(episode.field);
  episode = send(episode, patch);
  hold(traceEnds[1], 5);
  for (const ticks of [4, 4, 13]) for (const end of traceEnds) hold(end, ticks);
  expect(episode.field?.traceRepair?.stage).toBe("prepare");
  hold(jumperTray, 5);
  for (const point of traceRoute) hold(point, 1);
  expect(episode.field?.traceRepair?.stage).toBe("solder");
  hold(traceEnds[0], 25);
  expect(episode.field?.traceRepair?.message).toBe("hot");
  expect(episode.field?.traceRepair?.ends).toEqual([false, false]);
  for (const end of traceEnds) hold(end, 13);
  act({ type: "continuity" });
  expect(episode.field?.traceRepair?.message).toBe("clean-first");
  for (const end of traceEnds) hold(end, 4);
  act({ type: "continuity" });
  expect(episode.field?.traceRepair?.message).toBe("continuity-pass");
  expect(episode.field?.traceRepair?.stage).toBe("seal");
  act({ type: "power" });
  expect(episode.field?.traceRepair?.message).toBe("keep-isolated");
  for (const end of traceEnds) hold(end, 4);
  act({ type: "power" });
  expect(episode.field?.phase).toBe("recheck");
  expect(episode.session.phase).toBe("playing");
  expect(send(episode, patch)).toBe(episode);
  expect(episode.field?.after).toEqual({});
  for (const { id } of fieldPads) episode = measure(episode, id);
  expect(episode.field?.phase).toBe("verified");
  expect(episode.field?.after).toEqual({ P1: 5, P2: 5, P3: 2.5 });
  expect(episode.field?.before).toEqual({ P1: 5, P2: 0, P3: 0 });
  const report = { type: "field-use", target: "T1" };
  expect(send(episode, report)).toBe(episode);
  expect(send(episode, { type: "workbench", command: { type: "run" } })).toBe(
    episode,
  );
  episode = send(at(episode, fieldTerminal), report);
  expect(episodeStage(episode)).toBe("construction");
  expect(episode.session.repair.completed).toBe(true);
  expect(send(episode, { type: "restart-episode" }).field).toBeUndefined();
});
