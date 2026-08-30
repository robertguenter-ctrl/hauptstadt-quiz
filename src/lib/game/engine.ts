import type { Country } from "@/lib/countries";
import { createQuestion } from "@/lib/game/questions";
import {
  DEFAULT_CONFIG,
  type GameConfig,
  type GameState,
  type Player,
} from "@/lib/game/types";

export type GameAction =
  | { type: "JOIN_PLAYER"; slot: number; name: string; playerId: string }
  | { type: "START_GAME" }
  | { type: "RESET_LOBBY" }
  | { type: "TICK" }
  | { type: "BUZZ"; playerSlot: number }
  | { type: "SELECT_TILE"; index: number }
  | { type: "NAVIGATE_TILE"; direction: "up" | "down" | "left" | "right" }
  | { type: "CONFIRM_ANSWER" };

export function createInitialPlayers(): Player[] {
  return Array.from({ length: DEFAULT_CONFIG.playerCount }, (_, slot) => ({
    slot,
    name: `Spieler ${slot + 1}`,
    playerId: null,
    score: 0,
    joined: false,
  }));
}

export function createInitialState(): GameState {
  return {
    phase: "lobby",
    players: createInitialPlayers(),
    question: null,
    activePlayerSlot: null,
    excludedSlots: [],
    selectedTileIndex: 4,
    timer: 0,
    lastResult: null,
    winnerSlot: null,
  };
}

function startNewQuestion(state: GameState, pool: Country[]): GameState {
  return {
    ...state,
    phase: "countdown",
    question: createQuestion(pool),
    activePlayerSlot: null,
    excludedSlots: [],
    selectedTileIndex: 4,
    timer: DEFAULT_CONFIG.countdownSeconds,
    lastResult: null,
  };
}

function checkWinner(players: Player[], config: GameConfig): number | null {
  const winner = players.find((p) => p.joined && p.score >= config.winScore);
  return winner?.slot ?? null;
}

function applyWrongAnswer(state: GameState, config: GameConfig): GameState {
  if (state.activePlayerSlot === null) return state;

  const players = state.players.map((p) => {
    if (p.slot !== state.activePlayerSlot) return p;
    return { ...p, score: p.score - config.wrongPenalty };
  });

  return {
    ...state,
    players,
    phase: "result",
    timer: 3,
    excludedSlots: [...state.excludedSlots, state.activePlayerSlot],
    activePlayerSlot: null,
    lastResult: { correct: false, playerSlot: state.activePlayerSlot },
  };
}

export function gameReducer(
  state: GameState,
  action: GameAction,
  pool: Country[],
  config: GameConfig = DEFAULT_CONFIG,
): GameState {
  switch (action.type) {
    case "JOIN_PLAYER": {
      if (state.phase !== "lobby") return state;
      const existing = state.players[action.slot];
      if (!existing || existing.joined) return state;

      const players = state.players.map((p) =>
        p.slot === action.slot
          ? { ...p, joined: true, name: action.name, playerId: action.playerId }
          : p,
      );
      return { ...state, players };
    }

    case "START_GAME": {
      const joinedCount = state.players.filter((p) => p.joined).length;
      if (joinedCount < 1) return state;
      return startNewQuestion(state, pool);
    }

    case "RESET_LOBBY": {
      const players = state.players.map((p) => ({
        ...createInitialPlayers()[p.slot],
        joined: p.joined,
        name: p.name,
        playerId: p.playerId,
        score: 0,
      }));
      return { ...createInitialState(), players };
    }

    case "TICK": {
      if (state.phase === "countdown") {
        if (state.timer <= 1) {
          return { ...state, phase: "buzzer", timer: 0 };
        }
        return { ...state, timer: state.timer - 1 };
      }

      if (state.phase === "answering" && state.activePlayerSlot !== null) {
        if (state.timer <= 1) {
          return applyWrongAnswer(state, config);
        }
        return { ...state, timer: state.timer - 1 };
      }

      if (state.phase === "result") {
        if (state.timer <= 1) {
          const winner = checkWinner(state.players, config);
          if (winner !== null && state.lastResult?.correct) {
            return { ...state, phase: "gameover", winnerSlot: winner, timer: 0 };
          }

          if (state.lastResult?.correct) {
            return startNewQuestion(state, pool);
          }

          const joinedSlots = state.players.filter((p) => p.joined).map((p) => p.slot);
          const allWrong = joinedSlots.every((slot) => state.excludedSlots.includes(slot));
          if (allWrong) {
            return startNewQuestion(state, pool);
          }

          return {
            ...state,
            phase: "countdown",
            activePlayerSlot: null,
            timer: config.countdownSeconds,
          };
        }
        return { ...state, timer: state.timer - 1 };
      }

      return state;
    }

    case "BUZZ": {
      if (state.phase !== "buzzer") return state;
      if (state.excludedSlots.includes(action.playerSlot)) return state;
      const player = state.players[action.playerSlot];
      if (!player?.joined) return state;

      return {
        ...state,
        phase: "answering",
        activePlayerSlot: action.playerSlot,
        timer: config.answerSeconds,
      };
    }

    case "SELECT_TILE": {
      if (state.phase !== "answering") return state;
      const index = Math.max(0, Math.min(8, action.index));
      return { ...state, selectedTileIndex: index };
    }

    case "NAVIGATE_TILE": {
      if (state.phase !== "answering") return state;
      const columns = 3;
      const total = 9;
      const row = Math.floor(state.selectedTileIndex / columns);
      const col = state.selectedTileIndex % columns;
      const maxRow = Math.ceil(total / columns) - 1;

      let nextRow = row;
      let nextCol = col;
      switch (action.direction) {
        case "up":
          nextRow = Math.max(0, row - 1);
          break;
        case "down":
          nextRow = Math.min(maxRow, row + 1);
          break;
        case "left":
          nextCol = Math.max(0, col - 1);
          break;
        case "right":
          nextCol = Math.min(columns - 1, col + 1);
          break;
      }

      const next = Math.min(nextRow * columns + nextCol, total - 1);
      return { ...state, selectedTileIndex: next };
    }

    case "CONFIRM_ANSWER": {
      if (state.phase !== "answering" || !state.question || state.activePlayerSlot === null) {
        return state;
      }

      const tile = state.question.tiles[state.selectedTileIndex];
      const correct = tile?.isCorrect ?? false;

      if (!correct) {
        return applyWrongAnswer(state, config);
      }

      const players = state.players.map((p) => {
        if (p.slot !== state.activePlayerSlot) return p;
        return { ...p, score: p.score + 1 };
      });

      const winner = checkWinner(players, config);

      if (winner !== null) {
        return {
          ...state,
          players,
          phase: "gameover",
          winnerSlot: winner,
          timer: 0,
          lastResult: { correct: true, playerSlot: state.activePlayerSlot },
        };
      }

      return {
        ...state,
        players,
        phase: "result",
        timer: 3,
        lastResult: { correct: true, playerSlot: state.activePlayerSlot },
      };
    }

    default:
      return state;
  }
}

export function serializeGameState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState;
}

export function parseGameState(raw: unknown): GameState | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as GameState;
  if (!s.phase || !Array.isArray(s.players)) return null;
  return s;
}

export function getPlayerSlotById(state: GameState, playerId: string): number | null {
  const player = state.players.find((p) => p.playerId === playerId);
  return player?.slot ?? null;
}
