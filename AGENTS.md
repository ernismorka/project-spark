# Repository instructions

Keep domain commands and state serializable. game-core and future electronics code must not import browser APIs, React or PlayCanvas. Presentation consumes state; rules belong to game-core. Validate untrusted commands at the domain boundary. Current scope is M1 First Contact. Do not implement M2 electrical simulation or repair. Keep the existing M0 APIs and tests working.

Use pnpm. Run pnpm lint, pnpm typecheck, pnpm test, pnpm build and pnpm test:e2e after meaningful changes. Add domain tests for behavioral changes, browser tests for lifecycle/UI changes. Report actual outcomes and blockers; never fabricate results.

Use focused commits on codex/<scope> branches and PRs against main. Do not merge without explicit request. Keep docs synchronized. No unrequested architectural rewrites, speculative networking, accounts, telemetry, secrets or player-supplied code execution.
