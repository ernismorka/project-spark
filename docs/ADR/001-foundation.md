# ADR 001: Engine and domain boundary

Status: accepted for M0.

Use PlayCanvas standalone with Vite/TypeScript and a React overlay. The official setup supports this build-tool combination: https://developer.playcanvas.com/user-manual/engine/standalone/ (verified 2026-10-16). The official scaffolder was considered; the documented manual setup avoids unrelated generated content in the required workspace layout.

Use AppBase with explicit render, light and camera systems. Choose WebGL 2 rather than experimental or fallback-dependent WebGPU behavior. Keep immutable serializable rules independent of the renderer. Tradeoff: manual lifecycle integration is our responsibility; tests cover startup and explicit failure. Language state is a small demonstrator, not a networking abstraction. Defer Colyseus, solver and persistence until their product requirements exist. Exact installed versions are in package manifests and pnpm-lock.yaml.
