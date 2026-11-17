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
import {
  createField,
  fieldTarget,
  fieldTerminal,
  localizeFieldFault,
  useFieldSite,
  type FieldState,
} from "./field";
export interface Episode {
  readonly session: Session;
  readonly workbench: Workbench;
  readonly constructed: boolean;
  readonly programmingUnlocked: boolean;
  readonly programmed: boolean;
  readonly activated: boolean;
  readonly field?: FieldState;
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
  const field = e.field;
  if (c.type === "start-field") {
    if (
      field ||
      e.session.diagnosis ||
      e.session.step !== 5 ||
      e.session.phase !== "complete" ||
      horizontalDistance(e.session.player.position, fieldTerminal) >
        movement.interactionRange ||
      Math.abs(e.session.player.position.y) > 2
    )
      return e;
    return {
      ...e,
      field: createField(),
      session: { ...e.session, phase: "playing" },
    };
  }
  if (field) {
    if (c.type === "field-notebook") {
      if (e.session.phase !== (field.notebook ? "paused" : "playing")) return e;
      const nextField = { ...field, notebook: !field.notebook };
      const session = commandSession(e.session, {
        type: field.notebook ? "resume" : "pause",
      });
      return { ...e, field: nextField, session };
    }
    if (
      c.type === "field-diagnose" &&
      "fault" in c &&
      "upstream" in c &&
      "downstream" in c
    ) {
      const next = localizeFieldFault(field, c.fault, c.upstream, c.downstream);
      return next === field ? e : { ...e, field: next };
    }
    if (c.type === "field-use" && "target" in c) {
      if (
        field.phase === "verified" &&
        c.target === fieldTerminal.id &&
        fieldTarget(field, e.session)?.id === c.target
      ) {
        return {
          ...e,
          session: {
            ...e.session,
            phase: "complete",
            player: { ...e.session.player, velocity: { x: 0, y: 0, z: 0 } },
            repair: {
              r1: "restored",
              completed: true,
              readings: {
                VCC: field.after.P1!,
                SENSE: field.after.P3!,
              },
            },
          },
        };
      }
      const next = useFieldSite(field, e.session, c.target);
      return next === field ? e : { ...e, field: next };
    }
    if (
      c.type === "open-diagnostics" ||
      ((c.type === "interact" || c.type === "scan") &&
        e.session.phase === "playing") ||
      (c.type === "resume" && field.notebook)
    )
      return e;
  }
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
