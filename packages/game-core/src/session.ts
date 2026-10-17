import { diagnosticCommand } from "./diagnosis";
import type {
  BoardComponent,
  ExplorationCommand,
  Session,
} from "@spark/shared";
import { components, horizontalDistance, movement, world } from "./world";
import { movePlayer } from "./movement";
export function createSession(): Session {
  return {
    phase: "title",
    player: {
      id: "engineer-1",
      position: { ...world.spawn },
      velocity: { x: 0, y: 0, z: 0 },
      grounded: true,
      facing: Math.PI,
    },
    step: 0,
    inspected: [],
    scanned: [],
    inspection: null,
    recoveries: 0,
    diagnosis: null,
  };
}
export function canInteract(
  state: Session,
  component: BoardComponent | undefined,
  scan = false,
): boolean {
  return (
    state.phase === "playing" &&
    !!component &&
    component.inspectable &&
    (!scan || component.scannable) &&
    horizontalDistance(state.player.position, component) <=
      movement.interactionRange &&
    Math.abs(state.player.position.y) <= 2
  );
}
export function nearbyComponents(state: Session): readonly BoardComponent[] {
  return components
    .filter((c) => canInteract(state, c))
    .sort(
      (a, b) =>
        horizontalDistance(state.player.position, a) -
        horizontalDistance(state.player.position, b),
    );
}
function isCommand(value: unknown): value is ExplorationCommand {
  if (!value || typeof value !== "object" || !("type" in value)) return false;
  if (
    ["start", "pause", "resume", "close-inspection"].includes(
      String(value.type),
    )
  )
    return true;
  if (value.type === "step")
    return (
      "x" in value &&
      "z" in value &&
      typeof value.x === "number" &&
      typeof value.z === "number" &&
      Number.isFinite(value.x) &&
      Number.isFinite(value.z) &&
      Math.abs(value.x) <= 1 &&
      Math.abs(value.z) <= 1 &&
      "run" in value &&
      typeof value.run === "boolean" &&
      "jump" in value &&
      typeof value.jump === "boolean"
    );
  return (
    (value.type === "interact" || value.type === "scan") &&
    "target" in value &&
    typeof value.target === "string"
  );
}
export function commandSession(state: Session, command: unknown): Session {
  const diagnostic = diagnosticCommand(state, command);
  if (diagnostic !== undefined) return diagnostic;
  if (!isCommand(command)) return state;
  if (command.type === "start")
    return state.phase === "title" ? { ...state, phase: "playing" } : state;
  if (command.type === "pause")
    return state.phase === "playing"
      ? {
          ...state,
          phase: "paused",
          player: { ...state.player, velocity: { x: 0, y: 0, z: 0 } },
        }
      : state;
  if (command.type === "resume")
    return state.phase === "paused" ? { ...state, phase: "playing" } : state;
  if (command.type === "close-inspection")
    return state.phase === "inspecting"
      ? { ...state, phase: "playing", inspection: null }
      : state;
  if (state.phase !== "playing") return state;
  if (command.type === "step") {
    const player = movePlayer(state.player, command);
    let step = state.step;
    if (step === 0 && horizontalDistance(player.position, world.spawn) > 3)
      step = 1;
    if (
      step === 3 &&
      horizontalDistance(
        player.position,
        components.find((c) => c.id === "U1")!,
      ) <= 9
    )
      step = 4;
    const recovered =
      horizontalDistance(player.position, world.spawn) < 0.01 &&
      horizontalDistance(state.player.position, world.spawn) > 5;
    return {
      ...state,
      player,
      step,
      recoveries: state.recoveries + (recovered ? 1 : 0),
    };
  }
  if (command.type === "interact" || command.type === "scan") {
    const component = components.find((c) => c.id === command.target);
    const scan = command.type === "scan";
    if (!canInteract(state, component, scan) || !component) return state;
    let step = state.step;
    if (step === 1 && !scan && component.kind === "resistor") step = 2;
    else if (
      step === 2 &&
      scan &&
      component.kind !== "resistor" &&
      component.kind !== "terminal"
    )
      step = 3;
    else if (step === 4 && !scan && component.kind === "terminal") step = 5;
    const key = scan ? "scanned" : "inspected";
    return {
      ...state,
      step,
      phase: step === 5 ? "complete" : "inspecting",
      inspection: { id: component.id, scan },
      [key]: state[key].includes(component.id)
        ? state[key]
        : [...state[key], component.id],
      player: { ...state.player, velocity: { x: 0, y: 0, z: 0 } },
    };
  }
  return state;
}
