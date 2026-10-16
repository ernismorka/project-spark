import { describe, expect, it } from "vitest";
import {
  createSession,
  commandSession,
  canInteract,
  nearbyComponents,
  components,
  solids,
  movement,
  movePlayer,
  recoverPlayer,
  world,
} from "./index";
import type { Session } from "@spark/shared";
const playing = () => commandSession(createSession(), { type: "start" });
const at = (state: Session, x: number, z: number): Session => ({
  ...state,
  player: { ...state.player, position: { x, y: 0, z } },
});
const action = (s: Session, type: "interact" | "scan", target: string) =>
  commandSession(s, { type, target });
const close = (s: Session) => commandSession(s, { type: "close-inspection" });
const tick = (s: Session, x = 0, z = -1, jump = false, run = false) =>
  commandSession(s, { type: "step", x, z, jump, run });
describe("First Contact domain", () => {
  it("contains stable, unique and capability-correct metadata", () => {
    expect(new Set(components.map((c) => c.id)).size).toBe(components.length);
    for (const kind of ["resistor", "capacitor", "led", "microcontroller"])
      expect(
        components.some((c) => c.kind === kind && c.inspectable && c.scannable),
      ).toBe(true);
    expect(components.find((c) => c.kind === "terminal")?.scannable).toBe(
      false,
    );
    expect(
      solids.every((s) => s.width > 0 && s.depth > 0 && s.height > 0),
    ).toBe(true);
  });
  it("completes each objective in order through validated commands", () => {
    let s = playing();
    for (let i = 0; i < 100; i++) s = tick(s);
    expect(s.step).toBe(1);
    s = at(s, -7, 24);
    s = action(s, "interact", "R1");
    expect(s.step).toBe(2);
    expect(s.phase).toBe("inspecting");
    s = close(s);
    s = at(s, 7, 9);
    s = action(s, "scan", "C1");
    expect(s.step).toBe(3);
    s = close(s);
    s = at(s, 6, -21);
    s = tick(s, 0, 0);
    expect(s.step).toBe(4);
    s = at(s, 4, -18);
    s = action(s, "interact", "T1");
    expect(s.step).toBe(5);
    expect(s.phase).toBe("complete");
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
    expect(tick(s)).toBe(s);
  });
  it("rejects invalid, remote, unsupported, paused and out-of-order actions", () => {
    let s = playing();
    for (const command of [
      null,
      {},
      { type: "step", x: NaN, z: 0, run: false, jump: false },
      { type: "step", x: 2, z: 0, run: false, jump: false },
      { type: "scan", target: 5 },
      { type: "resume" },
    ])
      expect(commandSession(s, command)).toBe(s);
    expect(action(s, "interact", "R1")).toBe(s);
    expect(action(s, "interact", "missing")).toBe(s);
    s = at(s, 0, -14);
    expect(action(s, "scan", "T1")).toBe(s);
    expect(action(s, "interact", "T1").step).toBe(0);
    const paused = commandSession(s, { type: "pause" });
    expect(action(paused, "interact", "T1")).toBe(paused);
    expect(canInteract(paused, components[4])).toBe(false);
    expect(nearbyComponents(paused)).toEqual([]);
    expect(
      canInteract(
        { ...s, player: { ...s.player, position: { x: 0, y: 10, z: -18 } } },
        components[4],
      ),
    ).toBe(false);
  });
  it("does not duplicate discoveries or advance on duplicate or wrong events", () => {
    let s = { ...at(playing(), -7, 24), step: 1 };
    s = close(action(s, "interact", "R1"));
    expect(s.step).toBe(2);
    s = close(action(s, "interact", "R1"));
    expect(s.step).toBe(2);
    expect(s.inspected).toEqual(["R1"]);
    s = close(action(s, "scan", "R1"));
    expect(s.step).toBe(2);
    s = close(action(s, "scan", "R1"));
    expect(s.scanned).toEqual(["R1"]);
    const inspecting = action(s, "interact", "R1");
    expect(action(inspecting, "interact", "R1")).toBe(inspecting);
  });
  it("pauses without losing progress and resumes only from paused", () => {
    let s = playing();
    for (let i = 0; i < 100; i++) s = tick(s);
    const paused = commandSession(s, { type: "pause" });
    expect(tick(paused)).toBe(paused);
    const resumed = commandSession(paused, { type: "resume" });
    expect(resumed.step).toBe(s.step);
    expect(resumed.player.position).toEqual(s.player.position);
    expect(commandSession(resumed, { type: "start" })).toBe(resumed);
  });
});
describe("deterministic motion and recovery", () => {
  it("accelerates, decelerates and runs faster without diagonal boost", () => {
    const walk = playing();
    let a = walk,
      b = walk,
      c = walk;
    for (let i = 0; i < 120; i++) {
      a = tick(a, 1, 0);
      b = tick(b, 1, 0, false, true);
      c = tick(c, 1, 1);
    }
    expect(b.player.position.x).toBeGreaterThan(a.player.position.x + 3);
    expect(Math.hypot(c.player.velocity.x, c.player.velocity.z)).toBeCloseTo(
      movement.walk,
    );
    expect(tick(walk, 1, 0).player.velocity.x).toBeCloseTo(
      movement.acceleration * movement.step,
    );
    for (let i = 0; i < 30; i++) a = tick(a, 0, 0);
    expect(a.player.velocity.x).toBe(0);
  });
  it("jumps once, falls and lands on the board", () => {
    let s = tick(playing(), 0, 0, true);
    expect(s.player.grounded).toBe(false);
    expect(s.player.position.y).toBeGreaterThan(0);
    const vy = s.player.velocity.y;
    s = tick(s, 0, 0, true);
    expect(s.player.velocity.y).toBeLessThan(vy);
    for (let i = 0; i < 120; i++) s = tick(s, 0, 0);
    expect(s.player.position.y).toBe(0);
    expect(s.player.grounded).toBe(true);
  });
  it("blocks walls, slides and lands on raised geometry", () => {
    let s = at(playing(), -7, 25);
    for (let i = 0; i < 150; i++) s = tick(s);
    expect(s.player.position.z).toBeGreaterThanOrEqual(21 + movement.radius);
    expect(s.player.position.z).toBeLessThan(21.5);
    s = at(playing(), 13, -12);
    s = {
      ...s,
      player: {
        ...s.player,
        position: { x: 13, y: 1, z: -12 },
        velocity: { x: 0, y: -1, z: 0 },
        grounded: false,
      },
    };
    for (let i = 0; i < 60; i++) s = tick(s, 0, 0);
    expect(s.player.position.y).toBe(0.55);
    expect(s.player.grounded).toBe(true);
  });
  it("recovers from a real fall and invalid coordinates without resetting mission", () => {
    let s = { ...at(playing(), 25, 30), step: 2 };
    for (let i = 0; i < 180; i++) s = tick(s, 0, 0);
    expect(s.player.position).toEqual(world.spawn);
    expect(s.step).toBe(2);
    expect(s.recoveries).toBe(1);
    expect(
      recoverPlayer({ ...s.player, position: { x: NaN, y: 0, z: 0 } }).position,
    ).toEqual(world.spawn);
  });
  it("replays identical inputs identically", () => {
    const input = { x: 0.3, z: -1, run: true, jump: false };
    let a = playing().player,
      b = playing().player;
    for (let i = 0; i < 240; i++) {
      a = movePlayer(a, input);
      b = movePlayer(b, JSON.parse(JSON.stringify(input)));
    }
    expect(a).toEqual(b);
  });
});
