import { Client, type Room } from "@colyseus/sdk";
import type { PilotState } from "@spark/game-core";
export const pilotEndpoint = "http://127.0.0.1:2567";
export async function connectRoom(
  code: string | undefined,
  onSnapshot: (s: PilotState, id: string) => void,
  onStatus: (s: "connected" | "reconnecting" | "closed") => void,
) {
  const client = new Client(pilotEndpoint);
  const room: Room = code
    ? await client.joinById(code)
    : await client.create("pilot");
  room.reconnection.minUptime = 0;
  room.reconnection.minDelay = 100;
  room.reconnection.maxDelay = 1000;
  room.onMessage("snapshot", (state: PilotState) =>
    onSnapshot(state, room.sessionId),
  );
  room.onDrop(() => onStatus("reconnecting"));
  room.onReconnect(() => onStatus("connected"));
  room.onLeave(() => onStatus("closed"));
  onStatus("connected");
  return room;
}
