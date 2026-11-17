import { expect, it } from "vitest";
import {
  commandEpisode as send,
  createEpisode,
  episodeStage,
  type Episode,
} from "./episode";
import { fieldPads, fieldPatch, fieldTerminal, type PadId } from "./field";

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
  expect(episode.field?.phase).toBe("recheck");
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
