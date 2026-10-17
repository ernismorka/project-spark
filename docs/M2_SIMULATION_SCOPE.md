# M2 DC simulation scope

Status: implementation specification for the authorized M2 milestone, based on merged M1 PR #2 / main 5c84a1a. No new dependencies.

## Supported model

Bounded, linear steady-state DC networks: positive finite resistors (optionally explicitly open) and independent ideal voltage sources. Nodes are explicit stable IDs; ground is the voltage reference. Connected wires share a node ID. SI units: volts, amperes, ohms; all branch currents are positive from component terminal a to b. Voltage-source value means Va - Vb. Open resistors carry exactly zero current. No time integration or nonlinear iteration.

Limits: 16 nodes including ground, 32 components, resistance 1e-3 to 1e9 ohms, ideal source magnitude <=1000 V. Zero-ohm resistors are rejected: represent an ideal wire using a shared node. Self-connected positive resistors are valid with zero drop/current. A nonzero ideal voltage source across the same node is inconsistent; even zero-valued self-sources are rejected as redundant constraints. Unsupported capacitors, LEDs, MCU behavior, AC, temperature and real-device parasitics return unsupported/invalid outcomes; their world visuals do not imply simulation.

## Numerical contract

Modified nodal analysis with sorted node/component IDs, voltage-source current unknowns and partial-pivot Gaussian elimination. Ties retain stable row order. Row scaling improves the mixed conductance/constraint matrix. Pivot threshold 1e-12 after row scaling; finite output plus original-equation residual <=1e-8 absolute + 1e-8 relative is required (amperes for KCL rows, volts for source constraints). Singular/inconsistent or numerically ill-conditioned systems return an explicit failure, not guessed readings. Floating nodes are detected by conductive connectivity to ground (open resistors excluded). Dependent ideal-source loops may be singular even when voltages are consistent; report singular rather than selecting arbitrary source currents. Negative zero is normalized; results are otherwise unrounded. No arbitrary conductance-to-ground trick or fabricated measurement.

Reference method: Qucs technical guide, Modified Nodal Analysis: https://qucs.sourceforge.net/tech/node14.html. Implementation is intentionally bounded and does not claim SPICE compatibility.

## Playable diagnosis

After First Contact, the nearby controller terminal offers a DC training model (separate from MCU internals). Ideal 5 V source, R1=1 kohm from VCC to SENSE and R2=1 kohm from SENSE to GND. Healthy reference: SENSE=2.5 V and branch current=2.5 mA. Training fault: R1 open; measured VCC=5 V, SENSE=0 V, current=0 A. Player gathers both test-point voltages and chooses among R1 open, R2 open, source off. Core requires evidence and validates the answer. Incorrect answers give feedback without completing diagnosis. No repair, circuit editor, live scan measurements on unrelated components or MCU execution.

M1 exploration, original inspection text and mission completion remain intact. All new measurement/diagnosis copy is English/Lithuanian; results label this specific DC model and its units. Session state remains serializable, commands contain IDs and core computes measurements rather than trusting client values.

## Acceptance fixtures

Ohm's law, series/parallel networks, divider, reversed source polarity, source between non-ground nodes, open resistor, disconnected/floating topology, invalid bounds/IDs/unsupported elements, conflicting/redundant sources, deterministic input-order permutation, KCL and power balance. Core tests cover access/range/evidence/invalid/duplicate/incorrect/correct diagnosis and persistence on close/reopen. Browser tests reach the real terminal through M1 gameplay and complete localized diagnosis without state injection.
