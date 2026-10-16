# M2 preparation — planning only

Source of truth: existing ROADMAP.md M2 Electrical reasoning and GDD.md. Dependency: approved/merged M1 baseline. No solver, repair mechanics or measurement UI is implemented by this document.

Before implementation, agree the deterministic simulation subset: supported sources/passive elements, DC versus time-domain behavior, polarity, explicit unsupported cases, units, tolerance and convergence/singularity behavior. Avoid promising simulated LEDs, capacitors or MCU behavior merely because M1 renders those shapes.

Planned sequence after approval:

1. Define serializable circuit contracts, stable node/component IDs, units and validation. Separate world/device references from solver elements.
2. Specify analytic fixtures for a single resistor/source, series/parallel combinations and open/short/invalid topology behavior. Fix deterministic ordering, numeric tolerances and explicit failure outcomes before choosing the small solver.
3. Implement the approved subset in packages/electronics with Node-only tests. Do not import renderer/browser APIs or execute player code. Benchmark the bounded fixture set and document limitations.
4. Connect validated diagnosis commands in game-core, preserving M1 exploration tests. Add localized explanations only for measurements the implemented subset supports.
5. Run the common quality gate, self-review and create the M2 PR without merging it.

Acceptance proposal: analytic fixtures match declared tolerances; identical input/order policies reproduce results; unsupported/nonconvergent circuits return explicit outcomes; localized claims match scope; exploration regression suite stays green. This plan does not authorize a generic circuit editor, programming, multiplayer or a complete new episode.
