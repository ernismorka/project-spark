# Architecture

## Modules

apps/web owns React UI, browser lifecycle, input translation and PlayCanvas rendering. packages/shared exports serializable contracts and language identifiers. packages/game-core owns immutable state and command validation. packages/electronics currently contains only scope documentation: no empty executable abstraction or pretend solver.

## Commands and authority

Input -> validated command -> game-core -> updated state -> presentation. Language selection demonstrates the flow with set-language and a revision counter; it is a local session preference, not a future shared-world setting. execute accepts unknown input, validates type and supported language, rejects malformed input and returns deterministic state. Identical no-op commands retain the original state. No clocks, random values or browser globals occur in domain code.

The local MVP runs its own authoritative core. A future Colyseus server may call the same domain functions after authentication/authorization and command ordering are specified. No Colyseus dependency, transport or speculative server framework exists now.

## Rendering and lifecycle

The official standalone engine API uses createGraphicsDevice, AppBase and only render/camera/light systems. WebGL 2 is explicit; pixel ratio is capped at 1.5. Primitive meshes and local materials need no asset download. React asynchronously loads the scene, tracks loading/ready/error independently of game state, and cleans up on unmount/retry. Aborted initialization destroys its device. ResizeObserver tracks canvas size. Disposal releases app, materials and observer; context loss displays an error. Retry creates a new canvas. A failed renderer never reports ready.

## Localization

Typed English/Lithuanian dictionaries cover visible copy and canvas labels. The selector dispatches a core command; React derives copy from state and sets document language. No persistence is promised. No backend or secrets.

## Simulation and testing

Future electronics work must define supported components, units, deterministic iteration order, numerical tolerances and convergence failure before implementation. No electrical behavior is simulated today. Vitest runs domain tests in Node; Playwright tests Chromium/Firefox production builds, language switching, error-free application startup and deliberately denied WebGL. An allowed fallback is distinct from successful rendering; inspect test results and renderer status when reporting compatibility. CI runs formatting, lint, types, units, build and browser checks. No browser-specific logic enters the domain.
