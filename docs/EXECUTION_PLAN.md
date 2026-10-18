# Execution plan

Current work: post-M5 MVP consolidation on codex/post-m5-mvp-consolidation, from main f800be4 (merged M5 PR #6). GitHub confirms the merge; baseline main CI 39060046862 passed. M0–M5 retain their approved scope and numbering. No new feature milestone is authorized.

Acceptance: audit correctness, architecture, security, lifecycle, performance, EN/LT and accessibility; fix reproducible scope-preserving defects; run pnpm verify and server integrations; inspect real browser flow captures; record remaining human-only evaluation; submit an unmerged quality PR.

Completed implementation: modal focus returns to the actual opener; cooperative UI spaces actions beyond the unchanged server rate limit; scene context loss cancels an in-flight initialization. Regression checks cover focus, rapid cooperative progression without test-only action sleeps, and delayed-bootstrap cancellation. Reviewed domain/solver/interpreter and transport boundaries remain unchanged.

Product preparation: PLAYTEST.md consolidates tasks and human-only observations. NEXT_STAGE_PROPOSAL.md compares A/B/C and recommends A → C → B subject to playtest evidence and explicit owner approval. No new feature work or automatic merge.

Local validation and self-review are complete: lint/types/build, 78 unit/integration tests and all 12 Chromium browser checks pass. All 12 Windows Firefox cases fail at launch with the existing environment error. Actual results, reviewed captures and classified findings are in VALIDATION-CONSOLIDATION.md. Known environment limitation: local Windows Firefox spawn UNKNOWN; both browser projects remain mandatory in Linux CI. Next executable work: submit this branch as a PR against main and verify final-head Linux CI before handoff; then await owner review. Do not merge.
