import { createSession, commandSession } from "./session";
import { movePlayer } from "./movement";
import type { Explorer, Session } from "@spark/shared";
export interface PilotPlayer {
  id: string;
  role: "analyst" | "engineer";
  connected: boolean;
  explorer: Explorer;
  sequence: number;
  input: { x: number; z: number };
  idle: number;
}
export interface PilotState {
  players: readonly PilotPlayer[];
  mission: Session;
  revision: number;
}
export function createPilot(): PilotState {
  const s = createSession();
  return {
    players: [],
    mission: {
      ...s,
      phase: "diagnosing",
      step: 5,
      diagnosis: { readings: {}, outcome: "collect-evidence", attempts: 0 },
    },
    revision: 0,
  };
}
export function joinPilot(s: PilotState, id: string): PilotState {
  if (s.players.length >= 2 || s.players.some((p) => p.id === id)) return s;
  const role = s.players.some((p) => p.role === "analyst")
    ? "engineer"
    : "analyst";
  const explorer = {
    ...createSession().player,
    id,
    position: { x: role === "analyst" ? -2 : 2, y: 0, z: -16 },
  };
  return {
    ...s,
    players: [
      ...s.players,
      {
        id,
        role,
        connected: true,
        explorer,
        sequence: 0,
        input: { x: 0, z: 0 },
        idle: 0,
      },
    ],
    revision: s.revision + 1,
  };
}
export function connectPilot(
  s: PilotState,
  id: string,
  connected: boolean,
): PilotState {
  return {
    ...s,
    players: s.players.map((p) =>
      p.id === id
        ? {
            ...p,
            connected,
            explorer: { ...p.explorer, velocity: { x: 0, y: 0, z: 0 } },
            input: { x: 0, z: 0 },
            idle: 0,
          }
        : p,
    ),
    revision: s.revision + 1,
  };
}
export function leavePilot(s: PilotState, id: string): PilotState {
  // Expired/consented departure resets the shared task so a replacement cannot inherit credit.
  return {
    ...createPilot(),
    players: s.players
      .filter((p) => p.id !== id)
      .map((p) => ({ ...p, input: { x: 0, z: 0 }, idle: 0 })),
    revision: s.revision + 1,
  };
}
export function tickPilot(s: PilotState): PilotState {
  return {
    ...s,
    players: s.players.map((p) => {
      const idle = p.idle + 1;
      const explorer = p.connected
        ? movePlayer(p.explorer, {
            ...(idle <= 15 ? p.input : { x: 0, z: 0 }),
            run: false,
            jump: false,
          })
        : p.explorer;
      return { ...p, explorer, idle };
    }),
    revision: s.revision + 1,
  };
}
export function commandPilot(
  s: PilotState,
  id: string,
  c: unknown,
): PilotState {
  const p = s.players.find((p) => p.id === id && p.connected);
  if (
    !p ||
    !c ||
    typeof c !== "object" ||
    !("sequence" in c) ||
    !Number.isSafeInteger(c.sequence) ||
    (c.sequence as number) <= p.sequence ||
    !("type" in c)
  )
    return s;
  const sequence = c.sequence as number;
  if (c.type === "move") {
    if (
      !("x" in c) ||
      !("z" in c) ||
      typeof c.x !== "number" ||
      typeof c.z !== "number" ||
      !Number.isFinite(c.x) ||
      !Number.isFinite(c.z) ||
      Math.abs(c.x) > 1 ||
      Math.abs(c.z) > 1
    )
      return s;
    const length = Math.max(1, Math.hypot(c.x, c.z));
    return {
      ...s,
      players: s.players.map((q) =>
        q === p
          ? {
              ...q,
              sequence,
              input: {
                x: (c.x as number) / length,
                z: (c.z as number) / length,
              },
              idle: 0,
            }
          : q,
      ),
    };
  }
  if (s.players.length !== 2 || s.players.some((q) => !q.connected)) return s;
  let action: unknown;
  const repaired = s.mission.repair.r1 === "restored";
  if (
    c.type === "measure" &&
    "target" in c &&
    c.target === (p.role === "analyst" ? "VCC" : "SENSE")
  )
    action = {
      type: repaired ? "measure-repair" : "measure-node",
      target: c.target,
    };
  else if (c.type === "diagnose" && p.role === "analyst" && "fault" in c)
    action = { type: "submit-diagnosis", fault: c.fault };
  else if (c.type === "repair" && p.role === "engineer")
    action = { type: "repair-r1", target: "R1" };
  else if (c.type === "verify" && p.role === "analyst")
    action = { type: "verify-repair" };
  else return s;
  // Existing domain validates terminal proximity for repairs; require it for every pilot interaction.
  if (
    Math.hypot(p.explorer.position.x, p.explorer.position.z + 18) > 5 ||
    Math.abs(p.explorer.position.y) > 2
  )
    return s;
  const context = { ...s.mission, player: p.explorer };
  const mission = commandSession(context, action);
  if (mission === context) return s;
  return {
    ...s,
    mission,
    players: s.players.map((q) => (q === p ? { ...q, sequence } : q)),
    revision: s.revision + 1,
  };
}
