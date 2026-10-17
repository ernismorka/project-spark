# M3 validation evidence

## Baseline and environment

M2 PR #3 was merged before work began. Main 4dc7084 passed CI run 38999625572. M3 branch: codex/m3-the-dark-circuit. PR: https://github.com/ernismorka/project-spark/pull/4. This session performed no merge.

Node 24.19.0, pnpm 11.25.0 and Git 2.56.0 on Windows. doctor:project found both browser binaries. No dependency/lockfile changes. git diff against main confirms the electronics solver implementation is unchanged.

## Automated checks

Lint, typecheck, all 63 unit tests and production build passed after the final UI copy changes. The existing PlayCanvas chunk-size warning remains.

The 57 M0–M2 tests remain, with five repair fixtures and one EN/LT copy fixture added. Coverage includes healthy/faulty solver outputs (0 V versus 2.5 V at SENSE, 0 versus 2.5 mA), evidence and terminal access gating, unsupported/malformed/duplicate repair commands, immutable before-evidence, fresh solver readings, explicit verification, completion idempotency, serialization/reopening and deterministic full replay.

pnpm verify was run locally. The completed corrected run passed all nine Chromium tests, including the full real-keyboard exploration/diagnosis/repair/verify/world-view/replay route. All nine Firefox tests failed at launch with the known Windows spawn UNKNOWN error; full local verify is therefore not passing. Firefox stays enabled in CI.

The first local route caught an outdated focus expectation after adding the repair button, which was corrected. Self-review added focus movement through repair/measurement/verification, and the route checks completion focus plus narrow EN/LT menus. One log attempt was interrupted because the log was placed inside Playwright's cleaned output folder; the final run used an ignored workspace log instead. A subsequent screenshot rerun timed out during a host/network interruption; it was rerun without changing gameplay rules.

Linux CI at 2ef7442 passed the full pnpm verify gate, 63 unit tests and all 18 Chromium/Firefox browser checks: https://github.com/ernismorka/project-spark/actions/runs/39000432007. The final code at 8ba07f0 also passed the local Chromium repair route after production rebuild (1/1, 1.7 minutes). Code/evidence commits have separate CI checks; the PR checks show current-head status.

## Screenshots and visual review

Actual production-preview captures from the real-input Chromium sequence are stored in docs/screenshots:

- m3-diagnosed-en.png: evidence-based R1 diagnosis with original computed measurements.
- m3-before-after-en.png: solver-derived before/after comparison and verification.
- m3-complete-lt.png: Lithuanian decimal formatting and completion explanation.
- m3-world-verified.png: unobstructed restored-board view, green service beacon and green status strip.

Review confirmed readable units, correct comparisons, no horizontal overflow in the tested narrow menus, and visible world response. Capture review caught stale milestone/footer labels and verification-required text after completion; these were corrected. The beacon/strip are abstract service indicators, not simulated semiconductor or MCU output.

## Self-review and remaining limits

Core owns electrical mutation, evidence and completion. UI commands contain only action/target IDs and never provide the authoritative voltage or circuit. Unsupported/early/out-of-range/duplicate repair requests return the same state. Movement, collision, camera/input lifecycle and M0 APIs remain intact. No editor, inventory, new backend, telemetry, player code execution or M4 work.

Progress is session-only; closing retains it, replay/end/reload resets it. Automated traversal is not target-age usability research. Representative hardware performance remains unverified; no FPS certification is made. Human code/product review and explicit merge authorization remain required.
