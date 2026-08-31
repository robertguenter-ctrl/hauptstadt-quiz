"use client";

import { useEffect, useRef, useState } from "react";
import { playCorrectJingle, playWrongAlarm } from "@/lib/audio/game-sounds";
import type { GameState } from "@/lib/game/types";

const RESULT_REVEAL_DELAY_MS = 2000;

export function useResultReveal(state: GameState): boolean {
  const [revealed, setRevealed] = useState(false);
  const playedKeyRef = useRef<string | null>(null);

  const resultKey =
    state.phase === "result" && state.lastResult
      ? `${state.question?.country.id ?? "q"}-${state.lastResult.playerSlot}-${state.lastResult.correct ? "c" : "w"}`
      : null;

  useEffect(() => {
    if (!resultKey) {
      setRevealed(false);
      playedKeyRef.current = null;
      return;
    }

    setRevealed(false);
    const correct = state.lastResult?.correct ?? false;

    const timer = window.setTimeout(() => {
      setRevealed(true);
      if (playedKeyRef.current === resultKey) return;
      playedKeyRef.current = resultKey;
      if (correct) {
        playCorrectJingle();
      } else {
        playWrongAlarm();
      }
    }, RESULT_REVEAL_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [resultKey, state.lastResult?.correct]);

  return revealed;
}
