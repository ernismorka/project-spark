# Project Spark

Browser-first educational 3D engineering adventure. M1 First Contact is a single-player procedural circuit-board exploration slice. No accounts, telemetry, backend or external assets. PR #1 (M0) was merged before M1 began.

## Run

Use Node.js 24 and pnpm 11.25.0 on Windows, macOS or Linux. Existing dependency versions remain pinned without upgrades.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:5173 and choose Begin exploration. WebGL 2 and hardware acceleration are required. Errors offer retry without falsely reporting rendering success. English and Lithuanian selection is session-only.

## Controls

| Input                     | Action                                |
| ------------------------- | ------------------------------------- |
| WASD                      | Move relative to camera               |
| Shift                     | Run                                   |
| Space                     | Jump                                  |
| Click canvas / mouse drag | Capture pointer / orbit camera        |
| Mouse wheel               | Zoom                                  |
| E                         | Inspect selected nearby component     |
| F                         | Identify supported selected component |
| Esc                       | Pause/release mouse; close inspection |

Buttons support keyboard focus. Pause offers Resume and End session. Inspection freezes motion and returns with Continue exploring. The closest eligible component is selected automatically; nearby buttons choose another. Falling respawns at the starting pad while keeping progress. Controls and movement constants live in apps/web/src/game/input.ts and packages/game-core/src/world.ts.

## Validate

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium firefox
pnpm test:e2e
```

Linux CI installs browsers with `--with-deps` and runs headed tests under Xvfb/software GL. Browser tests use production preview port 4173. After editing source, rebuild before e2e. `pnpm format` applies formatting. Known local Windows Firefox `spawn UNKNOWN` may prevent launch; Chromium can be run with `pnpm test:e2e --project=chromium`. Firefox remains enabled in CI.

## Manual QA

1. Start; verify the engineer is visible. Walk/run/stop and jump. Walk into R1 and U1 to check solid collision. Jump onto the east stepped platform. Walk off a board edge and verify checkpoint recovery.
2. Click the board, orbit/zoom and approach large components; verify the camera pulls in before geometry. Press Esc to release the pointer; pause must freeze movement. Resume and confirm no stuck keys. Also test denied pointer lock with drag orbit.
3. Follow the beacon: leave pad, inspect striped R1 (E), scan blue C1 (F), approach U1, then use T1. Read LED and MCU explanations optionally. Try terminal early and repeated interactions; neither should skip objectives. Complete and replay.
4. Switch to Lithuanian at title, pause and inspection; verify copy/layout and return to play. Check 1280x720 and narrow menus. Desktop keyboard/mouse gameplay is required.
5. Lose WebGL context using browser tools; verify explicit error, retry and preserved progress. End session/remount several times; verify one canvas, no stuck input or stale callbacks.

See docs/GDD.md, docs/ARCHITECTURE.md, docs/ROADMAP.md and docs/VALIDATION-M1.md for scope and actual validation. Performance targets are not certified on representative midrange hardware. Session progress is not saved across reloads.
