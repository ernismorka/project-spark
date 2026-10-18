import type { Session } from "@spark/shared";
import { createSession, commandSession } from "./session";
import {
  createWorkbench,
  commandWorkbench,
  workbenchChallenge,
  printProgram,
  type Workbench,
} from "./programming";
import { components, horizontalDistance, movement } from "./world";
export interface Episode {
  readonly session: Session;
  readonly workbench: Workbench;
  readonly constructed: boolean;
  readonly programmingUnlocked: boolean;
  readonly programmed: boolean;
  readonly activated: boolean;
}
export type EpisodeStage =
  | "exploration"
  | "diagnosis"
  | "construction"
  | "programming"
  | "activation"
  | "complete";
export function createEpisode(): Episode {
  return {
    session: createSession(),
    workbench: createWorkbench(),
    constructed: false,
    programmingUnlocked: false,
    programmed: false,
    activated: false,
  };
}
export function episodeStage(e: Episode): EpisodeStage {
  return e.activated
    ? "complete"
    : e.session.step < 5
      ? "exploration"
      : !e.session.repair.completed
        ? "diagnosis"
        : !e.constructed
          ? "construction"
          : !e.programmed
            ? "programming"
            : "activation";
}
function atTerminal(s: Session) {
  return (
    s.phase === "complete" &&
    s.step === 5 &&
    s.repair.completed &&
    Math.abs(s.player.position.y) <= 2 &&
    horizontalDistance(
      s.player.position,
      components.find((c) => c.id === "T1")!,
    ) <= movement.interactionRange
  );
}
/** Verify the current bounded topology and run, never accept UI completion/output claims. */
function commissioningReady(w: Workbench) {
  const expected = [
    ...createWorkbench().parts,
    { id: "R3", a: "SENSE", b: "GND", ohms: 1000 },
  ];
  if (
    w.parts.length !== expected.length ||
    !expected.every((p) =>
      w.parts.some(
        (q) => q.id === p.id && q.a === p.a && q.b === p.b && q.ohms === p.ohms,
      ),
    ) ||
    printProgram(w.program) !== "READ SENSE\nABOVE 1\nWRITE OUT"
  )
    return false;
  const run = commandWorkbench(w, { type: "run" });
  return (
    run.error === null &&
    run.result?.ok === true &&
    run.output &&
    run.trace.length === 3
  );
}
export function commandEpisode(e: Episode, c: unknown): Episode {
  if (!c || typeof c !== "object" || !("type" in c)) return e;
  if (c.type === "activate-device") {
    if (
      e.activated ||
      !atTerminal(e.session) ||
      !e.constructed ||
      !e.programmed ||
      !commissioningReady(e.workbench)
    )
      return e;
    return { ...e, activated: true };
  }
  if (c.type === "workbench") {
    if (e.activated || !atTerminal(e.session) || !("command" in c)) return e;
    const kind =
      c.command && typeof c.command === "object" && "type" in c.command
        ? c.command.type
        : undefined;
    if (
      !e.programmingUnlocked &&
      ["text", "set-program"].includes(String(kind))
    )
      return e;
    const workbench = commandWorkbench(e.workbench, c.command);
    if (workbench === e.workbench) return e;
    const circuitEdit = ["part", "remove", "reset"].includes(String(kind));
    const constructed =
      !circuitEdit &&
      (e.constructed || (kind === "run" && workbenchChallenge(workbench)));
    const programmed =
      constructed && kind === "run" && commissioningReady(workbench);
    const programmingUnlocked =
      kind !== "reset" && (e.programmingUnlocked || constructed);
    return { ...e, workbench, constructed, programmed, programmingUnlocked };
  }
  const session = commandSession(e.session, c);
  if (session === e.session) return e;
  if (c.type === "restart-episode") return { ...createEpisode(), session };
  return { ...e, session };
}
