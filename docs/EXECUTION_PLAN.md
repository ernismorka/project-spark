# Execution plan

M6 3D Gameplay Polish, branch codex/m6-gameplay-polish, from merged PR #7 main b7ba063. Baseline main CI 39146560357 passed. M6_SCOPE.md recorded scope/acceptance before implementation. No M7 or new major systems.

Implemented: normalized camera-relative input and canvas focus ownership; close-obstruction camera clearance/fallback and reused scratch vectors; shared objective target, camera-relative compass/beacon arrows, EN/LT approach/identified guidance and visible keyboard focus; static-board batching with explicit cleanup and state/resize-driven frozen rendering. Solver, domain movement constants, programming and pilot authority remain unchanged.

Evidence: VALIDATION-M6.md records baseline/after draw submissions (110 → 72), software-host timing limits and an independent actual AMD/D3D11 1080p 90-frame observation (median/p95 16.7 ms at spawn). Before/after captures inspected. All 81 unit/domain/server tests pass. Full pnpm verify passed lint/types/build and 14 Chromium flows; all 14 local Firefox cases fail at known Windows spawn UNKNOWN launch. Both browsers remain mandatory in Linux CI. Final targeted Chromium rerun passes 2/2 after rebuild, including actual close-wall camera capture, final pad-exit copy and GPU buffer cleanup. All five screenshots are inspected.

Implementation, self-review, local validation and inspected captures are complete. PR #8 is open against main: https://github.com/ernismorka/project-spark/pull/8. Code/evidence commit 85ab25b. Final-head Linux CI is tracked in the PR; verify its outcome before handoff. Then await owner review; do not merge. Human camera comfort, navigation clarity, target-age learning/pacing and sustained representative hardware/heap profiling remain deferred in PLAYTEST.md.
