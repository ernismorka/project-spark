# Development status

## 2026-11-17 recovery

M8 Playable Demo Release is merged in [PR #10](https://github.com/ernismorka/project-spark/pull/10) as `6d23e20`. The fetched origin/main matched the local checkout. Final-head and merged-main CI passed Linux validation (Chromium and Firefox) and the Windows launcher job. [VALIDATION-M8.md](VALIDATION-M8.md) retains the original milestone evidence.

The Windows checkout has Node 24.15.0, pinned pnpm 11.25.0 and Git 2.54.0.windows.1. The restricted environment could not reach the package registry or write Git fetch metadata. Scoped host commands fetched origin, read CI results and made the pinned pnpm available. Git's Windows checkout uses CRLF, which caused Prettier to flag 98 otherwise clean files. The repository's Prettier configuration now accepts consistent LF or CRLF without rewriting existing checkout files.

M8 package `dist/project-spark-0.8.0-demo.1` rebuilt successfully. The launcher smoke test served it from a copied folder with spaces and cleaned up its process. A local Brave 157.0.8103.79 session rendered the title and entered playable First Contact. The 1280×720 captures showed a visible Start button, a partially below-fold briefing, and the playable board with the engineer, gold beacon, copper traces and controls. This was a visual smoke check. The cooperative server remains separate.

The pinned Playwright Chromium and Firefox downloads completed and `pnpm doctor:project` passed. Targeted headed Chromium passed both the EN/LT title/controls smoke and the real-input episode through activation and replay. Visual review covered the commissioning workbench, the narrow Lithuanian completion panel and the activated board.

Full Windows `pnpm verify` exited 0. Lint, type checking, 90 unit/domain/server tests, production packaging, three release cases and all 30 packaged browser checks passed (15 Chromium and 15 Firefox). Both browsers covered the episode, bounded blocks/text controller and two-client cooperative flow. The historical Firefox `spawn UNKNOWN` did not reproduce on this host. Headless Chromium used SwiftShader and the rendering checks were slower than headed Chromium. The renderer observations apply to this host and test configuration.

The M8 Windows formatting fix and recovery documentation were committed as `4994289` on `codex/m8-windows-recovery`. The ordinary sandbox denied creating `.git/index.lock` during the commit. Scoped approval allowed that commit and creation of the separate M9 branch.

## M9 player experience

The owner approved the [M9 plan](M9_PROPOSAL.md) on 2026-11-17. Implementation adds localized beacon component names, refines static board traces and pad landmarks, exposes a successful controller run's threshold comparison, and guides players back to the terminal report with focus on the still-guarded Activate device action. Human usability, learning, accessibility and representative hardware measurements remain open in [PLAYTEST.md](PLAYTEST.md).

Windows doctor and headed `pnpm verify` passed. Verification covered lint, type checking, 90 unit/domain/server tests, reproducible packaging, three release checks and all 30 browser checks (15 Chromium and 15 Firefox). The packaged launcher also passed startup from a path containing spaces and owned-process cleanup. The full episode exercised both languages, activation focus, 200% CSS zoom and replay. Independent workbench and cooperative browser scenarios passed. The initial headed run found a native wheel delta difference in both browsers. The corrected browser check verifies both zoom directions and the camera unit test verifies exact delta conversion.

Reviewed Playwright before/after captures of the opening board and commissioning at desktop width, the narrow Lithuanian workbench and completion at 390 px, and the activated board at 1280×720 and 1920×1080. The narrow view still displays separate page and panel scrollbars. The central route, localized OUT comparison and activation control were readable in the reviewed captures.

The comparable opening-scene draw count rose from 72 on M8 to 74 on M9 with the added static detail. The 90-frame Windows 1080p observations were 4.20/4.30 ms median/p95 in headed Chromium on Radeon 780M and 4.16/4.18 ms in headed Firefox on its reported AMD Direct3D11 adapter. The M8 recovery used headless rendering, so frame times from those runs are not a controlled comparison. Scene gzip changed from 283.61 kB to 283.72 kB. Browser workload observations do not certify sustained performance on representative hardware.

Implementation commit `f186451` is submitted for review in [PR #11](https://github.com/ernismorka/project-spark/pull/11). Use the PR checks for exact final-head CI results.

## M10 Physical Diagnostics & Repair

GitHub and Git ancestry confirm [M9 PR #11](https://github.com/ernismorka/project-spark/pull/11) is merged as `248990b`. The new M10 branch carries the local [field diagnostics plan](M10_PLAN.md). Implementation commit `d0604e3` adds three site probes, an evidence notebook, one guarded trace repair, fresh verification and the T1 commissioning handoff. The legacy terminal route remains available at the start of each run. [PR #13](https://github.com/ernismorka/project-spark/pull/13) tracks review and exact final-head checks.

Windows doctor, lint, type checking, 92 unit and integration tests, packaging, three release tests and all 16 headed Chromium checks passed. The combined headed verifier was stopped after Firefox timed out in the existing pilot dialog. The separate headless Firefox run passed all 16 checks, including the new real-input field route and the pilot dialog. Both projects verified localized readings, blocked remote probing, rejected a wrong diagnosis, restored WebGL with evidence intact, repaired and rechecked the trace, and completed commissioning and replay.

Reviewed the desktop meter, revealed trace, verified 1080p board and the 390 px Lithuanian notebook. The notebook's columns fit at that width. The opening scene remained 74 draw calls per frame in both browsers, matching M9. The short 1080p field observation was 4.20/4.30 ms median/p95 in headed Chromium and 4.18/12.50 ms in headless Firefox. These samples describe this host and browser configuration. The compressed app chunk rose from 145.01 kB to 148.15 kB and the scene chunk from 283.72 kB to 284.20 kB. Human playtesting and sustained representative hardware evaluation remain open.

The initial final-head Linux run passed 31/32 browser checks, including both M10 playthroughs. The existing paused-render test observed a queued transition frame after its wall-clock delay on software WebGL. The revised check allows three animation frames for the transition, then requires five consecutive samples with the same draw count. It retains the resume and GPU buffer cleanup assertions.

The exact merged M10 head passed both Linux browser projects and the Windows launcher in [CI](https://github.com/ernismorka/project-spark/actions/runs/44174636561). Main contains M10 at `8b6ae37`. An additional Windows SwiftShader probe reached verification, but the original automated stop point was outside T1's interaction range. M11 adds a closer test waypoint and absorbs the timeout adjustment from [PR #14](https://github.com/ernismorka/project-spark/pull/14).

## M11 difficulty guidance

Implementation is on `codex/m11-difficulty-guidance` from merged M10. Three EN/LT guidance tiers persist per browser origin and can switch during play. Apprentice highlights unmeasured probe pads and gives longer instructions. Technician retains the existing cues. Engineer hides directional guidance, coordinates and diagnostic hints while retaining measured evidence and valid actions. No game-core or solver code changed.

Windows doctor and the full headed verifier passed before the final Engineer HUD tightening. The run covered 92 unit and integration tests, three release tests and all 34 Chromium and Firefox checks. Both browsers switched tiers during physical diagnosis, preserved measured values and completed verification and commissioning. The opening Technician scene remained at 74 draw calls per frame. The focused final HUD recheck and exact final-head CI are tracked in [PR #15](https://github.com/ernismorka/project-spark/pull/15).

The first full Linux M11 run found the narrow Lithuanian legacy diagnostics exit below the viewport in both browsers. The narrow header now uses a compact difficulty summary with the selection available to assistive technology and in the open picker. The diagnostic viewport reserves room for narrow header layouts. The existing exit-in-viewport regression remains in place.

## M12 Graphics & Interaction Animations

[M11 PR #15](https://github.com/ernismorka/project-spark/pull/15) landed as `f9e0dd7`. M12 adds PCB finish and lighting changes, velocity-driven character motion, eased camera zoom, and probe, patch and verified status animations driven by accepted field state. No dependencies or gameplay rules changed. Preserved M11 captures cover the standing board and physical repair route for direct comparison. Packaged verification and final visual review are in progress.
