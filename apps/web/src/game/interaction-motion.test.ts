import { describe, expect, it } from "vitest";
import type { FieldState } from "@spark/game-core";
import { acceptedFieldMotion } from "./interaction-motion";

const collecting: FieldState = {
  phase: "collect",
  before: {},
  after: {},
  notebook: false,
  incorrect: false,
  last: null,
};

describe("field animation events", () => {
  it("ignores remounts, rejected actions and notebook toggles", () => {
    const measured: FieldState = {
      ...collecting,
      before: { P2: 0 },
      last: "P2",
    };
    expect(acceptedFieldMotion(undefined, measured)).toBeUndefined();
    expect(acceptedFieldMotion(measured, measured)).toBeUndefined();
    expect(
      acceptedFieldMotion(measured, { ...measured, notebook: true }),
    ).toBeUndefined();
    expect(acceptedFieldMotion(measured, undefined)).toBeUndefined();
  });

  it("shows a probe for a fresh zero reading and repair only after localization", () => {
    const measured: FieldState = {
      ...collecting,
      before: { P2: 0 },
      last: "P2",
    };
    const located: FieldState = { ...measured, phase: "located" };
    const patched: FieldState = { ...located, phase: "recheck", last: null };
    const verified: FieldState = {
      ...patched,
      phase: "verified",
      after: { P3: 2.5 },
      last: "P3",
    };
    expect(acceptedFieldMotion(collecting, measured)).toMatchObject({
      kind: "probe",
      site: { id: "P2" },
    });
    expect(acceptedFieldMotion(measured, located)).toBeUndefined();
    expect(acceptedFieldMotion(located, patched)).toMatchObject({
      kind: "repair",
      site: { id: "FEED-LINK" },
    });
    expect(acceptedFieldMotion(patched, verified)).toMatchObject({
      kind: "verified",
      site: { id: "P3" },
    });
  });
});
