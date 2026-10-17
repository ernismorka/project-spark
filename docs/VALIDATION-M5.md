# M5 validation evidence

Baseline: M4 PR #5 merged at main 19bdba7. Main CI run 39036262488 passed before implementation. Branch codex/m5-cooperative-pilot.

Environment: Node 24.19.0, pnpm 11.25.0, Git 2.56.0, Windows. doctor:project found Chromium and Firefox binaries. Added pinned Colyseus core/ws/SDK, tsx and Express types; the existing solver and original dependencies remain unchanged. Optional native build scripts are disabled at project level; no release-age exemption or global permission change is retained.

## Tests actually executed

78 unit/domain/Colyseus integration tests pass, including all 70 M0–M4 fixtures. The authority tests cover two seats/private joining, capacity rejection, solver-derived shared readings, complementary contribution/repair, spoofed IDs/client positions/voltages, ordered input, deterministic movement bounds and idle stopping, reconnect identity/state consistency, expiry/replacement, empty-room cleanup, HTTP foreign-origin/payload/rate rejection and bounded snapshots. Integration uses actual SDK clients on an ephemeral loopback port; a test-only trusted server factory shortens the grace to 1.5 seconds, while production remains 20 seconds.

The targeted Chromium run passed 2/2: cooperative movement, shared measurements, diagnosis/repair, live reconnect, verification, departure reset and EN/LT/narrow view; plus the existing M4 full editor flow. Full pnpm verify was run: lint/typecheck/build and all 11 Chromium checks passed. That run contained 76 unit/integration fixtures; the two subsequent resource-limit fixtures bring the separately rerun passing total to 78. All 11 Firefox checks fail at browser launch on this Windows host, so the full local verifier is not passing. Windows Firefox has the known spawn UNKNOWN launch limitation; no browser is disabled in CI.

## Code review and corrections

Initial browser tests exposed a shutdown close code that does not trigger automatic SDK recovery; the UI now uses CloseCode.MAY_TRY_RECONNECT. Added lobby controls caused a narrow document overflow in M4; responsive header wrapping fixes it. Independent HTTP testing found native Colyseus matchmaking routes execute before Express middleware; both the native router and fallback HTTP routes now enforce origin/size/rate guards. Final review also rejects chunked/unknown-length HTTP POST bodies so the declared-length size guard cannot be bypassed; a native HTTP regression test covers it. Action buttons now reflect authoritative terminal range, with feedback and safe service-area spawn positions. Generation guards prevent stale socket callbacks after leaving/rejoining, and disconnect clears velocity/input. Domain challenge state and solver remain authoritative.

## Performance observation

pnpm bench:pilot on this host: 10,000 fixed ticks for two stationary players took 53.3981 ms; serialized snapshot was 865 UTF-8 bytes. This is a small synchronous domain observation, not total server load, latency, target-hardware FPS or scale certification. Integration additionally asserts a completed two-player snapshot stays under 8192 characters. Existing browser frame sampling is observational and software-rendered. Network publication is 10 Hz, simulation 60 fixed ticks/second, with at most two players per room and 16 active rooms per local server.

## Visual review and limitations

Initial actual EN/LT captures confirmed consistent final readings and peer roles; marker size/map height were enlarged for readability. Final reviewed captures are docs/screenshots/m5-coop-en.png and m5-coop-lt.png. They show both roles/positions, shared completion and solver-computed 5.00/2.50 V with EN/LT decimal formatting. The narrow view has no horizontal overflow. Final CI is recorded with the PR.

The pilot is a separate top-down cooperative service-board view using existing world coordinates/collision; the existing 3D adventure and M4 editor are preserved. It is loopback-only for two clients on the same computer, without public deployment, durable state, prediction, chat/accounts, public matchmaking or arbitrary player code. Reconnect tokens stay in memory; page reload recovery is not exposed. The room code is a bearer invitation. Live drops reserve identity for 20 seconds; expiry or intentional leave resets the shared task so new players cannot inherit contribution credit.

Outstanding consolidated human playtest: target-age learning/pacing, assistive-technology accessibility, two-human coordination, perceived latency and representative hardware client FPS/server CPU/memory. These remain documented follow-ups, not a fabricated completed playtest or an implementation approval blocker. No M6 or automatic merge.
