# Development status

2026-10-16 — M0 is complete and PR #1 is merged; referenced M0 CI run 38911704767 passed. M1 is implemented on codex/m1-first-contact and PR #2 is open for review. No M2 implementation started and no merge performed by this session.

Completed: engineer/world, movement/jump/collision/recovery, camera/orbit/zoom, inspection/scanner, First Contact progression, EN/LT UI, lifecycle cleanup and automated coverage. 17 unit tests pass. Implementation/setup CI at 7a715f9 passes the common verifier and 18 browser checks across Chromium and Firefox (https://github.com/ernismorka/project-spark/actions/runs/38917152835). Local Chromium suite passes; local Windows Firefox launch remains blocked (spawn UNKNOWN). The language-focus addition and shared verifier are included in that successful run.

Autonomy setup: global Codex/security policies inspected and preserved. AGENTS.md now contains the standing workflow. pnpm doctor:project and pnpm verify provide local checks; CI uses the shared verifier and retains browser artifacts. Execution/validation/environment files support independent session resume. No automation has been scheduled and no automatic restart is promised.

Next action: inspect current PR checks, then await explicit review/merge authorization. Implementation, self-review, screenshots and validation evidence are complete; target-hardware performance and target-audience pacing remain unverified. This final evidence update changes documentation only. Independent M2 scope/test planning is in M2_PREPARATION.md. Resume using the prompt in EXECUTION_PLAN.md.
