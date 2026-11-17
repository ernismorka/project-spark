# Execution plan

## M8 Playable Demo Release

M8 shipped to the repository in [PR #10](https://github.com/ernismorka/project-spark/pull/10). Main and origin/main were confirmed at merge commit `6d23e20` after fetching on 2026-11-17. The final PR head `3d5bc82` passed Linux validation and Windows launcher checks in [CI 39302226966](https://github.com/ernismorka/project-spark/actions/runs/39302226966). [Merged-main CI 39303028889](https://github.com/ernismorka/project-spark/actions/runs/39303028889) also succeeded.

The versioned local package, Windows launcher, EN/LT presentation, packaging gates and documentation meet the implemented scope in [M8_SCOPE.md](M8_SCOPE.md). [VALIDATION-M8.md](VALIDATION-M8.md) retains historical acceptance evidence, including the original Windows Firefox spawn limitation and the Linux software WebGL fix. Current Windows recovery evidence is in [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md).

## M9 Dark Circuit player experience

The owner approved the scoped [M9 plan](M9_PROPOSAL.md) on 2026-11-17. Branch `codex/m9-player-experience` started at merged M8 `6d23e20`. The Windows formatting fix and recovery evidence were preserved separately as `4994289` on `codex/m8-windows-recovery` and applied to M9 for Windows verification.

Acceptance covers the real-input episode, bilingual guidance and commissioning handoffs, before/after visual inspection, responsive menus, observed rendering workload, preserved simulation/programming/cooperative regressions, and a review PR. Status and validation evidence are tracked in [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md). Human engagement, learning, assistive-technology usability and representative hardware evaluation remain tracked in [PLAYTEST.md](PLAYTEST.md). The next milestone is undefined pending owner review.

Implementation and local acceptance are complete. Review and exact final-head CI are tracked in [PR #11](https://github.com/ernismorka/project-spark/pull/11). Owner approval is required before merge.

## M10 Physical Diagnostics & Repair

The owner authorized M10 scope. Branch `codex/m10-physical-diagnostics` starts at `248990b`, the verified merge of [M9 PR #11](https://github.com/ernismorka/project-spark/pull/11). The [M10 plan](M10_PLAN.md) defines the in-world route and acceptance criteria. Field diagnostics, the existing commissioning handoff and parity coverage are implemented. [Development status](DEVELOPMENT_STATUS.md) records local verification and performance observations. Review and exact final-head CI are tracked in [PR #13](https://github.com/ernismorka/project-spark/pull/13). The next milestone requires owner approval.
