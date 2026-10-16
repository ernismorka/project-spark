export const languages = ["en", "lt"] as const;
export type Language = (typeof languages)[number];
export type GameCommand = { type: "set-language"; language: Language };
export interface GameState {
  readonly language: Language;
  readonly revision: number;
  readonly scene: "foundation";
}
