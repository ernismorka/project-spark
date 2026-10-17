# Development status

M3 The Dark Circuit is in implementation on codex/m3-the-dark-circuit from main 4dc7084. Prerequisite M2 PR #3 merged and main CI run 38999625572 passed.

Core repair state, bounded R1 command, solver recomputation, before/after evidence, verification, localized completion and core replay are implemented. Visible terminal beacon and route strip reflect repaired/verified state. M2 solver and prior movement are preserved. No new dependencies, services or M4 features.

Initial 62 domain/camera tests passed; localization test added subsequently. Full validation and browser screenshot review are in progress. See EXECUTION_PLAN.md and M3_PREPARATION.md. Do not claim full local verification until all browsers run; known Windows Firefox launch limitation remains. No automatic merge or scheduling.
