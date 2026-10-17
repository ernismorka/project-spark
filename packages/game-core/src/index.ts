import { languages, type GameState } from "@spark/shared";
export function createGame(): GameState {
  return { language: "en", revision: 0, scene: "foundation" };
}
export function execute(state: GameState, command: unknown): GameState {
  if (
    typeof command !== "object" ||
    command === null ||
    !("type" in command) ||
    command.type !== "set-language" ||
    !("language" in command) ||
    !languages.some((language) => language === command.language)
  )
    throw new Error("Invalid game command");
  const language = command.language as GameState["language"];
  return language === state.language
    ? state
    : { ...state, language, revision: state.revision + 1 };
}
export {
  createSession,
  commandSession,
  canInteract,
  nearbyComponents,
} from "./session";
export {
  world,
  components,
  solids,
  movement,
  horizontalDistance,
} from "./world";
export { movePlayer, recoverPlayer } from "./movement";
export {
  diagnosticCircuit,
  diagnosticPoints,
  episodeCircuit,
} from "./diagnosis";
export * from "./programming";
export * from "./pilot";
