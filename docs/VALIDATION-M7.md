# M7 validation and technical review

## Baseline and scope

M6 PR #8 merged as 870b195; branch codex/m7-integrated-gameplay starts there. M7_SCOPE.md was recorded before implementation. M6 PR final CI 39147918367 passed, but merged-main run 39152119594 failed one Chromium assertion (27/28 browsers passed): fixed 450 ms walking wait produced 0.433 units instead of >0.5 under software rendering. M7 replaces that wall-clock wait with polling for the unchanged displacement requirement. No movement constants, test assertion or graphics checks are weakened.

Environment: Windows / Node 24.19.0 / pnpm 11.25.0 / Git 2.56.0. Doctor found Chromium/Firefox binaries; it does not prove launch. Dependencies, lockfile, solver/interpreter implementations, Session API and M5 server/pilot rules are unchanged. No M8.

## Integrated behavior

Episode composes the existing Session and Workbench in game-core. Repair must be verified at T1 before terminal construction commands are accepted. The existing nominal R3 parallel challenge plus threshold-2 run records construction evidence. The editor then unlocks; an equivalent block/text READ SENSE / ABOVE 1 / WRITE OUT run records programming evidence. Final activation requires terminal range/phase, verified repair and both proofs, and recomputes the canonical circuit/controller before completion.

The nominal divider repair still solves SENSE = 2.5 V. The separate commissioning network with three nominal 1 kΩ resistors solves SENSE = 5/3 V: OFF above threshold 2, ON above threshold 1. No UI voltage or player completion flag is authoritative. A green U1 service display is an abstract activated-device response, not MCU execution, LED physics or a new electronics model. It remains outside immutable geometry batches.

Accepted terminal edits/proofs persist across modal close/reopen; title practice stays local and cannot award credit. Real edits invalidate current proof; circuit changes invalidate construction proof but leave an already unlocked editor usable for recovery. Reset/replay/end/reload clear the appropriate state. Activation is idempotent and freezes commissioning commands. Inspection/diagnosis review remains available. Repair copy now says DC repair verified rather than claiming premature episode completion.

## Tests executed

90 unit/domain/server integration tests pass: all original 81 plus nine Episode fixtures. New coverage includes unlock/phase/range/evidence gates, actual solver outputs, block/text equivalence, rejected early/invalid/stale/spoofed/budgeted commands, edit/reset recovery, isolated practice, idempotent completion, serialization and deterministic replay. Existing server integration and all solver/interpreter fixtures remain.

A standalone production Chromium full-episode run passed (1/1, 1.9 minutes): real movement, inspect/scan, wrong/correct diagnosis, R1 repair/reverify, world review, construction, controller execution, retained modal state, activation, final world feedback and replay. No teleport or injected progression API exists. Read-only canvas attributes observe renderer-consumed state.

First full pnpm verify: lint/typecheck, all 90 tests, build and all 14 Chromium flows pass. All 14 Firefox cases fail at Windows launch with known spawn UNKNOWN; full local verification is not passing. Both projects remain enabled in Linux CI. The final rerun includes commissioning status placement, initial editor-lock assertions, Lithuanian 1,67 V terminal persistence and practice-isolation checks. Its final outcome and GitHub result are recorded before handoff.

The existing long-route timeout is increased from 180 to 240 seconds to cover the additional authorized commissioning/activation interactions. Existing behavioral assertions remain; repair-completion wording expectations change to match the new distinction between verified repair and final episode completion.

## Visual and performance evidence

Initial inspected real-input captures show construction at 1.67 V/OFF, controller at 1.67 V/ON, LT completion and the active U1 display. Review found old M4 labeling and distant commissioning feedback; the terminal panel now labels T1 and repeats current guidance near results. Final captures are refreshed after the final complete run; narrow menus remain scrollable with persistent return navigation.

First full-run 1920×1080 software-host callback sample: ready 1293 ms, median 216.7 ms / p95 266.5 ms. M6 draw instrumentation still observes 72 submissions per sample frame at spawn, zero paused submissions and zero tracked live WebGL buffers after End session. These are workload/lifecycle observations, not a heap-profile or hardware FPS certification. No new sustained/representative hardware measurement is claimed for M7. The short AMD/D3D11 M6 observation remains historical evidence only. The scene chunk size advisory remains.

## Self-review and human-only follow-ups

Reviewed reducer ownership, command validation/ordering, fresh solver/interpreter activation, deterministic restart, modal focus/persistence, read-only renderer bridge and batch ownership. Self-review fixed a recovery trap: circuit edits after programming must not relock the editor until explicit reset. Switching equivalent editor tabs no longer invalidates unchanged accepted programs; actual edits still do. Final completion focuses its heading; main background remains inert under modals. Existing network/service/security boundaries are preserved.

Outstanding human-only checks: whole-episode fun/pacing, construction/programming unlock discoverability, distinction between diagnostic and commissioning networks, learning transfer, native-language clarity, assistive technology, activation satisfaction and sustained representative hardware frame/heap behavior. PLAYTEST.md records them without requiring owner testing during implementation. No public deployment, dependencies, new multiplayer or automatic merge.

Final route refinement passed the real-input episode again (2.0 minutes), including initial programming-lock enforcement, EN/LT terminal persistence and final heading focus. Five refreshed captures are inspected: m7-construction-en.png, m7-controller-en.png, m7-controller-lt.png, m7-complete-lt.png and m7-active-world.png. Visual review also caught the legacy sandbox advice to remove R3 after the construction challenge; that advice is now hidden in mission mode so it does not contradict the next programming objective. Practice retains its existing challenge feedback; a targeted adventure/practice rerun verifies this final presentation fix.

Final full verifier rerun: lint/typecheck/build, all 90 unit/domain/server tests and all 14 Chromium browser checks passed. All 14 Firefox cases still fail at Windows browser launch with spawn UNKNOWN; full local verify is not passing. This rerun includes the initial programming lock, recovery proof fixtures, EN/LT commissioning/persistence, activation and replay, plus every existing multiplayer/lifecycle/performance/safety regression. Final presentation-only removal-hint suppression is additionally covered by the adventure/practice targeted rerun.

Final targeted production-browser rerun passed 2/2: complete integrated episode including EN/LT commissioning, final activation/replay and the unchanged standalone practice construction/block/text/error/budget flow. Final presentation-fix captures are refreshed; construction now shows only the next mission objective, while practice still shows its original challenge response. Final lint/typecheck/build checks also pass. The final full software sample was ready 1331 ms, median 216.6 ms / p95 266.7 ms, with 72 spawn draw submissions. All source/diff review is complete; no unresolved implementation blocker identified. Final-head GitHub CI remains the delivery gate.

Delivery: PR #9 https://github.com/ernismorka/project-spark/pull/9, code/evidence e2fcb70. Final-head Linux CI is recorded in the PR rather than confusing an earlier gameplay-code run with validation of the final documentation commit. PR remains unmerged. No M8.
