# M8: Playable Demo Release

Authorized on merged M7 PR #9, main 791220e. Branch: codex/m8-playable-demo. No M9 or public release/deployment is authorized.

Preserve the existing complete episode, solver, interpreter, local cooperative pilot and all regression tests. Improve demo presentation only where it removes concrete confusion. No new gameplay systems, dependencies or desktop framework.

## Acceptance criteria

- Versioned production package can be reproduced with one developer command. It contains static assets, a dependency-free loopback server, Windows launcher, EN/LT startup guide, limitations and a SHA-256 inventory. Player startup requires only Node.js 24 and a desktop WebGL 2 browser, not Git, pnpm or installed project dependencies.
- Double-click launcher works from a directory containing spaces, checks runtime, opens the default browser only after listening, and keeps a visible stop console. Missing assets, occupied ports and invalid arguments fail clearly. Static serving is read-only, loopback-only and confined to packaged assets; no cooperative server starts.
- Both browser projects run the production demo server rather than a development server. Existing real-input episode checks cover exploration through activation/replay, solver results, blocks/text, EN/LT and responsive menus. Additional demo checks cover title/controls, offline local requests and desktop layouts. Independent release tests cover packaging integrity/reproducibility and server boundaries/start/stop.
- Run doctor, pnpm verify and release checks; preserve Chromium/Firefox CI. Investigate merged-main CI failure 39295631291 (Firefox initial renderer error), record actual outcomes and retain explicit error/retry behavior.
- Inspect title, controls, commissioning, completion and world screenshots. Record practical startup/frame/lifecycle observations without certifying sustained hardware performance. Consolidated human usability, accessibility and representative hardware measurements remain deferred.
- Update product/architecture/status, startup/smoke/limitations/playtest docs. Self-review, commit, push and open an unmerged PR against main; check final-head CI. No automatic public release.
