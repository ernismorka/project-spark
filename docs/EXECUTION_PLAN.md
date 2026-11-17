# Execution plan

## M8 Playable Demo Release

M8 shipped to the repository in [PR #10](https://github.com/ernismorka/project-spark/pull/10). Main and origin/main were confirmed at merge commit `6d23e20` after fetching on 2026-11-17. The final PR head `3d5bc82` passed Linux validation and Windows launcher checks in [CI 39302226966](https://github.com/ernismorka/project-spark/actions/runs/39302226966). [Merged-main CI 39303028889](https://github.com/ernismorka/project-spark/actions/runs/39303028889) also succeeded.

The versioned local package, Windows launcher, EN/LT presentation, packaging gates and documentation meet the implemented scope in [M8_SCOPE.md](M8_SCOPE.md). [VALIDATION-M8.md](VALIDATION-M8.md) retains historical acceptance evidence, including the original Windows Firefox spawn limitation and the Linux software WebGL fix. Current Windows recovery evidence is in [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md).

## Next milestone

[M9 player experience proposal](M9_PROPOSAL.md) is ready for owner scope approval. Implementation is pending approval. The proposal prioritizes reproducible gameplay, orientation, presentation and learning-flow improvements on merged M8, with explicit protections for the solver, bounded controller and cooperative pilot. Human engagement, learning, accessibility and representative hardware evaluation remain tracked in [PLAYTEST.md](PLAYTEST.md). The demo is distributed as a local package.
