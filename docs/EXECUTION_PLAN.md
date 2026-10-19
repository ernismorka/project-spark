# Execution plan

M8 Playable Demo Release is authorized on merged M7 PR #9, main 791220e. Branch codex/m8-playable-demo. Scope and measurable acceptance recorded before implementation in M8_SCOPE.md. No M9, public release/deployment or automatic merge.

Completed: required document/baseline inspection, branch/scope, doctor (Node24.19.0/pnpm11.25.0 and both browser binaries), initial launcher/package/release checks, concise localized title and separate-pilot guidance. M7 merged-main CI 39295631291 failed one Firefox initial renderer readiness case (error instead of ready); other 27 browser checks passed. Investigate recurrence during M8 gates rather than claiming a green baseline.

Remaining: complete release regression checks, full pnpm verify and both-browser CI, inspect complete real-input episode/title/controls/completion captures, performance/lifecycle observations, self-review/fixes, document actual evidence, commit/push/open PR and check final-head CI. Human learning/usability/assistive technology and representative sustained hardware profiling remain deferred in PLAYTEST.md, not routine blockers. Windows Firefox spawn UNKNOWN remains distinct from gameplay failures; keep both browsers enabled.
