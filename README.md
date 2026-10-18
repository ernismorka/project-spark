# Project Spark

Browser-first educational 3D engineering adventure. M3 adds a complete DC diagnosis, repair and verification episode to the single-player First Contact circuit-board exploration slice. No accounts, telemetry or external assets; M5 adds an optional loopback-only Colyseus server. PR #1 (M0) was merged before M1 began.

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

See docs/GDD.md for the exact bounded language and circuit model. The workbench uses no arbitrary JavaScript, MCU firmware emulation, LED physics or networking. M5 networking is a separate optional pilot. Human usability/performance testing is recorded for later consolidated playtesting.

## M5: open two local clients

Run in separate terminals:

```sh
pnpm install --frozen-lockfile
pnpm dev:server
pnpm dev
```

Open http://127.0.0.1:5173 in two tabs/windows. Select Cooperative pilot in each. Create private room in the first; copy its room code into the second and join. Role assignment is server-owned: first analyst, second engineer. Focus/click the top-down board and use WASD/arrows to move; T1's dashed ring marks the 5 m service range.

Analyst measures VCC; engineer measures SENSE; analyst diagnoses R1; engineer repairs; both remeasure; analyst verifies. Both players see shared readings, progress and each other's movement. English/Lithuanian can be chosen at title before entering the room. This optional pilot preserves the 3D single-player experience.

Reconnect transport exercises a live temporary drop. The server holds the seat for 20 seconds, pauses shared actions and preserves mission state on reconnection. Leave room releases the seat and resets the shared task; expiry does the same. Empty rooms clean themselves up. Reloaded tabs cannot recover an in-memory SDK token through the UI; wait for seat expiry and rejoin. No accounts or durable state. Room codes are private invitations, not passwords.

The server binds only 127.0.0.1:2567; this delivery is for two clients on the same computer and is not publicly deployed. Supported browser origins are localhost/127.0.0.1 ports 5173/4173. Playwright automatically starts the server and production preview. pnpm verify also runs independent Colyseus integration tests on an ephemeral loopback port. pnpm bench:pilot records a small domain tick/snapshot observation; it is not a scalability or target-hardware FPS claim. See docs/VALIDATION-M5.md for actual evidence and deferred consolidated playtesting.

## Consolidated MVP evaluation

M0–M5 are merged; main baseline f800be4 includes PR #6. The scope-preserving quality audit, actual gate results and limitations are in [VALIDATION-CONSOLIDATION.md](docs/VALIDATION-CONSOLIDATION.md). Use [PLAYTEST.md](docs/PLAYTEST.md) for one consolidated human session covering adventure, engineering and cooperation. Target-age usability, assistive technology and representative hardware measurements remain outstanding. [NEXT_STAGE_PROPOSAL.md](docs/NEXT_STAGE_PROPOSAL.md) compares future options without authorizing implementation.

## M6 single-player polish

The compass and beacon arrows follow camera orbit and name the current objective. Approach a component to reveal inspect/identify controls; movement requires board focus. Leaving board focus clears held controls. Existing keyboard/mouse controls, episode, circuit model, programming and cooperative pilot remain. Paused/covered views retain their last frame and resume when needed. See [M6_SCOPE.md](docs/M6_SCOPE.md) and [VALIDATION-M6.md](docs/VALIDATION-M6.md) for scope, measured draw reduction, the limited AMD hardware sample and outstanding human validation.
