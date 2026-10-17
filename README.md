# Project Spark

Browser-first educational 3D engineering adventure. M3 adds a complete DC diagnosis, repair and verification episode to the single-player First Contact circuit-board exploration slice. No accounts, telemetry, backend or external assets. PR #1 (M0) was merged before M1 began.

## Run

Use Node.js 24 and pnpm 11.25.0 on Windows, macOS or Linux. Existing dependency versions remain pinned without upgrades.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:5173 and choose Begin exploration. WebGL 2 and hardware acceleration are required. Errors offer retry without falsely reporting rendering success. English and Lithuanian selection is session-only.

## Controls

| Input                     | Action                                |
| ------------------------- | ------------------------------------- |
| WASD                      | Move relative to camera               |
| Shift                     | Run                                   |
| Space                     | Jump                                  |
| Click canvas / mouse drag | Capture pointer / orbit camera        |
| Mouse wheel               | Zoom                                  |
| E                         | Inspect selected nearby component     |
| F                         | Identify supported selected component |
| Esc                       | Pause/release mouse; close inspection |

Buttons support keyboard focus. Pause offers Resume and End session. Inspection freezes motion and returns with Continue exploring. The closest eligible component is selected automatically; nearby buttons choose another. Falling respawns at the starting pad while keeping progress. Controls and movement constants live in apps/web/src/game/input.ts and packages/game-core/src/world.ts.

## Validate

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium firefox
pnpm test:e2e
```

Linux CI installs browsers with `--with-deps` and runs headed tests under Xvfb/software GL. Browser tests use production preview port 4173. After editing source, rebuild before e2e. `pnpm format` applies formatting. Known local Windows Firefox `spawn UNKNOWN` may prevent launch; Chromium can be run with `pnpm test:e2e --project=chromium`. Firefox remains enabled in CI.

## Manual QA

1. Start; verify the engineer is visible. Walk/run/stop and jump. Walk into R1 and U1 to check solid collision. Jump onto the east stepped platform. Walk off a board edge and verify checkpoint recovery.
2. Click the board, orbit/zoom and approach large components; verify the camera pulls in before geometry. Press Esc to release the pointer; pause must freeze movement. Resume and confirm no stuck keys. Also test denied pointer lock with drag orbit.
3. Follow the beacon: leave pad, inspect striped R1 (E), scan blue C1 (F), approach U1, then use T1. Read LED and MCU explanations optionally. Try terminal early and repeated interactions; neither should skip objectives. Complete and replay.
4. Switch to Lithuanian at title, pause and inspection; verify copy/layout and return to play. Check 1280x720 and narrow menus. Desktop keyboard/mouse gameplay is required.
5. Lose WebGL context using browser tools; verify explicit error, retry and preserved progress. End session/remount several times; verify one canvas, no stuck input or stale callbacks.

See docs/GDD.md, docs/ARCHITECTURE.md, docs/ROADMAP.md and docs/VALIDATION-M1.md for scope and actual validation. Performance targets are not certified on representative midrange hardware. Session progress is not saved across reloads.

## Autonomous development

`pnpm doctor:project` checks versions and installed browser binaries. `pnpm verify` runs every quality gate sequentially and fails on the first unsuccessful stage. CI runs the same verifier, with headed browsers under Xvfb. See AGENTS.md, docs/AUTONOMOUS_WORKFLOW.md, docs/EXECUTION_PLAN.md and docs/DEVELOPMENT_STATUS.md for standing instructions, environment limits and exact session handoff. No scheduled runner is enabled automatically.

## M2 terminal diagnostics

Complete First Contact at T1, then choose Open terminal diagnostics. Measure VCC and SENSE relative to GND and identify the fault from the healthy reference. Wrong explanations retain your evidence; closing/reopening retains progress. The model supports only ideal steady-state resistors and voltage sources. It does not simulate the MCU, LED or capacitor, and M3 permits only one R1 connection repair. English/Lithuanian readings use localized decimal separators and explicit volts. See docs/M2_SIMULATION_SCOPE.md.

M2 manual QA: verify hypotheses are disabled until both points are measured; obtain 5.00 V at VCC and 0.00 V at SENSE; try R2 open (incorrect), then R1 open (identified). Switch language, close/reopen, and verify the diagnosis/evidence persist. Check keyboard Tab navigation and narrow menu scrolling. Restarting exploration resets diagnosis. Original M1 QA remains applicable.

## M3 repair episode

After identifying R1, choose Restore R1 connection. Remeasure both VCC and SENSE, compare Before repair and After repair, then choose Verify repair. The solver computes the restored divider voltage. The terminal beacon changes to amber after repair and green after verification; a green strip appears on the board. These are abstract DC status cues, not MCU/LED simulation.

Close diagnostics to see episode completion and replay. Replay resets the entire exploration, fault, measurements and completion; reload/end session also resets progress. No persistent save. Both languages support the full flow. M2's solver is unchanged; see docs/M3_PREPARATION.md and docs/VALIDATION-M3.md.

Manual M3 QA: try repair only after evidence-based R1 diagnosis, compare 0.00 V before and 2.50 V after at SENSE, verify, close/reopen and switch languages. Confirm green world response, then replay and confirm the fault and exploration reset. Repeat keyboard focus and narrow-screen menu checks. M0–M2 checks remain applicable.

## M4 Creative programming

Open creative workbench from title or the completed terminal. Run the initial divider/controller, connect default R3 between SENSE and GND, then run again: observe the changed solver voltage and virtual output. Edit instruction blocks or switch to the equivalent text; apply/run, inspect the bounded execution trace, remove branches and reset. Source keywords are stable English identifiers; explanations and controls are EN/LT. Closing/reopening resets workbench edits. It does not change the M3 repaired circuit.

See docs/GDD.md for the exact bounded language and circuit model. No arbitrary JavaScript, MCU firmware emulation, LED physics, backend or M5 functionality. Human usability/performance testing is recorded for later consolidated playtesting.
