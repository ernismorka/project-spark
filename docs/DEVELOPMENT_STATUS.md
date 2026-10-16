# Development status

2026-10-16 — M0 is complete and PR #1 is merged; referenced M0 CI run 38911704767 passed. M1 is implemented on codex/m1-first-contact and PR #2 is open for review. No M2 implementation started and no merge performed by this session.

Completed: engineer/world, movement/jump/collision/recovery, camera/orbit/zoom, inspection/scanner, First Contact progression, EN/LT UI, lifecycle cleanup and automated coverage. 17 unit tests pass. Latest confirmed M1 CI at f0f5c47 passes 16 browser checks across Chromium and Firefox. Local Chromium suite passes; local Windows Firefox launch remains blocked (spawn UNKNOWN). Final language-focus addition and shared verifier require final-head CI confirmation; update this entry when available.

Autonomy setup: global Codex/security policies inspected and preserved. AGENTS.md now contains the standing workflow. pnpm doctor:project and pnpm verify provide local checks; CI uses the shared verifier and retains browser artifacts. Execution/validation/environment files support independent session resume. No automation has been scheduled and no automatic restart is promised.

Next action: confirm final PR-head CI, finalize validation/PR evidence, then await explicit review/merge authorization. Independent M2 scope/test planning is in M2_PREPARATION.md. Resume using the prompt in EXECUTION_PLAN.md.
