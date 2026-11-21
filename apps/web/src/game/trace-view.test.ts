import { describe, expect, it } from "vitest";
import { jumperTray, traceRoute } from "@spark/game-core";
import { traceScale, traceView } from "./trace-view";

describe("angled trace work area", () => {
  it.each([
    [1213, 450],
    [1827, 810],
    [360, 490],
  ])(
    "keeps all tool targets in view and aim reversible at %d × %d",
    (width, height) => {
      const projection = traceView(width, height);
      expect(projection.worldHeight).toBeGreaterThanOrEqual(2.5 * traceScale);
      for (const { x, z } of [...traceRoute, jumperTray]) {
        const screen = projection.point(x, z);
        expect(screen.x).toBeGreaterThan(width * 0.1);
        expect(screen.x).toBeLessThan(width * 0.9);
        expect(screen.y).toBeGreaterThan(height * 0.22);
        expect(screen.y).toBeLessThan(height * 0.75);
        const target = projection.aim(screen.x, screen.y);
        expect(target.x).toBeCloseTo(x);
        expect(target.z).toBeCloseTo(z);
      }
    },
  );
});
