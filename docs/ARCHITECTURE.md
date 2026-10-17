# Architecture

## Modules and authority

apps/web owns React UI, browser lifecycle, input translation and PlayCanvas rendering. packages/shared exports serializable contracts, entity IDs and state types. packages/game-core owns the board metadata, collision dimensions, fixed-step movement, checkpoint recovery, interaction eligibility and First Contact progression. packages/electronics provides the bounded deterministic DC solver. No dependencies were added or upgraded for M1.

Input -> validated command -> game-core -> state -> presentation. The existing M0 createGame/execute language API and its tests are preserved. M1 adds a separate createSession/commandSession API. Unknown/malformed gameplay commands and invalid actions return the identical state. Domain code uses no browser globals, engine, wall clock or randomness. Commands do not accept client-reported positions or mission events. Single-player executes core rules locally. M5 executes pilot authority on its Colyseus server and publishes shared snapshots, as described below. Player IDs and optional future device references are serializable.

## Motion and interactions

Movement runs at 60 fixed steps/second; browser frame deltas accumulate with a 100 ms catch-up cap. Input is a normalized world-space direction with run/jump flags. Values are configured in game-core/world.ts and browser key bindings in game/input.ts. Axis-separated collision approximates the engineer as a cylinder against expanded static boxes, with downward swept top detection, acceleration, deceleration and gravity. This intentionally small solver supports one static board and stepped platforms, not general rigid bodies. Edges permit falling; below -8 units or beyond the recovery envelope the engineer returns to the starting checkpoint without losing mission progress.

Interaction commands carry stable component IDs. Core validates phase, capabilities, horizontal range (5 units) and player height. Nearby candidates are ordered by distance; the nearest is selected initially and UI buttons allow explicit selection. E inspects; F identifies supported components. Inspection is a domain phase that freezes motion and opens a localized panel. No raycast-dependent mission rules exist. Electrical measurements are terminal commands.

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

## M3 repair episode

Session.repair owns the R1 fault flag, fresh measurements and verified completion. episodeCircuit derives the fixed DC instance from that flag. repair-r1 is gated by terminal phase/proximity, completed exploration, identified diagnosis and original evidence. Only target R1 is repairable. It restores the nominal connection; no client circuit is accepted. measure-repair recalculates solver voltages; verify-repair checks fresh evidence against a new solution and the divider relationship. Duplicate/invalid commands preserve identity.

React shows before/after readings and localized completion. The renderer consumes repair flags for an abstract amber/green terminal beacon and verified strip, with no electrical rules in PlayCanvas. restart-episode returns a fresh playing session with all exploration and electrical state reset. Closing diagnostics preserves state; reload/end resets it. No durable save or network authentication is introduced.

## M4 workbench

programming.ts in game-core owns the editable bounded netlist, closed instruction model, strict parser/printer and deterministic step-limited interpreter. It calls the existing electronics solver before running; circuit errors prevent execution. No browser or host APIs occur in the interpreter. The UI edits through commandWorkbench and renders its computed result/trace; text execution applies the visible source first. Invalid source clears outputs and cannot execute a stale program.

WorkbenchPanel is a modal over the existing scene at title/completed terminal; movement is already frozen. It supports keyboard navigation and Escape, while preserving the scene lifecycle. Workbench lifetime is independent of M3 episode state. This is a virtual educational controller, not binary/firmware emulation. See GDD.md for grammar, limits, construction and persistence contract.

## M5 networking and authority

apps/server runs Colyseus core/ws transport on loopback 127.0.0.1:2567. Rooms are private and maxClients=2; framework room IDs are invitation codes. No listing/public matchmaking UI. Colyseus session identity is taken from the authenticated room socket, never from message fields. Client positions, voltages and completion claims are ignored. No player code is accepted.

packages/game-core/pilot.ts owns serializable players, complementary roles and one shared M3 mission. Direction inputs are finite, normalized and sequenced; the server integrates existing movePlayer at fixed 60 Hz, with stale inputs stopping after 15 ticks. The transport accepts movement no faster than 30 ms and actions no faster than 120 ms, with Colyseus's 60 messages/second ceiling and 2 KB WebSocket payload limit. Actions validate connection/role/proximity/evidence and pass closed commands to commandSession. Periodic authoritative snapshots are broadcast at 10 Hz; clients reject older revisions. There is no client prediction.

pilot-network.ts owns the client SDK and reconnection events. PilotPanel renders a separate top-down board/HUD, role actions and localized status; the existing scene stays inert/covered. 20-second reconnect reservations retain state; live reconnection uses SDK tokens. Voluntary/expired departure resets shared objectives to avoid inherited contribution credit; rooms auto-dispose when empty. No reload-token persistence is exposed. A private code is a bearer invitation, not user authentication.

Server limits active rooms to 16, rate-limits HTTP POSTs globally to 120/minute, checks browser origins on HTTP/WS boundaries and binds only loopback. No security guarantee for a public service is claimed. Colyseus supplies the room lifecycle and reconnect protocol; see https://docs.colyseus.io/room/reconnection and https://docs.colyseus.io/matchmaker/visibility. Snapshot broadcasts intentionally use bounded plain serializable messages instead of introducing a second schema-domain representation.

Dependencies are pinned: Colyseus core 0.18.18, ws transport 0.18.4, SDK 0.18.5, tsx runner and Express types. Existing dependencies are not upgraded. Optional esbuild/msgpackr native build scripts remain disabled via project allowBuilds=false; installed platform binaries/pure JS fallbacks work in verification. No release-age exemption or global security policy change is retained.
