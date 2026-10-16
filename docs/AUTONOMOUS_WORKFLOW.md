# Autonomous development workflow

## Environment audit — 2026-10-16

Windows workspace: C:/Projects/electricity game. Node 24.19.0, pnpm 11.25.0, Git 2.56.0.windows.1. Existing dependencies remain pinned. Codex CLI reports 0.162.0-alpha.17.2; restricted temp-directory warnings are environmental, not a reason to alter machine-wide permissions. GitHub connector reads and Git push to origin succeeded; no credentials were printed. gh CLI is unavailable. Git author defaults are unset; implementation commits explicitly identify Codex per command, without changing global Git configuration.

Observed session restrictions: workspace-write with restricted network and protected .git/.codex paths; scoped host commands require the supported approval mechanism. Accessible global config has approvals_reviewer=auto_review and Windows sandbox helper=elevated. That helper setting does not imply unrestricted filesystem access. No global setting, trust entry, approval policy or sandbox restriction was changed. Official configuration reference: https://learn.chatgpt.com/docs/config-file/config-reference and https://learn.chatgpt.com/docs/agent-approvals-security.

The ordinary sandbox cannot open localhost sockets or resolve the host browser cache consistently. Scoped approved execution was used for pnpm installation/linking, browser tests and Git mutations. Binary availability checks inside the isolated sandbox can report missing host binaries; run doctor in the same approved context as tests. Chromium launches and renders. Windows Firefox has the existing spawn UNKNOWN limitation despite its binary being installed. Linux CI tests both browsers successfully.

## Repeatable local tools

`pnpm doctor:project` checks required Node/pnpm versions, Git and browser binary presence. It does not claim launch/render success and does not install anything. The name avoids pnpm's built-in doctor command.

`pnpm verify` runs lint -> typecheck -> unit tests -> build -> browser tests, aborting at the first failure and preserving the failed exit code. It uses Node and the active pnpm entry point, with no POSIX-only shell commands or new dependencies. Individual scripts remain available. `SPARK_HEADED=1` adds --headed for browser tests; CI runs the same verifier inside Xvfb with software graphics. Browser binaries are installed explicitly before verification. No test is skipped to conceal unavailable WebGL or Windows Firefox failure.

GitHub Actions has read-only contents permission, per-ref cancellation of superseded runs, a 20-minute job limit, manual workflow_dispatch, locked installation and seven-day browser artifacts. It runs project doctor and the common verifier. Real-render assertions remain strict. Chromium CI uses its documented explicit software driver (https://chromium.googlesource.com/chromium/src/+/main/docs/gpu/swiftshader.md); Firefox retains Xvfb/software GL. CI is a validation runner, not an autonomous coding agent.

## Execution and review loop

Read AGENTS.md plus execution/status files; confirm approved baseline and current PR/CI; select an unfinished authorized task; implement a focused change; run relevant checks; self-review correctness, boundaries, security, performance and regressions; update durable evidence; commit and update the milestone PR. Do not merge without explicit authorization or start dependent implementation from an unapproved baseline. Never reset unrelated work or change repository protections.

M0 review: PR #1 is merged (2026-10-16 13:58:27 UTC), contradicting the stale open/unmerged wording in the later setup brief. The referenced run 38911704767 passed all M0 checks. GitHub reviews and inline review-comments collections are empty; this is not a claim that a human review occurred. Self-review found no critical unresolved M0 architecture/scope issue; retained M0 tests pass in M1.

## Optional scheduled execution

No scheduled task, background daemon or automatic session restart was created. The documented desktop Scheduled feature can run local-project tasks while the computer is powered on and the app is running. Open Scheduled and create a project task, or ask in this chat for a recurring follow-up with an explicit cadence. Prefer a chat follow-up for this review loop; describe the stop condition and meaningful-change notifications. Keep existing sandbox restrictions and review initial runs. Source: https://learn.chatgpt.com/docs/automations?surface=app.

Suggested durable prompt: Read Project Spark AGENTS.md, docs/EXECUTION_PLAN.md and docs/DEVELOPMENT_STATUS.md; inspect PR #2 and CI; fix authorized M1 defects, run relevant checks and update evidence. Do not merge or start M2 implementation without an approved baseline. Stay quiet when nothing actionable changes; notify on failure, completion, meaningful change or required user action.

A future session resumes from these committed files; it does not depend on this chat remaining active.
