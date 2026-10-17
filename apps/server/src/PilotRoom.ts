import { Room, type Client } from "@colyseus/core";
import {
  createPilot,
  joinPilot,
  leavePilot,
  connectPilot,
  commandPilot,
  tickPilot,
} from "@spark/game-core";
const activeRooms = new Set<string>();
export class PilotRoom extends Room {
  maxClients = 2;
  reconnectSeconds = 20;
  maxMessagesPerSecond = 60;
  pilot = createPilot();
  private actionAt = new Map<string, number>();
  private movementAt = new Map<string, number>();
  async onCreate() {
    if (activeRooms.size >= 16) throw new Error("Local pilot room limit");
    activeRooms.add(this.roomId);
    await this.setPrivate(true);
    this.setSimulationInterval(() => {
      this.pilot = tickPilot(this.pilot);
    }, 1000 / 60);
    this.clock.setInterval(() => this.broadcast("snapshot", this.pilot), 100);
    this.onMessage("command", (client, payload: unknown) => {
      if (!payload || typeof payload !== "object" || !("type" in payload))
        return;
      const now = performance.now(),
        move = payload.type === "move";
      const rates = move ? this.movementAt : this.actionAt;
      if (now - (rates.get(client.sessionId) ?? -Infinity) < (move ? 30 : 120))
        return;
      rates.set(client.sessionId, now);
      this.pilot = commandPilot(this.pilot, client.sessionId, payload);
      if (!move) this.broadcast("snapshot", this.pilot);
    });
  }
  onJoin(client: Client) {
    this.pilot = joinPilot(this.pilot, client.sessionId);
    this.broadcast("snapshot", this.pilot);
  }
  async onDrop(client: Client) {
    this.pilot = connectPilot(this.pilot, client.sessionId, false);
    this.broadcast("snapshot", this.pilot);
    try {
      await this.allowReconnection(client, this.reconnectSeconds);
    } catch {
      /* onLeave removes expired seat */
    }
  }
  onReconnect(client: Client) {
    this.pilot = connectPilot(this.pilot, client.sessionId, true);
    this.broadcast("snapshot", this.pilot);
  }
  onDispose() {
    activeRooms.delete(this.roomId);
  }
  onLeave(client: Client) {
    this.pilot = leavePilot(this.pilot, client.sessionId);
    this.actionAt.delete(client.sessionId);
    this.movementAt.delete(client.sessionId);
    this.broadcast("snapshot", this.pilot);
  }
}
