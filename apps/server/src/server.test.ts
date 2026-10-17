import { beforeAll, afterAll, it, expect } from "vitest";
import { Client, type Room as ClientRoom } from "@colyseus/sdk";
import { matchMaker } from "@colyseus/core";
import type { PilotState } from "@spark/game-core";
import { createPilotServer } from "./server";
const server = createPilotServer(1.5);
let client: Client;
beforeAll(async () => {
  await server.listen(0, "127.0.0.1");
  const address = server.transport.server!.address();
  if (!address || typeof address === "string") throw new Error("No local port");
  client = new Client("http://127.0.0.1:" + address.port);
});
afterAll(async () => {
  await server.gracefullyShutdown(false);
});
it("joins a private room, shares authority, reconnects and cleans up", async () => {
  const a = await client.create("pilot"),
    b = await client.joinById(a.roomId);
  let sa: PilotState | undefined, sb: PilotState | undefined;
  const watch = (r: ClientRoom, cb: (s: PilotState) => void) =>
    r.onMessage("snapshot", cb);
  watch(a, (s) => (sa = s));
  watch(b, (s) => (sb = s));
  await expect.poll(() => sa?.players.length).toBe(2);
  await expect(client.joinById(a.roomId)).rejects.toThrow();
  await expect(client.join("pilot")).rejects.toThrow();
  let sequence = 0;
  const send = async (r: ClientRoom, c: object) => {
    r.send("command", { ...c, sequence: ++sequence });
    await new Promise((resolve) => setTimeout(resolve, 160));
  };
  await send(a, {
    type: "measure",
    target: "VCC",
    value: 999,
    playerId: b.sessionId,
  });
  await send(b, { type: "measure", target: "SENSE" });
  expect(sa?.mission.diagnosis?.readings).toEqual({ VCC: 5, SENSE: 0 });
  expect(sb?.mission.diagnosis).toEqual(sa?.mission.diagnosis);
  const before = sa!.players.find((p) => p.id === a.sessionId)!.explorer
    .position;
  await send(a, { type: "move", x: 1, z: 0, position: { x: 999, z: 999 } });
  await expect
    .poll(
      () => sa!.players.find((p) => p.id === a.sessionId)!.explorer.position.x,
    )
    .toBeGreaterThan(before.x + 0.1);
  await send(a, { type: "move", x: 0, z: 0 });
  await send(a, { type: "diagnose", fault: "r1-open" });
  await send(b, { type: "repair" });
  expect(sa?.mission.repair.r1).toBe("restored");
  const token = b.reconnectionToken,
    id = b.sessionId;
  b.reconnection.enabled = false;
  b.connection.close(4001);
  await expect
    .poll(() => sa?.players.find((p) => p.id === id)?.connected)
    .toBe(false);
  const rejoined = await client.reconnect(token);
  watch(rejoined, (s) => (sb = s));
  await expect
    .poll(() => sa?.players.find((p) => p.id === id)?.connected)
    .toBe(true);
  expect(rejoined.sessionId).toBe(id);
  await send(a, { type: "measure", target: "VCC" });
  await send(rejoined, { type: "measure", target: "SENSE" });
  await send(a, { type: "verify" });
  await expect.poll(() => sb?.mission.repair.completed).toBe(true);
  expect(sa?.mission.repair).toEqual(sb?.mission.repair);
  const size = JSON.stringify(sa).length;
  console.log("Pilot snapshot characters:", size);
  expect(size).toBeLessThan(8192);
  await a.leave();
  await rejoined.leave();
  await expect
    .poll(async () => (await matchMaker.query({ roomId: a.roomId })).length)
    .toBe(0);
}, 30000);
it("rejects foreign browser origins", async () => {
  const address = server.transport.server!.address();
  if (!address || typeof address === "string") throw new Error("No port");
  const r = await fetch("http://127.0.0.1:" + address.port + "/health", {
    headers: { Origin: "https://untrusted.example" },
  });
  expect(r.status).toBe(403);
  const denied = await fetch(
    "http://127.0.0.1:" + address.port + "/matchmake/create/pilot",
    {
      method: "POST",
      headers: {
        Origin: "https://untrusted.example",
        "Content-Type": "application/json",
      },
      body: "{}",
    },
  );
  expect(denied.status).toBe(403);
});

it("expires abandoned seats, resets evidence, and admits a replacement", async () => {
  const a = await client.create("pilot"),
    b = await client.joinById(a.roomId);
  let snapshot: PilotState | undefined;
  a.onMessage("snapshot", (s: PilotState) => (snapshot = s));
  b.onMessage("snapshot", () => {});
  await expect.poll(() => snapshot?.players.length).toBe(2);
  a.send("command", { type: "measure", target: "VCC", sequence: 1 });
  await expect.poll(() => snapshot?.mission.diagnosis?.readings.VCC).toBe(5);
  b.reconnection.enabled = false;
  b.connection.close(4001);
  await expect.poll(() => snapshot?.players.length, { timeout: 5000 }).toBe(1);
  expect(snapshot?.mission.diagnosis?.readings).toEqual({});
  const replacement = await client.joinById(a.roomId);
  replacement.onMessage("snapshot", () => {});
  await expect.poll(() => snapshot?.players.length).toBe(2);
  expect(
    snapshot?.players.find((p) => p.id === replacement.sessionId)?.role,
  ).toBe("engineer");
  await a.leave();
  await replacement.leave();
}, 10000);

it("bounds HTTP payloads and local request bursts", async () => {
  const address = server.transport.server!.address();
  if (!address || typeof address === "string") throw new Error("No port");
  const url = "http://127.0.0.1:" + address.port;
  const huge = await fetch(url + "/matchmake/create/pilot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ junk: "x".repeat(3000) }),
  });
  expect(huge.status).toBe(413);
  let rejected = 0;
  for (let i = 0; i < 125; i++) {
    const r = await fetch(url + "/health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    if (r.status === 429) rejected++;
  }
  expect(rejected).toBeGreaterThan(0);
}, 10000);
