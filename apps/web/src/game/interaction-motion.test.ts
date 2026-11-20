import { describe, expect, it } from "vitest";
import type { FieldState } from "@spark/game-core";
import {
  acceptedFieldMotion,
  fieldMotionDuration,
  toolPose,
} from "./interaction-motion";

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

it("seats the common lead before the voltage probe and holds both during the reading", () => {
  const reference = toolPose("probe", 0.49, false);
  expect(reference.black).toBe(1);
  expect(reference.red).toBeLessThan(1);
  expect(reference.contact).toBe(false);
  const reading = toolPose("probe", 0.7, false);
  expect(reading).toMatchObject({ black: 1, red: 1, contact: true });
  expect(
    toolPose("probe", fieldMotionDuration("probe", false), false),
  ).toMatchObject({
    reach: 0,
    red: 0,
    black: 0,
    contact: false,
  });
});

it("builds one continuous bead and suppresses tool motion and heat with reduced motion", () => {
  expect(toolPose("repair", 0.35, false)).toMatchObject({
    solder: 0,
    contact: false,
  });
  const middle = toolPose("repair", 0.95, false);
  expect(middle.solder).toBeCloseTo(0.5);
  expect(middle.contact).toBe(true);
  expect(toolPose("repair", 1.9, false)).toMatchObject({
    solder: 1,
    heat: 0,
    contact: false,
  });
  expect(toolPose("repair", 0.95, true)).toMatchObject({
    solder: 1,
    heat: 0,
    reach: 0,
    contact: false,
  });
});
