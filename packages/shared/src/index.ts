export const languages = ["en", "lt"] as const;
export type Language = (typeof languages)[number];
export type GameCommand = { type: "set-language"; language: Language };
export interface GameState {
  readonly language: Language;
  readonly revision: number;
  readonly scene: "foundation";
}
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}
export interface Solid {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
}
export type ComponentKind =
  "resistor" | "capacitor" | "led" | "microcontroller" | "terminal";
export interface BoardComponent {
  readonly id: string;
  readonly kind: ComponentKind;
  readonly x: number;
  readonly z: number;
  readonly inspectable: boolean;
  readonly scannable: boolean;
  readonly deviceRef?: string;
}
export interface Explorer {
  readonly id: string;
  readonly position: Vec3;
  readonly velocity: Vec3;
  readonly grounded: boolean;
  readonly facing: number;
}
export type Phase = "title" | "playing" | "paused" | "inspecting" | "complete";
export interface Session {
  readonly phase: Phase;
  readonly player: Explorer;
  readonly step: number;
  readonly inspected: readonly string[];
  readonly scanned: readonly string[];
  readonly inspection: { id: string; scan: boolean } | null;
  readonly recoveries: number;
}
export type ExplorationCommand =
  | { type: "start" | "pause" | "resume" | "close-inspection" }
  | { type: "step"; x: number; z: number; run: boolean; jump: boolean }
  | { type: "interact" | "scan"; target: string };
