# Architecture

## Modules and authority

apps/web owns React UI, browser lifecycle, input translation and PlayCanvas rendering. packages/shared exports serializable contracts, entity IDs and state types. packages/game-core owns the board metadata, collision dimensions, fixed-step movement, checkpoint recovery, interaction eligibility and First Contact progression. packages/electronics remains documentation only. No dependencies were added or upgraded for M1.

Input -> validated command -> game-core -> state -> presentation. The existing M0 createGame/execute language API and its tests are preserved. M1 adds a separate createSession/commandSession API. Unknown/malformed gameplay commands and invalid actions return the identical state. Domain code uses no browser globals, engine, wall clock or randomness. Commands do not accept client-reported positions or mission events. The local client executes authoritative rules; a future server could use the same functions, but ownership, transport and synchronization are not implemented. Player IDs and optional future device references are serializable.

## Motion and interactions

Movement runs at 60 fixed steps/second; browser frame deltas accumulate with a 100 ms catch-up cap. Input is a normalized world-space direction with run/jump flags. Values are configured in game-core/world.ts and browser key bindings in game/input.ts. Axis-separated collision approximates the engineer as a cylinder against expanded static boxes, with downward swept top detection, acceleration, deceleration and gravity. This intentionally small solver supports one static board and stepped platforms, not general rigid bodies. Edges permit falling; below -8 units or beyond the recovery envelope the engineer returns to the starting checkpoint without losing mission progress.

Interaction commands carry stable component IDs. Core validates phase, capabilities, horizontal range (5 units) and player height. Nearby candidates are ordered by distance; the nearest is selected initially and UI buttons allow explicit selection. E inspects; F identifies supported components. Inspection is a domain phase that freezes motion and opens a localized panel. No raycast-dependent mission rules or electrical measurements exist.

The six mission stages are strictly ordered: leave pad, inspect resistor, scan a different type, approach MCU, use terminal, completion. Core derives movement objectives from validated positions. Discovery lists deduplicate IDs. Early exploration is allowed without skipping objectives; actions must be repeated at the relevant stage.

## Rendering and lifecycle

Scene bootstrap preserves AppBase with only render/camera/light systems. game/geometry.ts owns reusable materials; game/world.ts builds procedural component and engineer visuals; game/input.ts owns browser listeners and pointer lock; game/camera.ts owns orbit, smooth follow, zoom, pitch clamp and segment-vs-expanded-box camera obstruction. Camera collision pulls the camera toward the player before an obstruction. Minimum near clip is 0.08. Visual limbs animate from velocity; no mission rules exist in renderer code.

React keeps the authoritative session in a ref for synchronous command processing and publishes immutable snapshots at 10 Hz for HUD updates. Canvas data attributes expose read-only position/phase/camera observations for browser verification; no test teleport, injected progression command or global cheat API exists. Menus focus their first button and trap Tab inside the dialog. Resume returns focus to canvas. Clicking canvas requests pointer lock; dragging is also supported if denied. Escape, blur, menu transition and context loss clear input and release lock. Losing pointer lock pauses play.

ResizeObserver follows the canvas container. Retry replaces the canvas and recreates graphics while preserving the paused session. End session unmounts rendering. Cleanup is idempotent and removes input listeners/update callback/observer, releases lock, destroys app/entities/device and materials. An aborted async graphics bootstrap destroys its device. Initialization failures remain an explicit error state. WebGL 2, pixel ratio <=1.5, procedural primitives and no postprocessing keep asset cost small.

## Localization and tests

Typed English/Lithuanian dictionaries include objectives, component explanations, controls, menus and feedback. Language selection pauses active play and updates document language; preferences and progress are session-only. No backend, accounts or telemetry.

Vitest runs deterministic domain fixtures plus pure camera tests in Node. Playwright preserves M0 coverage and adds real-keyboard mission traversal, jump/collision/zoom, pause/resume, loss/retry and unmount/remount checks. Tests observe state through canvas data attributes and use ordinary input and UI, never bypassing core rules. CI retains Chromium and Firefox, using Xvfb/software GL for strict real rendering. Local Windows Firefox launch may be blocked by the known environment error; this does not remove Firefox CI coverage. Performance targets need representative hardware measurements; no 60 FPS certification is claimed.

## M2 electronics and diagnosis

packages/electronics is now an executable Node-compatible workspace package depending only on shared contracts. solveDC accepts unknown input, bounds/validates it and returns voltages/current maps or explicit invalid/unsupported/floating/singular/numerical errors. Modified nodal analysis uses sorted stable IDs, row-scaled partial pivoting and residual checks. See M2_SIMULATION_SCOPE.md for exact units, supported elements and numerical limits; there is no nonlinear or transient solver.

game-core depends on electronics and owns a fixed terminal training model plus evidence-based diagnostic commands. Completed First Contact and terminal proximity unlock diagnosing phase. Measurement commands specify node IDs; core computes voltages and stores serializable evidence. Invalid/duplicate readings preserve state; both readings are required before an answer; correct diagnosis is terminal and duplicates cannot award progress. Closing preserves evidence. No client-provided voltage, renderer entity script or uncontrolled circuit editor owns these rules.

React DiagnosticPanel renders a schematic, test points, evidence and localized hypotheses. Measurements are explicitly scoped to this separate ideal resistor network, not the microcontroller internals or decorative PCB traces. The renderer/input lifecycle is preserved; diagnosing freezes motion like other menu phases. Unit tests cover electrical analytic results, Kirchhoff/current/power invariants, invalid topology, input permutation and diagnosis gating. The existing real-input browser mission route now continues through English/Lithuanian measurement and correct/incorrect fault selection.
