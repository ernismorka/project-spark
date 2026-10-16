# M2 validation

## Executed quality checks

Project doctor passes in the scoped host context. Lint, typecheck, 57 unit tests and production build pass. Existing dependencies remain pinned; lockfile changes add only local electronics/shared workspace links. Initial M2 common-verifier CI at aebc1ec passed; subsequent UI/test fixes at 8480cb4 passed all checks plus 18/18 browser checks in Chromium and Firefox: https://github.com/ernismorka/project-spark/actions/runs/38965501728. Final evidence/footer-copy update changes no electrical behavior; consult latest PR checks for that commit.

All original M0/M1 unit and browser assertions are retained. The real-input mission route now continues through terminal access, evidence gating, 5 V / 0 V readings, wrong and correct diagnosis, Lithuanian decimal formatting, persistence on close/reopen, keyboard focus and narrow-menu visibility. Final local mission rerun passed after an interrupted run. Other Chromium regression checks passed in serial runs. Full local pnpm verify was executed but is not reported as passing: Windows Firefox cannot launch (9 spawn UNKNOWN failures), and one long-interrupted run timed out on the route. A six-worker attempt also exposed a fixed-sleep jump assertion; default worker count is now one and jumping is observed by state polling. CI retains both browsers and all assertions.

## Numerical evidence

57 tests across five files cover original game behavior, camera, solver and terminal diagnosis. New fixtures include Ohm law, series/parallel/divider networks, polarity, sources between non-ground nodes, open branches, floating graphs, conflicting/redundant ideal sources, bounds/unsupported inputs, JSON/immutability/input-order replay, current conservation and signed power balance. Diagnosis tests enforce range, phase, evidence, correct/incorrect outcomes and duplicate/persistence semantics. No client measurement value or test teleport can bypass core rules.

Measured Node 24.19.0 sample: 100 warmups, then 5,000 successful solves of a 16-node chain containing 15 x 1 kohm resistors and one ideal 5 V source: 439.7363 ms total. This is one host's solver cost, not a game FPS benchmark. The sampling command imported packages/electronics/src/index.ts directly in Node, independently of rendering.

## Browser/visual evidence

Actual EN/LT terminal captures were inspected. A clipped/scrolling title found in the first captures was fixed by keeping the dialog heading and return button outside its scrolling content. Browser checks require both controls to stay inside the narrow viewport; measured readings and identified fault remain readable. Captures are in docs/screenshots/m2-diagnosis-en.png and m2-diagnosis-lt.png. The scanner remains identification-only; the diagnostic footer explicitly labels the separate resistor model.

CI frame-callback sample at 8480cb4 (1920x1080, software graphics): Chromium median ~233.4 ms, p95 ~433.3 ms, ready including start 1471 ms; Firefox ~17.1 ms/~17.12 ms, ready 548 ms. This does not establish 60 FPS on representative hardware. UI JS is ~250 KB minified / 80 KB gzip; lazy engine ~1.07 MB / 280 KB gzip retains Vite's advisory. No target-laptop, target-audience pacing or heap-profiler certification is claimed.

## Self-review and limits

Rules and numerical code remain browser/renderer-independent; diagrams/UI consume core results. No external dependencies, services, secrets, accounts, telemetry, dynamic player code or multiplayer were introduced. Input/network/global sandbox policies were not changed. Fixed input bounds and explicit solver failures avoid pretending that unsupported/non-unique circuits have valid measurements. No critical unresolved finding identified in self-review; human review remains pending.

Supported subset is ideal linear DC only. No LED/capacitor dynamics, MCU execution, general circuit editor, repair or full episode. M3 planning only is documented separately and waits for an approved M2 baseline.
