# M8 release validation

## Baseline and scope

2026-10-19, Windows workspace. M7 PR #9 is merged at 791220e. M8_SCOPE.md was written before implementation on codex/m8-playable-demo. No solver/interpreter/domain/pilot changes, dependencies, new gameplay, public release/deployment or M9. Reviewed the required product/architecture/status/playtest documents.

Merged-main CI [39295631291](https://github.com/ernismorka/project-spark/actions/runs/39295631291) failed: one Firefox episode case received renderer error at initial startup, before movement; the other 27 browser checks passed. M7 final PR CI had passed. This is recorded rather than treating the merged baseline as green. M8 retains explicit WebGL error/retry and both browser projects; failure traces are now retained to help investigate any recurrence.

## Release behavior and review

Version 0.8.0-demo.1 is a reproducible production folder, not a public release. Players use Node 24+ and a current WebGL 2 browser; they do not install pnpm/Git/project dependencies. Package inventory excludes itself, records SHA-256/bytes, source commit, dirty flag and Node version. Reproducibility means repeated file contents on the same source/runtime/lockfile, not cross-platform build identity or archive timestamps. Copy/zip the entire folder. CI stores a seven-day review artifact only after successful verification.

The actual Windows command launcher was executed from the workspace path containing spaces, with browser opening suppressed through SPARK_DEMO_NO_OPEN=1 for automation. It served production HTML successfully and its exact owned Node/console processes were cleaned up; no listener remained. Startup working set was 51,425,280 bytes for that standalone server process. Native default-browser opening is implemented but not interactively verified; the printed URL is the fallback. Windows CI independently repeats the launcher and package tests.

Three release integration cases exercise complete inventory/repack equivalence, actual packaged HTTP/CLI startup, missing assets, occupied/invalid ports, unknown options, MIME/HEAD, traversal/malformed URLs, Host/Origin and method rejection, stop/connection refusal. Initial shutdown assertion hit a pooled socket reset; fresh-connection checking fixed the test. Review also fixed CLI test cleanup after an early exit, rejected linked distribution directories before recursive replacement, and normalizes launcher CRLF on Linux packaging. No blanket retries or disabled tests.

Presentation review found duplicated title copy pushed Start below the 720p fold. Start is now visible above the scene; EN/LT title explains reset/no-save semantics. Title information no longer falsely claims modal semantics while header/start remain interactive. Controls text is slightly larger. Pilot explains its separately required local server. Completed episode footer names the final stage and Replay has clearer emphasis than diagnostic review. Existing educational explanations and command authority are unchanged.

## Executed checks

- doctor:project: Node 24.19.0, pnpm 11.25.0, Git and both browser binaries found. Binary presence does not prove launch.
- First pnpm verify: lint, typecheck, 90 unit/domain/server tests, production packaging and 3 release integration tests passed. All 15 Chromium checks passed, including new EN/LT 1280×720/1366×768 title/controls/no-external-request flow, full real-input episode through activation/replay, programming, two-client repair/reconnect, context loss and lifecycle cleanup. All 15 Windows Firefox launches failed with the existing spawn UNKNOWN limitation; full local verification is not green.
- Existing 390×844 responsive menus, 1280×720 gameplay and 1920×1080 frame observation remain covered. Tests never inject progression or teleport the player.
- A final rerun was stopped after full trace screenshots/DOM snapshots delayed held-key commands enough to cause oscillation approaching R1. The real movement assertions remain unchanged; failure tracing now records actions/errors without those expensive captures. A fresh full verifier and GitHub final-head CI are pending delivery; update actual outcomes below.

## Practical observations, not sustained performance certification

Packaged production server, headless Chromium, 1920×1080, ANGLE AMD Radeon 0x1638 D3D11: first 90 stationary-frame sample startup 1086 ms, median/p95 16.7/16.7 ms. Repeated sample startup 479 ms, median/p95 16.7/16.8 ms. These are two short spawn observations on available hardware, not a five-minute gameplay benchmark or minimum-spec guarantee.

Twenty start/end cycles with forced collection after each end: JS heap 7,013,660 → 8,547,120 bytes; final five samples 8,501,396 / 8,501,908 / 8,524,628 / 8,539,092 / 8,547,120. Retained heap grows during warm-up and still slightly at the end; this does not prove a leak or a stable long-session bound. All cycles removed the canvas and could start again. Existing browser instrumentation separately verifies zero owned WebGL buffers/input listeners after end and zero paused draws. Long-session heap/profiler analysis remains a playtest requirement.

Ordinary local Chromium suite uses SwiftShader: observed 90-frame median/p95 200/233.3 ms, startup including Start 995 ms, 72 submitted draws/frame at spawn. Software rendering numbers are not hardware gaming performance. Node heap/RSS of the profiling harness is not the standalone server measurement above. Vite's existing ~1.085 MB scene chunk advisory remains; no dependency or renderer rewrite is justified by these samples.

## Visual evidence and deferred human checks

docs/screenshots/m8-title-en.png, m8-title-lt.png, m8-controls-lt.png, m8-controller-en.png, m8-complete-lt.png and m8-active-world.png are real browser captures. Title, controls, commissioning, completion and world images are inspected for clipped text, focus and clear state. Final presentation captures will be refreshed after the final gate.

DEMO_START.md is the packaged startup and automated smoke procedure; DEMO_LIMITATIONS.md records runtime/browser/pilot/save/model limits. PLAYTEST.md consolidates target-age fun, controls/camera, learning clarity, difficulty, native copy, accessibility, two-human cooperation and representative sustained hardware/heap measurements. The owner need not perform these during implementation. They remain unverified, separate from automated technical acceptance.
