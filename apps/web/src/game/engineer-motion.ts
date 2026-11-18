// Values are degrees at keyed poses: hip, knee, shoulder and elbow.
// The matching limbs use the same cycle half a stride apart.
export const walkKeys = [
  [-28, 12, 21, 14],
  [-7, 4, 7, 18],
  [22, 30, -19, 28],
  [14, 45, -6, 22],
  [-28, 12, 21, 14],
] as const;

export const runKeys = [
  [-45, 20, 36, 36],
  [-14, 9, 13, 48],
  [37, 61, -38, 53],
  [13, 75, -16, 49],
  [-45, 20, 36, 36],
] as const;

export function easePose(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

export function advanceJournal(
  progress: number,
  open: boolean,
  seconds: number,
  reduced: boolean,
) {
  if (reduced) return open ? 1 : 0;
  return open
    ? Math.min(1, progress + seconds / 0.95)
    : Math.max(0, progress - seconds / 0.78);
}

// Timeline landmarks for the book and hand rig, in normalized time.
export const journalKeys = {
  grip: 0.18,
  lift: 0.56,
  spread: 0.96,
  camera: 0.28,
};

export type JournalStage = "closed" | "opening" | "open" | "closing";
