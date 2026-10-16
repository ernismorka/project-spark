# M1 validation

Validation in progress on 2026-10-16. Final outcomes will replace this section before delivery.

Implemented without dependency changes on branch codex/m1-first-contact from merged PR #1 / main cdb99c2. Manual QA instructions are in README.md.

Confirmed so far: lint, typecheck and production build pass; 17 unit tests pass; Chromium real-input mission completion, walk/jump/collision/zoom, pause, context-loss retry and session unmount/remount pass along with all original M0 smoke tests. Additional camera, listener teardown and viewport/performance checks are being run. Known local Windows Firefox launch limitation remains documented; Firefox CI stays enabled.

No representative midrange gaming laptop benchmark or target-audience 3–5 minute playtest has been performed. Direct mission traversal can be faster than the intended exploration/reading pace. No M2 features are present.
