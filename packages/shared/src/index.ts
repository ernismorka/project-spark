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
export type Phase =
  "title" | "playing" | "paused" | "inspecting" | "complete" | "diagnosing";
export interface Session {
  readonly phase: Phase;
  readonly player: Explorer;
  readonly step: number;
  readonly inspected: readonly string[];
  readonly scanned: readonly string[];
  readonly inspection: { id: string; scan: boolean } | null;
  readonly recoveries: number;
  readonly diagnosis: DiagnosisState | null;
}
export type ExplorationCommand =
  | {
      type:
        | "start"
        | "pause"
        | "resume"
        | "close-inspection"
        | "open-diagnostics"
        | "close-diagnostics";
    }
  | { type: "step"; x: number; z: number; run: boolean; jump: boolean }
  | { type: "interact" | "scan" | "measure-node"; target: string }
  | { type: "submit-diagnosis"; fault: DiagnosisFault };
export interface DCResistor {
  readonly id: string;
  readonly kind: "resistor";
  readonly a: string;
  readonly b: string;
  readonly ohms: number;
  readonly open?: boolean;
}
export interface DCVoltageSource {
  readonly id: string;
  readonly kind: "voltage-source";
  readonly a: string;
  readonly b: string;
  readonly volts: number;
}
export type DCComponent = DCResistor | DCVoltageSource;
export interface DCCircuit {
  readonly ground: string;
  readonly nodes: readonly string[];
  readonly components: readonly DCComponent[];
}
export type DCFailure =
  | "invalid-circuit"
  | "unsupported-component"
  | "floating-node"
  | "singular-system"
  | "numerical-failure";
export type DCResult =
  | {
      readonly ok: true;
      readonly voltages: Readonly<Record<string, number>>;
      readonly currents: Readonly<Record<string, number>>;
    }
  | { readonly ok: false; readonly error: DCFailure };
export type DiagnosisFault = "r1-open" | "r2-open" | "source-off";
export interface DiagnosisState {
  readonly readings: Readonly<Record<string, number>>;
  readonly outcome: "collect-evidence" | "incorrect" | "identified";
  readonly attempts: number;
}
