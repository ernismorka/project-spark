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
