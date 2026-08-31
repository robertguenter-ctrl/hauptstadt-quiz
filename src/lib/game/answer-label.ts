import type { GameState } from "@/lib/game/types";

export function getSubmittedAnswerLabel(state: GameState): string {
  const { lastResult, question, selectedTileIndex } = state;
  if (!lastResult) return "—";

  if (lastResult.voiceAnswer) {
    return lastResult.voiceAnswer.matched ?? lastResult.voiceAnswer.transcript ?? "—";
  }

  if (question) {
    return question.tiles[selectedTileIndex]?.label ?? "—";
  }

  return "—";
}
