import { expect, it } from "vitest";
import {
  createPilot,
  joinPilot,
  commandPilot as send,
  tickPilot,
  connectPilot,
  leavePilot,
} from "./pilot";
const room = () => joinPilot(joinPilot(createPilot(), "a"), "b");
it("requires two complementary contributors and solver-backed verification", () => {
  let s = room();
  let n = 1;
  const command = (id: string, c: object) => {
    s = send(s, id, { ...c, sequence: n++ });
  };
  expect(joinPilot(s, "c")).toBe(s);
  command("b", { type: "repair" });
  expect(s.mission.repair.r1).toBe("open");
  command("a", { type: "measure", target: "SENSE", value: 999 });
  expect(s.mission.diagnosis?.readings).toEqual({});
  command("a", { type: "measure", target: "VCC", value: 999 });
  command("b", { type: "measure", target: "SENSE" });
  expect(s.mission.diagnosis?.readings).toEqual({ VCC: 5, SENSE: 0 });
  command("a", { type: "diagnose", fault: "r1-open" });
  command("b", { type: "repair" });
  expect(s.mission.repair.r1).toBe("restored");
  command("a", { type: "verify" });
  expect(s.mission.repair.completed).toBe(false);
  command("a", { type: "measure", target: "VCC" });
  command("b", { type: "measure", target: "SENSE" });
  command("a", { type: "verify" });
  expect(s.mission.repair.completed).toBe(true);
  expect(s.mission.repair.readings.SENSE).toBe(2.5);
  const last = s;
  command("b", { type: "repair" });
  expect(s).toBe(last);
});
it("rejects spoofing, malformed input, replayed ordering and client positions", () => {
  const s = room();
  for (const c of [
    null,
    {},
    { type: "move", sequence: 1, x: Infinity, z: 0 },
    { type: "move", sequence: 1, x: 8, z: 0 },
    { type: "complete", sequence: 1 },
  ])
    expect(send(s, "a", c)).toBe(s);
  expect(send(s, "attacker", { type: "move", sequence: 1, x: 1, z: 0 })).toBe(
    s,
  );
  const next = send(s, "a", {
    type: "move",
    sequence: 1,
    x: 1,
    z: 0,
    position: { x: 100, z: 100 },
  });
  expect(next.players[0].explorer.position).toEqual(
    s.players[0].explorer.position,
  );
  expect(send(next, "a", { type: "move", sequence: 1, x: -1, z: 0 })).toBe(
    next,
  );
  let moved = next;
  for (let i = 0; i < 60; i++) moved = tickPilot(moved);
  expect(
    moved.players[0].explorer.position.x - s.players[0].explorer.position.x,
  ).toBeGreaterThan(0);
  expect(
    moved.players[0].explorer.position.x - s.players[0].explorer.position.x,
  ).toBeLessThan(1.1);
});
it("stops disconnected/idle movement and preserves shared state through reconnect", () => {
  let s = room();
  s = send(s, "a", { type: "measure", sequence: 1, target: "VCC" });
  const dropped = connectPilot(s, "a", false);
  expect(
    send(dropped, "b", { type: "measure", sequence: 2, target: "SENSE" }),
  ).toBe(dropped);
  const restored = connectPilot(dropped, "a", true);
  expect(restored.mission).toBe(s.mission);
  const left = leavePilot(restored, "b");
  expect(left.mission.diagnosis?.readings).toEqual({});
  expect(joinPilot(left, "c").players[1].role).toBe("engineer");
});
