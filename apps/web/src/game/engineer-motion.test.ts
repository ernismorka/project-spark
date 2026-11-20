import { expect, it } from "vitest";
import { advanceJournal, easePose } from "./engineer-motion";

it("reverses a partially opened journal along the same timeline", () => {
  const opening = advanceJournal(0, true, 0.475, false);
  expect(opening).toBeCloseTo(0.5);
  const closing = advanceJournal(opening, false, 0.195, false);
  expect(closing).toBeCloseTo(0.25);
  expect(advanceJournal(closing, false, 1, false)).toBe(0);
  expect(advanceJournal(closing, true, 1, false)).toBe(1);
  expect(easePose(0.25)).toBeLessThan(0.25);
  expect(easePose(0.75)).toBeGreaterThan(0.75);
});

it("jumps to the settled journal pose under reduced motion", () => {
  expect(advanceJournal(0.17, true, 0, true)).toBe(1);
  expect(advanceJournal(0.83, false, 0, true)).toBe(0);
});
