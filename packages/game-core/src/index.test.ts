import { describe, expect, it } from "vitest";
import { createGame, execute } from "./index";
describe("command boundary", () => {
  it("is deterministic, immutable and serializable", () => {
    const state = Object.freeze(createGame());
    const command = JSON.parse('{"type":"set-language","language":"lt"}');
    const next = execute(state, command);
    expect(next).toEqual({ language: "lt", revision: 1, scene: "foundation" });
    expect(execute(state, command)).toEqual(next);
    expect(JSON.parse(JSON.stringify(next))).toEqual(next);
    expect(state.language).toBe("en");
    expect(execute(next, command)).toBe(next);
  });
  it.each([
    null,
    {},
    { type: "move" },
    { type: "set-language", language: "xx" },
  ])("rejects invalid input %j", (command) => {
    expect(() => execute(createGame(), command)).toThrow(
      "Invalid game command",
    );
  });
});
