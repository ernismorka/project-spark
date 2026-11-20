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

## M11 guidance difficulty

The owner authorized three browser-side guidance tiers on merged M10 `8b6ae37`. [M10 PR #13](https://github.com/ernismorka/project-spark/pull/13) is merged. M11 reuses the existing scene beacon, compass, meter and notebook. Acceptance covers EN/LT, persistent selection, switching during play and mid-diagnosis, tier-specific visual cues and unchanged move, probe, proof, repair and commissioning behavior. The expanded field test also absorbs the timeout-only [PR #14](https://github.com/ernismorka/project-spark/pull/14) and moves its T1 waypoint inside the interaction range after a slower rerun revealed the actual boundary issue.

[M11 PR #15](https://github.com/ernismorka/project-spark/pull/15) tracks review and exact final-head checks. The next milestone requires owner approval.

## M12 Graphics & Interaction Animations

The owner authorized M12 on merged M11 `f9e0dd7`. Implement on `codex/m12-graphics-interactions`. Refine the existing procedural materials and lighting, smooth the engineer pose and camera, and animate only accepted field probes, the physical repair and verified restoration. Preserve the fixed-step movement, solver, episode rules, guidance tiers and EN/LT.

Acceptance covers unchanged readings and repair gates, no feedback for rejected actions, reduced motion, paused render lifecycle, before/after board captures, workload sampling and both packaged browser projects. Record findings and PR evidence in [Development status](DEVELOPMENT_STATUS.md).

Local implementation and verification are complete. [PR #16](https://github.com/ernismorka/project-spark/pull/16) tracks review and exact final-head CI. A later milestone requires owner approval.

## M13 Visual Identity & Field Journal

The owner authorized M13 on merged M12 `7ecc53d`. Use `codex/m13-field-journal` to demonstrate the original ivory, teal and copper art direction at the T1 service area. Pair a rounded terminal mesh with an illustrated journal containing a measurements leaf and a diagnosis leaf. Keep the current board collisions, commands, evidence, guidance tiers and movement.

Acceptance covers the offline assets and their provenance, a real EN/LT field playthrough, keyboard page navigation and diagnosis, reduced motion, narrow layout, before/after captures and a comparable scene-workload sample.

Local implementation and verification are complete. See [Development status](DEVELOPMENT_STATUS.md) for browser results, capture review and workload observations. [PR #17](https://github.com/ernismorka/project-spark/pull/17) tracks final-head checks and review. A later milestone requires owner approval.

## M14 Character & Art Overhaul

The owner authorized M14 on merged M13 `926f255`. Use `codex/m14-character-art` and keep the existing fixed-step controls, collisions, episode authority and diagnostic gates.

1. Capture the opening board and field notebook on M13. Establish an original workshop palette with ivory, petrol blue, marigold and copper.
2. Author a compact 3D kit for the engineer, notebook and main board landmarks. Use a joint hierarchy and keyed poses for gait, idle and taking out the notebook. Keep immutable board meshes in static batches.
3. Route N and the visible notebook control through the existing episode command. Freeze traversal, animate the book and camera, show live evidence on the physical pages and retain localized keyboard-operable diagnosis controls. Reverse the sequence on close and bypass animated motion when reduced motion is set.
4. Record asset provenance and capture comparable browser frames. Exercise open, view, close, reduced motion and the complete repair/commissioning route in packaged browser tests. Run the full verifier and review rendering workload before opening the PR.

Implementation, packaged local verification and before/after captures are complete. [Development status](DEVELOPMENT_STATUS.md) records the results and measured workload. [PR #18](https://github.com/ernismorka/project-spark/pull/18) tracks final-head checks and review. A later milestone requires owner approval.

## M15 Immersive Tools & Interactions

The owner authorized M15 on merged M14 `e7806af`. Use `codex/m15-immersive-tools`.

1. Move the journal camera through the existing draw animation to eye level. Align the bilingual HTML readings and controls to the physical pages so the original keyboard workflow remains available on the book itself.
2. Extend the original workshop kit with the meter, probes, soldering pen and face guard. Animate the reference and signal contacts and show the accepted solver reading on the instrument.
3. Stage the accepted trace repair with the visor, heat, limited sparks and a visually progressive bridge. Keep the existing domain repair and fresh verification requirements.
4. Check the opening, contact, soldering and verified states in both packaged browser projects. Inspect matched M14/M15 captures, record timing and draw counts, and submit the evidence and asset provenance for review.

Implementation, packaged browser checks and before/after captures are complete. See [Development status](DEVELOPMENT_STATUS.md) for the verification and workload results. [PR #19](https://github.com/ernismorka/project-spark/pull/19) tracks final-head CI and review. A later milestone requires owner approval.
