# M2 linear DC simulation

Framework-independent, deterministic, bounded modified nodal analysis. API: solveDC(unknown) returns a serializable success with node volts/branch amps, or an explicit error code. No browser/engine APIs, dependencies beyond shared types, nonlinear components or time integration. See ../../docs/M2_SIMULATION_SCOPE.md for the supported subset, limits, current sign, units, tolerances and failure behavior. World capacitor/LED/MCU visuals are not electrically simulated.
