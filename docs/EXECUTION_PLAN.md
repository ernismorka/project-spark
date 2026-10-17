# Execution plan

## Current milestone and approved baseline

M3 The Dark Circuit, branch codex/m3-the-dark-circuit, from merged M2 main 4dc7084. PR #3 merged and main CI run 38999625572 succeeded before implementation. User explicitly authorized M3 and PR delivery; this session merged nothing.

## Completed

- Defined one R1 connection fault and bounded repair/verify behavior in M3_PREPARATION.md.
- Authoritative serializable fault, evidence, repair and completion in game-core; invalid/early/out-of-range/duplicate commands rejected.
- Recomputed before/after readings through the unchanged M2 solver.
- Evidence-gated diagnosis, fresh verification, localized divider explanations and clear episode completion.
- Amber/green abstract terminal beacon, green verified strip, restored-board view and deterministic full replay.
- English/Lithuanian controls, decimal formatting, keyboard focus and narrow-menu checks.
- Updated architecture, GDD, roadmap, README and evidence documentation.
- Lint/types/build and 63 unit tests pass. Corrected local full run passes 9 Chromium tests; Windows Firefox launch remains blocked. Linux CI at 2ef7442 passes all 18 browser tests and pnpm verify.
- Final code Chromium capture route passed; four actual sequence screenshots reviewed and saved.
- Reviewable PR #4: https://github.com/ernismorka/project-spark/pull/4.

## Remaining gate and handoff

Await human review and explicit merge authorization; PR checks must be green before any authorized merge. Do not merge automatically or begin M4. See VALIDATION-M3.md for exact results and screenshots.

## Acceptance and limits

Real-input route covers exploration, both evidence readings, incorrect/correct diagnosis, repair, before/after, verification, EN/LT, close/reopen, visible board response and replay reset. No dependencies or services added. No durable save; progress is session-only. Target-age usability and representative hardware performance remain human evaluation tasks. No scheduler or deployment was configured.

Resume by reading AGENTS.md and DEVELOPMENT_STATUS.md, checking main/branch/PR/CI and continuing only unfinished M3 fixes/review.
