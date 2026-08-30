import type { Country } from "@/lib/countries";

export type QuestionType =
  | "flag_to_country"
  | "country_to_flag"
  | "country_to_capital"
  | "capital_to_country";

export type GamePhase =
  | "lobby"
  | "countdown"
  | "buzzer"
  | "answering"
  | "result"
  | "gameover";

export interface TileOption {
  id: string;
  label: string;
  iso_code?: string;
  isCorrect: boolean;
}

export interface Question {
  type: QuestionType;
  country: Country;
  prompt: string;
  displayFlag?: string;
  displayText?: string;
  tiles: TileOption[];
}

export interface Player {
  slot: number;
  name: string;
  gamepadIndex: number | null;
  score: number;
  joined: boolean;
}

export interface GameConfig {
  winScore: number;
  countdownSeconds: number;
  answerSeconds: number;
  wrongPenalty: number;
  playerCount: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  winScore: 10,
  countdownSeconds: 5,
  answerSeconds: 10,
  wrongPenalty: 1,
  playerCount: 4,
};

export const PLAYER_COLORS = [
  { name: "Spieler 1", bg: "bg-red-500", ring: "ring-red-400", text: "text-red-400" },
  { name: "Spieler 2", bg: "bg-blue-500", ring: "ring-blue-400", text: "text-blue-400" },
  { name: "Spieler 3", bg: "bg-green-500", ring: "ring-green-400", text: "text-green-400" },
  { name: "Spieler 4", bg: "bg-yellow-500", ring: "ring-yellow-400", text: "text-yellow-400" },
] as const;

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  flag_to_country: "Nenne das Land zur Flagge",
  country_to_flag: "Wähle die Flagge zum Land",
  country_to_capital: "Nenne die Hauptstadt",
  capital_to_country: "Nenne das Land zur Hauptstadt",
};
