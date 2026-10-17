# M3 — The Dark Circuit contract

Authorized on merged M2 PR #3, main 4dc7084. Main CI run 38999625572 passed before implementation. Branch: codex/m3-the-dark-circuit.

## Narrative and supported behavior

First Contact remains the exploration introduction. T1's DC training network is malfunctioning: a single open R1 connection interrupts the divider. The terminal service tool can restore that connection at its nominal 1 kΩ. R2 and the source cannot be edited. This is a real solved ideal resistor network, separate from MCU internals.

The beacon above T1 is an abstract service indicator: dark while faulty, amber after reconnection, green after fresh measurements and successful verification. A green route strip also becomes visible. Neither is an LED semiconductor simulation or evidence that MCU firmware works. Existing decorative components and traces retain their identification-only scope.

## Deterministic transitions and authority

game-core owns serializable repair state: R1 open/restored, fresh after-readings, completed flag. The actual circuit is derived from that flag and the fixed M2 model. The electronics solver is unchanged.

Only a diagnosing session at completed exploration step 5, within T1 interaction range and height, with identified R1 fault and both original measurements may issue repair-r1 for target R1. No client-provided circuit or result is used. This is local single-player command eligibility, not network authentication.

Repair preserves diagnosis evidence, changes only R1.open, clears after-readings and does not complete the episode. measure-repair accepts only VCC/SENSE and recalculates through solveDC. verify-repair requires both fresh readings matching a new solution, the divider relationship and positive R1 current. Invalid, early and duplicate commands return the identical state. Reopening retains progress; language changes do not alter core state.

Analytical fixtures: faulty VCC=5 V, SENSE=0 V, both resistor currents zero. Restored VCC=5 V, SENSE=2.5 V, R1/R2 currents=2.5 mA. UI measurements come from solver results, not these reference constants.

## Completion, replay and persistence

Completion is the core verified flag, distinct from the earlier First Contact exploration completion. The localized terminal panel shows before/after evidence, explanation and episode completion; closing it shows a completed episode summary and visible world response. Replay resets exploration, position, fault, evidence and completion through a core restart command. It is available from the terminal summary before or after verification.

Progress and language are session-only. Closing diagnostics retains state; ending the session or reloading resets progress. No disk save, database, inventory or service is added. Desktop keyboard/mouse gameplay remains required; localized menus support keyboard focus and narrow scrolling.

## Acceptance and limits

Domain rejection, analytical results, fresh verification, deterministic completion, serialization/reopen/replay and M0–M2 regressions are tested. Browser coverage uses real traversal and UI, English/Lithuanian readings/explanations, world status and reset. See VALIDATION-M3.md for actual evidence and limitations. Target-age usability and representative target-hardware performance still need human playtesting; no certification is claimed. Do not merge automatically or begin M4.
