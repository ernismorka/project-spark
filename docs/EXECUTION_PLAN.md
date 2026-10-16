# Execution plan

## Current milestone

M1 First Contact, branch codex/m1-first-contact, based on merged M0 main cdb99c2. Reviewable PR: https://github.com/ernismorka/project-spark/pull/2. Awaiting human review/merge authorization after final verification. Autonomous workflow setup is included as a separate focused commit per the subsequent approved setup brief.

## Completed work

M0 baseline/merge and CI verified. Implemented procedural PCB and engineer; fixed-step walk/run/jump, static collision and fall recovery; orbit/follow/zoom with clipping prevention; ID-based nearby selection and inspect/identify; strictly ordered First Contact mission; localized HUD, menus, explanations, pause/resume and completion; context-loss retry and teardown; domain/camera tests and real-input browser traversal. No dependencies upgraded. Added standing autonomy instructions, project doctor, fail-fast verifier, CI isolation/artifact improvements, environment audit and durable tracking.

## Acceptance and evidence

- Visible controllable engineer and explorable world: real keyboard browser traversal and inspected gameplay screenshots.
- Four educational component categories with valid inspection metadata: core fixtures and localized descriptions; no measurements or solver.
- Mission completes without direct state injection: browser route and ordered core tests.
- Pause, jump, collision, zoom/orbit, pointer release and localization: browser checks plus camera/domain tests.
- Cleanup: observed game input listeners removed on session unmount (known Playwright hit-test callbacks excluded); retry retains progress and remount starts clean.
- Architecture/security: no React, engine or browser imports in domain packages; serializable commands validated at core boundary; no backend, credentials, telemetry, player code execution or networking added.
- 17 unit tests passed. Original M0 tests retained. Last verified CI on f0f5c47: 16/16 Chromium/Firefox browser checks plus lint/types/units/build passed at https://github.com/ernismorka/project-spark/actions/runs/38916007502. Final expanded 18-check suite/common verifier to be confirmed on the final commit.
- Local Windows full run: 8 Chromium checks passed, 8 Firefox launch failures with spawn UNKNOWN. Added keyboard language-focus test passed separately. See docs/VALIDATION-M1.md for exact outcomes and performance caveats.

## Remaining tasks

1. Confirm latest CI runs the common verifier and all 18 browser checks, resolve any failure, and record the actual result.
2. Complete self-review and PR description with final screenshots/results/limitations.
3. Human review and explicit merge authorization for PR #2. No automatic merge.
4. Representative midrange laptop performance and new-player pacing playtest remain unverified product targets; do not invent certification.

## Dependencies and blockers

No new dependency needed. Browser downloads/localhost/Git mutation may need scoped host approval in this environment. Windows Firefox launch is locally blocked; Linux Firefox CI is required evidence. M2 implementation depends on an approved M1 baseline. No background runner has been configured; scheduled execution is optional and documented in AUTONOMOUS_WORKFLOW.md.

## Next milestone

M2 Electrical reasoning, as already defined in ROADMAP.md. Independent planning only is authorized now: see M2_PREPARATION.md. Do not implement the solver, repairs or UI measurement claims while PR #2 remains unapproved. After approval, fetch latest main, confirm merge, create codex/m2-electrical-reasoning and implement the approved deterministic subset in focused steps.

## Resume prompt

Read AGENTS.md, docs/EXECUTION_PLAN.md, docs/DEVELOPMENT_STATUS.md and docs/VALIDATION-M1.md. Inspect origin/main, PR #2 and its latest CI. Continue the first executable remaining item, preserve unrelated changes, do not merge automatically and do not implement dependent M2 work until its baseline and scope are approved.
