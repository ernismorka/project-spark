export interface TraceAim {
  x: number;
  z: number;
  engaged: boolean;
  toolbox: boolean;
}

export const traceScale = 5;
export const traceContactY = 0.26;
export const traceInclination = { rise: 0.6, run: 0.8 } as const;
export const traceFocus = { x: -0.3, z: 0.08 } as const;
export const traceToolbox = { x: -4.85, z: -2.6 } as const;
export const traceToolboxPickZ =
  traceToolbox.z - (0.55 * traceInclination.run) / traceInclination.rise;

export function overTraceToolbox(x: number, z: number) {
  return (
    Math.abs(x * traceScale - traceToolbox.x) <= 1.19 &&
    Math.abs(z * traceScale - traceToolboxPickZ) <= 0.81
  );
}

export function traceView(width: number, height: number) {
  const viewHeight = Math.max(2.5, (4.4 * height) / Math.max(width, 1));
  const pixels = height / viewHeight;
  return {
    worldHeight: viewHeight * traceScale,
    point(x: number, z: number) {
      return {
        x: width / 2 + (x - traceFocus.x) * pixels,
        y: height / 2 + (z - traceFocus.z) * pixels * traceInclination.rise,
      };
    },
    aim(x: number, y: number) {
      return {
        x: (x - width / 2) / pixels + traceFocus.x,
        z: (y - height / 2) / (pixels * traceInclination.rise) + traceFocus.z,
      };
    },
  };
}
