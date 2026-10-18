# Game design document

## Vision and audience

Project Spark is a colorful, stylized 3D adventure for ages 12–18: a miniature engineer explores giant electronic devices. Accessible explanations support younger players; later optional challenges support advanced learners. Adventure must be fun before electronics expertise is required.

## Pillars and world

Curiosity, readable cause and effect, and creative engineering drive play. Circuit boards become landscapes; capacitors become towers and traces become paths. Exploration reveals problems and engineering changes the world. Technical claims must match an explicitly documented simulation scope.

## First episode: The Dark Circuit

Implemented in M3: explore the board through First Contact, diagnose the terminal training divider, reconnect its single open R1 branch, then prove the repair with fresh measurements. The terminal service beacon turns green after verification. M7 now continues that repair into terminal construction, controller commissioning and final device activation. World responses are abstract service status, not simulated MCU or LED operation. See M3_PREPARATION.md for the exact behavior contract.

## MVP

A complete single-player browser episode, no account, installation or backend. English and Lithuanian. The implemented MVP includes component identification, bounded resistor circuit construction and constrained virtual controller programming through blocks and text. Never execute arbitrary player JavaScript.

## Future cooperation

After the first complete episode, co-op can support shared diagnosis and complementary engineering roles. M5 now implements a local private-room pilot with server authority and complementary roles; see the M5 contract below.

## Non-goals

M0 established rendering, UI, localization, domain boundaries, tests and documentation. M1 adds exploration and the introductory mission. M4 adds the bounded programming workbench and M5 adds the separate local cooperative pilot. Database, paid services, accounts, telemetry, public multiplayer deployment and arbitrary player code remain outside scope. Mobile menus are responsive; mobile gameplay is outside M1.

## M1: First Contact

Implemented: a miniature engineer explores a bounded 48 by 80 unit circuit board in third person. A yellow suit, helmet, visor, backpack and swinging limbs keep the character readable. Copper traces connect oversized striped resistor R1, electrolytic capacitor C1, LED D1, central microcontroller U1 and service terminal T1. Corner mounting pads, an edge connector and stepped platform form landmarks. All geometry and materials are procedural.

First Contact asks the player to leave the start pad, inspect R1, identify a different component, approach U1 and use T1. A gold beacon guides the current objective. Components can also be inspected outside the prescribed route without skipping objectives. Explanations are localized, electrically accurate within an identification-only scope, and make no measurement claims. The terminal hints at the controller fault for M2; repair is not implemented.

Intended pacing is 3–5 minutes for a new player exploring and reading. A direct route can be completed faster; no artificial timers enforce duration. Timing and usability with the target audience remain to be evaluated. Pause and inspection freeze motion. Falling returns to the start while preserving mission progress. Mobile menus adapt, but gameplay requires desktop keyboard and mouse.

M1 non-goals: solver, MCU execution, blocks/code editor, backend, multiplayer, inventory, crafting, accounts, detailed customization, procedural level generation or multiple levels. The Dark Circuit remains the future complete episode; First Contact is its introductory exploration slice.

## M2: electrical reasoning

Authorized after M1 PR #2 merged. Scope is a bounded, ideal steady-state DC training network accessed from T1 after First Contact. Players measure VCC/SENSE against GND and identify an open resistor using evidence. The existing world scanner still identifies components only; capacitor, LED and MCU visuals are not simulated. Repairs and complete episode design remain M3 work. Supported circuit elements, units, topology/numerical failures and educational claims are specified in M2_SIMULATION_SCOPE.md.

## M3: The Dark Circuit

A complete episode now connects exploration, evidence-based diagnosis, one bounded repair and explicit verification. Before/after readings explain equal-resistor voltage division; an amber beacon marks repair pending verification and green marks the verified network. The terminal tool reconnects R1 without inventory or crafting. Replay restarts all exploration, fault and evidence state. No progress is stored across reloads or ended sessions. English/Lithuanian menus, units and explanations are maintained. Automated real-input playthrough covers the sequence; target-age pacing/usability still requires human evaluation. M4 and M5 are now implemented and merged.

## M4 implementation contract

M4 retains the approved Creative programming milestone: circuit building and constrained block/text controller programming. A separate local workbench is available at title and the completed terminal, preserving M0–M3 gameplay. It supports up to eight positive resistors R1–R8, editable endpoints among VCC/SENSE/GND, removal and resistance changes (1 Ω to 1 MΩ), with a fixed ideal 5 V source. Actual topology is passed to the unchanged DC solver; floating networks report errors. This is bounded circuit construction, not semiconductor simulation.

