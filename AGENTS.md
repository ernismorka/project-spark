# Project Spark repository instructions

## Architecture and scope

Read README.md, docs/GDD.md, docs/ARCHITECTURE.md, docs/ROADMAP.md, docs/EXECUTION_PLAN.md and docs/DEVELOPMENT_STATUS.md before continuing. GDD and roadmap are the product source of truth. Do not expand them without authorization.

M0–M5 are complete; M5 PR #6 merged as f800be4. Current authorized work is post-M5 MVP consolidation: audit, scope-preserving quality fixes, automated validation and consolidated human playtest preparation. No new feature milestone is authorized. Preserve M0–M4 single-player APIs and the deterministic solver. Use a local-only Colyseus authority with private two-player rooms, validated inputs, bounded rates and reconnect handling. No database, public matchmaking, accounts/chat/payments or public deployment. Do not start M6. Domain code remains serializable and browser-independent.

## Autonomous workflow

Independently inspect, plan, implement, test, self-review and document assigned work. Make routine coding decisions within authorized scope without requesting approval. Fix errors caused by your changes without asking whether to proceed. Prefer simple maintainable solutions, existing dependencies, architecture and naming conventions. Keep changes within the authorized quality scope. Automated testing is part of implementation.

Maintain docs/EXECUTION_PLAN.md with current milestone, completed/remaining tasks, acceptance criteria, dependencies, blockers, evidence, PR links and next milestone. Update docs/DEVELOPMENT_STATUS.md at meaningful changes and handoff so another session can resume without chat history. Record actual outcomes and unresolved limitations; never fabricate results.

## Git workflow

Inspect the working tree and remote state first; preserve unrelated work. Use dedicated codex/<milestone> branches from the approved baseline and focused commits. Create a reviewable PR after completing a milestone. Wait for explicit authorization before merging main. Never force-push, destructively reset unrelated work, or modify branch protections/repository security settings. Do not start dependent implementation from an unapproved milestone baseline. Document dependencies for any safe follow-up preparation.

## Quality gate

Run pnpm doctor:project for environment/binary availability; it does not prove browser launch. Run pnpm verify for sequential fail-fast lint, typecheck, unit tests, build and browser checks. Equivalent individual commands are pnpm lint, pnpm typecheck, pnpm test, pnpm build and pnpm test:e2e. Rebuild before testing the production preview. Linux CI validates Chromium/Firefox with Xvfb and explicit software graphics. Keep both browsers enabled. Report the known Windows Firefox spawn UNKNOWN limitation separately from gameplay regressions; never describe the full local suite as passing if it cannot launch.

Test domain behavior and meaningful UI/lifecycle changes. Self-review correctness, architecture, security, performance and regressions before submission. Use actual GitHub CI results as additional evidence. No fabricated FPS, screenshots or successful checks. Revalidate after fixes with checks appropriate to the change.

## Boundaries and approvals

No unplanned networking, database/accounts, paid services, unnecessary dependencies, large rewrites, production deployments or out-of-scope mechanics unless a later approved milestone explicitly requires them. No secrets, telemetry or player-supplied code execution.

Preserve sandbox and security restrictions. Never modify machine-wide Codex approval policies or request unrestricted host access. Use supported scoped permission requests only when required; document a denial and continue independent work. Request human input for destructive actions, production deployment, merging protected branches, significant scope changes, paid services or architectural conflicts with the approved roadmap. Do not imply that this file grants additional tool permissions.

## Session continuity

On resume, read the two tracking files, fetch/inspect main and the milestone PR/CI, confirm the approved baseline, and continue the first executable unfinished task. M5 is merged. After submitting the consolidation PR, limit work to its fixes/review until owner approval. Human gameplay and representative hardware tests are deferred for a consolidated playtest, not routine implementation blockers. Do not claim scheduled/background execution unless an actual documented automation has been configured. See docs/AUTONOMOUS_WORKFLOW.md.
