# M3 validation evidence

Baseline: merged M2 PR #3, main 4dc7084; GitHub main CI 38999625572 succeeded before M3 implementation.

Environment: Node 24.19.0, pnpm 11.25.0, Git 2.56.0 on Windows. doctor:project found both browser binaries.

Current checks: lint, typecheck, 63 unit tests and production build pass. Tests cover all existing M0–M2 fixtures plus R1 repair authorization/validation, faulty versus healthy solver outputs, immutable before-evidence, fresh measurements, explicit completion, duplicates, serialization/reopen, deterministic replay and matching EN/LT explanations. Browser route extends actual keyboard traversal through localized repair and completion; no test state injection.

First full pnpm verify reached browser tests: 8 Chromium regressions passed; extended route found an outdated focus assertion after adding the repair button (corrected). All 9 Firefox tests failed at launch with the known Windows spawn UNKNOWN error. Full local verification is therefore not yet passing. A final run is in progress. Linux CI retains both browsers without skipped tests.

Pending: final local run, actual screenshot review, GitHub CI and PR link. No FPS certification or target-age usability claim. The existing PlayCanvas chunk-size warning remains; no dependencies were added or upgraded. Solver implementation is unchanged.
