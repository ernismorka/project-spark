# M6 — 3D gameplay polish scope

Authorized after PR #7 merged as b7ba063. Branch codex/m6-gameplay-polish starts from that main baseline. This document records scope/acceptance before implementation.

Scope: improve existing single-player input consistency, camera obstruction behavior, navigation/interaction cues, EN/LT readability, render work and lifecycle. Investigate reproducible defects first; keep the existing board, procedural visual style, ordered episode, deterministic movement/solver, programming and separate cooperative pilot intact. No multiplayer expansion, electrical categories, language features, backend/deployment work, new dependencies or major visual redesign. No M7.

Acceptance criteria:

1. Held/released controls, camera-relative movement and pause/resume remain deterministic, with meaningful input/camera regressions for fixes found. Existing walking/running/jumping/collision and checkpoint behavior remain.
2. Camera obstruction tests cover close components and a stable nondegenerate view; orbit/zoom retain existing clamps. Navigation cues communicate the current target/direction after orbit, with localized contextual interaction feedback.
3. Existing mission, repair/verify/replay, workbench and two-player flows pass. Preserve every existing unit/browser test; add focused regressions. Interfaces retain keyboard navigation, EN/LT and narrow-menu readability.
4. Capture and inspect comparable before/after real-browser views. Record actual rendering/work measurements and graphics backend; do not equate CI/software rendering with hardware FPS or claim heap profiling from listener counts.
5. Rendering/lifecycle changes bound work while covered/paused, release owned resources, and pass context-loss/retry/end/remount checks. Any performance improvement must have measured evidence or a directly counted workload reduction.
6. Run doctor and pnpm verify; resolve reproducible failures. Keep Firefox enabled in CI and report the known Windows launch limitation separately. Review the diff, document limitations, update status/roadmap and create an unmerged PR. Target-age feel and representative hardware remain consolidated human checks.

Initial investigation: inspect input event ownership/normalization, camera segment clipping near solid faces, north/target UI during orbit and static/idle render work. Select small fixes supported by code/browser evidence; no redesign or new progression mechanics.
