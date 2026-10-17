# Game design document

## Vision and audience

Project Spark is a colorful, stylized 3D adventure for ages 12–18: a miniature engineer explores giant electronic devices. Accessible explanations support younger players; later optional challenges support advanced learners. Adventure must be fun before electronics expertise is required.

## Pillars and world

Curiosity, readable cause and effect, and creative engineering drive play. Circuit boards become landscapes; capacitors become towers and traces become paths. Exploration reveals problems and engineering changes the world. Technical claims must match an explicitly documented simulation scope.

## First episode: The Dark Circuit

Implemented in M3: explore the board through First Contact, diagnose the terminal training divider, reconnect its single open R1 branch, then prove the repair with fresh measurements. The terminal service beacon turns green after verification. This is an abstract circuit-status response, not simulated MCU or LED operation. See M3_PREPARATION.md for the exact behavior contract.

## MVP

A complete single-player browser episode, no account, installation or backend. English and Lithuanian. Future scope includes component identification, circuit construction and constrained microcontroller programming through blocks and text. Never execute arbitrary player JavaScript.

## Future cooperation

After the first complete episode, co-op can support shared diagnosis and complementary engineering roles. Server authority and session design remain future work.

## Non-goals

M0 established rendering, UI, localization, domain boundaries, tests and documentation. M1 adds exploration and the introductory mission. Programming, multiplayer, database, paid services and telemetry remain outside the implemented scope. Mobile menus are responsive; mobile gameplay is outside M1.

## M1: First Contact

Implemented: a miniature engineer explores a bounded 48 by 80 unit circuit board in third person. A yellow suit, helmet, visor, backpack and swinging limbs keep the character readable. Copper traces connect oversized striped resistor R1, electrolytic capacitor C1, LED D1, central microcontroller U1 and service terminal T1. Corner mounting pads, an edge connector and stepped platform form landmarks. All geometry and materials are procedural.

First Contact asks the player to leave the start pad, inspect R1, identify a different component, approach U1 and use T1. A gold beacon guides the current objective. Components can also be inspected outside the prescribed route without skipping objectives. Explanations are localized, electrically accurate within an identification-only scope, and make no measurement claims. The terminal hints at the controller fault for M2; repair is not implemented.

Intended pacing is 3–5 minutes for a new player exploring and reading. A direct route can be completed faster; no artificial timers enforce duration. Timing and usability with the target audience remain to be evaluated. Pause and inspection freeze motion. Falling returns to the start while preserving mission progress. Mobile menus adapt, but gameplay requires desktop keyboard and mouse.

M1 non-goals: solver, MCU execution, blocks/code editor, backend, multiplayer, inventory, crafting, accounts, detailed customization, procedural level generation or multiple levels. The Dark Circuit remains the future complete episode; First Contact is its introductory exploration slice.

## M2: electrical reasoning

Authorized after M1 PR #2 merged. Scope is a bounded, ideal steady-state DC training network accessed from T1 after First Contact. Players measure VCC/SENSE against GND and identify an open resistor using evidence. The existing world scanner still identifies components only; capacitor, LED and MCU visuals are not simulated. Repairs and complete episode design remain M3 work. Supported circuit elements, units, topology/numerical failures and educational claims are specified in M2_SIMULATION_SCOPE.md.

## M3: The Dark Circuit

A complete episode now connects exploration, evidence-based diagnosis, one bounded repair and explicit verification. Before/after readings explain equal-resistor voltage division; an amber beacon marks repair pending verification and green marks the verified network. The terminal tool reconnects R1 without inventory or crafting. Replay restarts all exploration, fault and evidence state. No progress is stored across reloads or ended sessions. English/Lithuanian menus, units and explanations are maintained. Automated real-input playthrough covers the sequence; target-age pacing/usability still requires human evaluation. M4 remains unstarted.
