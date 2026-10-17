# Execution plan

## Current milestone and approved baseline

M3 The Dark Circuit, branch codex/m3-the-dark-circuit, from merged M2 main 4dc7084. PR #3 is merged; main CI run 38999625572 succeeded. The user explicitly authorized M3, PR delivery and routine fixes. No merge was performed by this session.

## Implementation and acceptance

Implemented: one R1 reconnection in authoritative game-core, evidence/range/phase/target validation, solver-derived before/after readings, fresh verification and explicit episode completion. Amber/green abstract terminal beacon and verified route strip respond to core state. EN/LT copy explains the divider and model limits. Replay resets the whole episode deterministically. M0–M2 APIs, movement and solver remain intact; no dependencies or backend added.

Contract: M3_PREPARATION.md; unchanged electrical scope: M2_SIMULATION_SCOPE.md.

## Remaining work

Run all validation, resolve failures, review actual sequence screenshots, record evidence, self-review and open PR against main. Inspect final GitHub CI. Do not merge automatically or start M4.

## Dependencies and limitations

Known local Windows Firefox spawn UNKNOWN may block local verification; both browsers remain required in Linux CI. Scoped permissions are used for Git, caches and browser launches. Representative hardware performance and target-age usability remain unverified human tasks. No scheduler, production deployment or durable save is configured.

Resume by reading AGENTS.md and DEVELOPMENT_STATUS.md, inspecting branch/main/PR/CI, and continuing the first unfinished M3 task. After delivery, await review and further milestone authorization.
