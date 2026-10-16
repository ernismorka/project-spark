# M1 validation — 2026-10-16

## Executed checks

Lint, typecheck and production build pass. Vitest: 17 tests passed across original M0 domain, M1 domain and camera tests. Frozen dependency installation passed; no dependency version changed.

Local full browser command (`pnpm test:e2e --workers=1`): 8 Chromium checks passed; 8 Firefox tests could not launch due to the pre-existing Windows spawn UNKNOWN environment limitation. A subsequently added keyboard language-focus check passed separately in Chromium. Firefox remains enabled in CI.

Last confirmed Linux CI at f0f5c47: all quality checks and 16/16 Chromium/Firefox browser checks passed (https://github.com/ernismorka/project-spark/actions/runs/38916007502). Final common-verifier/18-check CI result will be recorded after execution. No fallback-only test is counted as successful rendering; both projects include a strict ready check and real-input mission traversal.

Browser coverage: start; actual keyboard movement and full mission; inspection and scan; walk/run/jump and wall blocking; camera wheel/orbit and Escape/pointer release; paused state preservation; EN/LT; context loss/retry and session teardown/remount. Input listeners are observed in test instrumentation; Playwright's own hit-target interception callbacks are excluded from application leak counts. The game contains no test teleport or mission bypass.

## Visual/manual checks

Inspected actual Chromium captures and manually exercised movement from spawn to R1, E inspection/mission advancement, Lithuanian inspection copy and pause via the in-app browser. Saved gameplay screenshots: screenshots/m1-engineer.png and screenshots/m1-terminal.png. Browser checks also capture 1280x720 pause and 390px Lithuanian menu layouts with no horizontal page overflow. These do not certify mobile gameplay.

## Performance observations

Observational 1920x1080 local Chromium sample: ready including start ~1380 ms, median requestAnimationFrame interval ~133.4 ms, p95 ~800 ms. Linux CI sample at f0f5c47: Chromium software rendering ~233.3 ms median/~433.3 ms p95; Firefox ~17.08 ms/~17.4 ms. Samples vary substantially with graphics backend and host load, and measure frame callback intervals, not a certified game FPS benchmark. The 60 FPS target is NOT established on representative midrange hardware. No claim of stable memory usage from a heap profiler is made; lifecycle tests cover listeners/canvas/state behavior.

The lazy engine chunk remains approximately 1.07 MB (280 KB gzip) and triggers Vite's size advisory; UI is approximately 239 KB (76 KB gzip). No textures, heavy models, postprocessing or physics library are introduced.

## Self-review

Correctness: ordered objectives/duplicate prevention, invalid target/capability/distance checks, deterministic replay, jump/landing/collision and fall recovery are tested. Architecture: rules stay in game-core and serializable contracts in shared; app modules own input/rendering. Security: no secrets/accounts/services/backend/networking/player-code execution or weakened global policy. Regressions: original M0 tests retained. Resources: cleanup is idempotent, materials release before graphics device, browser listeners/update/observer are removed, pointer lock is released, aborted bootstrap releases its device. No critical unresolved finding was identified in self-review; a human review remains pending.

Known limitations: static box/cylinder collision approximation, session-only state, local Windows Firefox launcher failure, unmeasured target-hardware performance and target-audience pacing. Intended exploration/reading pace is 3–5 minutes; a direct mission route is faster. No M2 implementation.
