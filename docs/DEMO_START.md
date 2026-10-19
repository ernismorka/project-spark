# Project Spark demo 0.8.0-demo.1 / Demonstracija

## Windows: start / Paleidimas

1. Install **Node.js 24 or newer** from https://nodejs.org/ once. Use a current Chromium/Chrome/Edge or Firefox browser with WebGL 2 and hardware acceleration. Desktop keyboard and mouse required.
2. Copy/extract the **entire** versioned demo folder to a writable local folder. Double-click **Start Spark Demo.cmd**. No Git, pnpm, project dependency installation or multiplayer server is needed.
3. Keep the console open. The default browser opens http://127.0.0.1:4173 after startup. Choose English or Lietuvių, then **Begin exploration / Pradėti tyrinėjimą**. Ctrl+C in the console stops serving; close the browser tab afterward. Reopening starts a fresh episode.

Įdiek Node.js 24 ar naujesnį iš https://nodejs.org/. Išskleisk visą demonstracijos aplanką. Dukart spustelk **Start Spark Demo.cmd**, palik konsolės langą atvertą ir naršyklėje pasirink **Lietuvių**. Ctrl+C konsolėje sustabdo serverį. Reikia darbalaukio klaviatūros, pelės ir naršyklės su WebGL 2 bei aparatiniu spartinimu. Git, pnpm ir bendradarbiavimo serverio nereikia.

The demo runs only on this computer. Internet is unnecessary after Node/browser installation and receiving the folder. Do not open web/index.html directly: browser modules require the local server. Do not expose this server to a public network. Reload/end/replay clears progress; no save or telemetry.

## Controls / Valdymas

WASD moves relative to the camera; Shift runs; Space jumps. Click the board to focus, drag to orbit if pointer lock is unavailable, wheel to zoom. E inspects, F identifies a supported nearby component. Follow the gold beacon and compass. Esc pauses/releases capture. Menus support Tab/Shift+Tab/Enter. Valdymas taip pat paaiškintas žaidimo languose.

Follow the episode: explore → measure VCC/SENSE → diagnose R1 → restore → remeasure both → verify → terminal construction → programming → activate. The terminal explains each next action. Title workbench is separate practice and grants no episode progress. See KNOWN-LIMITATIONS.md and PLAYTEST.md.

## Troubleshooting / Trikčių šalinimas

- Missing Node: install it, then reopen the launcher. Missing files: extract/copy the entire folder again.
- Port busy: stop the previous demo console with Ctrl+C. Alternatively run `node server.mjs --port=4174 --open` from the demo folder. The server never silently connects to an unrelated process.
- Browser did not open: paste the printed URL into your browser. Close extra tabs if graphics initialization fails; use **Try again / Bandyti dar kartą**, enable hardware acceleration, or try another supported browser.
- A Windows trust prompt may appear for a downloaded, unsigned command file; inspect the plain-text launcher according to your organization's policy. No administrator access or security changes are required.
- macOS/Linux: run `node server.mjs`, then open the printed URL manually. These platforms use the same static server; the double-click launcher is Windows-specific.

## Developer packaging and smoke checks

From a checkout with Node 24 and pinned pnpm: `pnpm install --frozen-lockfile`, then `pnpm demo:package`. This builds production assets and creates `dist/project-spark-0.8.0-demo.1` with startup/limitations/playtest documents, dependency notices and manifest.json SHA-256 inventory. Copy or zip that entire folder; there is no public release upload. Repeat packaging from the same source/runtime/lockfile to reproduce file contents and hashes (not archive timestamps). The manifest records commit and dirty status; distribute a clean reviewed build only.

Run `pnpm test:release` after packaging for inventory, deterministic repack, HTTP security, actual packaged CLI startup/stop and error checks. `pnpm verify` includes release checks and runs all browser flows against the packaged production server, plus the separate pilot server for its regression test. Browser captures are in test-results. Windows Firefox may fail before launch with spawn UNKNOWN; Linux CI retains both browsers.

The optional cooperative pilot remains a separate developer-only local workflow in README.md; the demo launcher never starts it. Its title entry explains that a separate server is required.
