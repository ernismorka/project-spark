import { createPilot, joinPilot, tickPilot } from "@spark/game-core";
let state = joinPilot(joinPilot(createPilot(), "analyst"), "engineer");
const started = performance.now();
for (let i = 0; i < 10000; i++) state = tickPilot(state);
console.log(
  JSON.stringify({
    scenario: "10000 fixed pilot ticks, two stationary players",
    milliseconds: performance.now() - started,
    snapshotBytes: Buffer.byteLength(JSON.stringify(state)),
    note: "Current host observation, not target-hardware FPS or scalability certification",
  }),
);