Blocks and text compile to one closed serializable instruction array. Grammar: READ SENSE loads the solved voltage into a register; ABOVE n replaces it with 1 if strictly greater than n (0–5), otherwise 0; WRITE OUT sets an abstract boolean output from the register; REPEAT n repeats the preceding whole prefix n times (1–128). Each repeat instruction has its own counter, reset per run. Registers/output start at zero/false; at most 32 instructions, 2048 source characters and 128 executed steps. Budget exhaustion clears committed output and reports an error. Trace length is bounded. No eval, Function, JavaScript, timers, network, hardware pin emulation or host access.

The challenge adds a parallel SENSE-to-ground branch and observes the controller threshold response. Trace and results expose cause/effect. Workbench edits invalidate previous results. Title practice is session-local and resets when closed/reopened; M7 terminal workbench state persists within its episode, as specified below. Both reuse the unchanged bounded Workbench API. English/Lithuanian controls and number formatting are supported. M4 and dependent M5 are now approved and merged. Consolidated human usability and representative hardware performance testing is deferred at owner request.

## M5 cooperative pilot

M5 adds an optional private-room cooperative mode from the title, separate from the preserved 3D single-player adventure and M4 workbench. It uses a readable top-down board with the existing board coordinates and movement/collision domain; it is a local two-client pilot, not network prediction or a new 3D renderer.

Two complementary roles collaborate at T1. Analyst gathers VCC, engineer gathers SENSE; both must be connected and within interaction range for their own actions. The analyst identifies R1 from shared evidence, the engineer restores the connection, both remeasure, and the analyst verifies. The existing game-core diagnosis/repair commands and electronics solver own all resulting voltages and completion. Optional wrong hypotheses retain evidence and give localized feedback.

Transient disconnects reserve the same identity/role for 20 seconds, stop its movement and pause shared actions. Live SDK reconnection preserves the task. Intentional leave or expiration removes that player and resets shared task evidence/repair; the surviving player retains role/position and a replacement can join. When empty, rooms dispose. Browser reload/manual token recovery is not exposed; after a closed/reloaded tab, wait for reservation expiry and rejoin by code. No durable persistence, accounts, chat or public deployment.

## M6: 3D Gameplay Polish

Authorized on merged consolidation PR #7. Preserve the existing board/mission and procedural style. Normalize camera-relative input before rotation, clear held movement when canvas focus leaves, keep close obstruction views nondegenerate, align compass/target arrows with orbit and show localized approach/identified cues. Static geometry can be batched without changing its educational meaning; paused/covered views retain their frame until state or size changes. No new multiplayer, solver categories, language instructions, backend or major redesign. See M6_SCOPE.md for acceptance and VALIDATION-M6.md for actual evidence. M7 is subsequently authorized below.

## M7: Integrated Gameplay Experience

Authorized on merged M6 PR #8 main 870b195. The single-player episode now composes the existing systems: explore the board and reach T1; gather measurements and diagnose R1; reconnect and verify its divider; unlock terminal construction; add the M4 parallel R3 branch and run the default threshold-2 program to prove the computed OFF response; unlock/edit the same controller in blocks or text to threshold 1 and run to prove ON; return to the terminal report and explicitly activate the device. This is one guided episode, not a new electronics category or MCU emulator.

The canonical commissioning network is separate from the repaired diagnostic network. It uses nominal R1/R2/R3 = 1 kΩ, R3 between SENSE and GND, with the existing ideal 5 V source. SENSE is solved as 5/3 V (shown 1.67 V EN, 1,67 V LT). READ SENSE / ABOVE 2 / WRITE OUT gives OFF; ABOVE 1 gives ON. Activation rechecks the actual topology/program with the existing solver/interpreter; no client success flag or literal UI voltage is authoritative. The final green service display on U1 is an abstract response, not physical MCU/LED execution.

Title workbench remains optional independent practice and cannot grant episode credit. Verified repair unlocks the terminal workbench, whose accepted edits/proofs persist on close. Programming unlocks after the first construction proof; later circuit edits invalidate construction/commissioning evidence while leaving the editor usable for recovery. Reset relocks programming; replay/end/reload clear the complete episode. No durable save. Repair verification is labeled as repair completion, while only final activation completes the episode. Existing cooperative pilot stays independent. No M8 authorization. See M7_SCOPE.md and VALIDATION-M7.md.
