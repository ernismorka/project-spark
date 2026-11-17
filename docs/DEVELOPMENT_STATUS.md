# Development status

## 2026-11-17 recovery

M8 Playable Demo Release is merged in [PR #10](https://github.com/ernismorka/project-spark/pull/10) as `6d23e20`. The fetched origin/main matched the local checkout. Final-head and merged-main CI passed Linux validation (Chromium and Firefox) and the Windows launcher job. [VALIDATION-M8.md](VALIDATION-M8.md) retains the original milestone evidence.

The Windows checkout has Node 24.15.0, pinned pnpm 11.25.0 and Git 2.54.0.windows.1. The restricted environment could not reach the package registry or write Git fetch metadata. Scoped host commands fetched origin, read CI results and made the pinned pnpm available. Git's Windows checkout uses CRLF, which caused Prettier to flag 98 otherwise clean files. The repository's Prettier configuration now accepts consistent LF or CRLF without rewriting existing checkout files.

M8 package `dist/project-spark-0.8.0-demo.1` rebuilt successfully. The launcher smoke test served it from a copied folder with spaces and cleaned up its process. A local Brave 157.0.8103.79 session rendered the title and entered playable First Contact. The 1280×720 captures showed a visible Start button, a partially below-fold briefing, and the playable board with the engineer, gold beacon, copper traces and controls. This was a visual smoke check. The cooperative server remains separate.

The pinned Playwright Chromium and Firefox downloads completed and `pnpm doctor:project` passed. Targeted headed Chromium passed both the EN/LT title/controls smoke and the real-input episode through activation and replay. Visual review covered the commissioning workbench, the narrow Lithuanian completion panel and the activated board.

Full Windows `pnpm verify` exited 0. Lint, type checking, 90 unit/domain/server tests, production packaging, three release cases and all 30 packaged browser checks passed (15 Chromium and 15 Firefox). Both browsers covered the episode, bounded blocks/text controller and two-client cooperative flow. The historical Firefox `spawn UNKNOWN` did not reproduce on this host. Headless Chromium used SwiftShader and the rendering checks were slower than headed Chromium. The renderer observations apply to this host and test configuration.

[M9 player experience proposal](M9_PROPOSAL.md) is awaiting owner approval. Gameplay development has not started. Keep the solver, embedded controller and cooperative pilot contracts. Human usability, learning, accessibility and representative hardware measurements remain open in [PLAYTEST.md](PLAYTEST.md).

The Windows formatting fix and recovery documentation are ready for a local commit. Creating `codex/m8-windows-recovery` failed because the workspace sandbox protects `.git/refs`. The changes remain in the working tree on `main` at `6d23e20`.
