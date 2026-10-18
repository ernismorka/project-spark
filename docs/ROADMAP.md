# Roadmap

| Milestone               | Scope                                                                                     | Acceptance                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| M0 Foundation           | Workspaces, static PlayCanvas scene, React, EN/LT, command boundary, tests, CI, docs      | Fresh install and all checks pass; supported browser renders; fallback explicit; no gameplay                    |
| M1 Exploration slice    | Miniature engineer controls, camera, bounded board traversal, accessible interaction cues | Complete traversal task with keyboard; stable lifecycle and frame budget measured on midrange laptop; no solver |
| M2 Electrical reasoning | Documented deterministic simulation subset and diagnosis interactions                     | Known circuits match analytical fixtures within specified tolerances; invalid circuits explain failure          |
| M3 The Dark Circuit     | First complete single-player episode with repair, narrative and learning feedback         | New players complete episode; save/restart behavior specified and tested; learning claims reviewed              |
| M4 Creative programming | Circuit building and constrained block/text microcontroller environment                   | Equivalent blocks/text produce deterministic results; execution bounded and isolated; no arbitrary JavaScript   |
| M5 Cooperative pilot    | Colyseus authority using shared domain, synchronized roles and recovery                   | Two clients cooperate; malformed commands rejected; reconnect and ordering tested; no premature scale promises  |

M1 implements First Contact: third-person walk/run/jump, orbit camera, static collision, identification and ordered introductory objectives. Acceptance is gated by domain tests and real-input browser completion, including teardown and WebGL handling. User pacing and 60 FPS on target hardware remain playtest/measurement work. Multiplayer begins only after the first complete playable episode. Prioritize accessibility and technical accuracy throughout.

M2 implementation uses a documented linear DC subset (positive resistors, explicit open resistors, independent ideal voltage sources). Terminal diagnosis follows M1; repair remains outside M2. See M2_SIMULATION_SCOPE.md and current execution/status files for evidence and remaining review gates.

M3 implements the full bounded repair/verify episode on merged M2. See M3_PREPARATION.md for local authority, electrical claims, completion and replay/save semantics, and VALIDATION-M3.md for measured evidence. This row records the M3 scope; M4 and M5 have since been approved and merged.

M4 implementation follows the existing Creative programming row: bounded resistor-network construction and equivalent block/text virtual controller execution. See GDD.md for grammar, numerical limits and persistence. M4 and its dependent M5 pilot are now implemented and merged.

M5 implements the existing Cooperative pilot row with local private Colyseus rooms, two complementary contributors, shared solver-backed repair, authoritative movement and reconnect/cleanup. The 3D single-player and programming modes remain intact. See GDD.md and ARCHITECTURE.md for the bounded pilot contract. M6 is now separately authorized as the narrow quality scope below.

All originally approved milestones M0–M5 are complete. Consolidation is merged in PR #7; see VALIDATION-CONSOLIDATION.md and PLAYTEST.md. Human acceptance observations remain outstanding even where technical gates pass. NEXT_STAGE_PROPOSAL.md compares future options; option A is now narrowly authorized as M6; options B/C remain unapproved and earlier milestones are not renumbered.

| Milestone             | Scope                                                                                                        | Acceptance                                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M6 3D Gameplay Polish | Existing single-player movement/camera/orientation/readability and rendering/lifecycle; no new major systems | M6_SCOPE.md acceptance, preserved M0–M5 tests, new meaningful regressions, inspected before/after captures, measured workload/performance with explicit limits and an unmerged PR |

M6 is merged as PR #8, main 870b195. M7 is now explicitly authorized below; no M8.

| Milestone                         | Scope                                                                                                                                         | Acceptance                                                                                                                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| M7 Integrated Gameplay Experience | Compose existing single-player exploration, evidence-based repair, unlocked construction/controller commissioning and final device activation | Guarded deterministic progression, real solver/interpreter results, isolated practice, persistent terminal edits, visible active-device feedback, EN/LT completion/replay, preserved regressions and full CI |

M7_SCOPE.md defines the bounded activation contract. No new multiplayer, model categories, language features, database/deployment or unnecessary dependencies. Proposed broader engineering/co-op expansion remains unapproved. Do not merge M7 automatically or begin M8.
