"use client";

import { useEffect, useRef } from "react";
import type { GameState } from "@/lib/game/types";
import {
  playCorrectJingle,
  playPhoneBuzzSuccess,
  playTvBuzzSound,
  speakPlayerName,
  vibrateBuzzSuccess,
} from "@/lib/audio/game-sounds";

export function useHostGameAudio(state: GameState) {
  const lastBuzzKeyRef = useRef<string | null>(null);
  const lastCorrectKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (state.phase !== "answering" || state.activePlayerSlot === null) return;

    const key = `${state.question?.country.id ?? "q"}-${state.activePlayerSlot}`;
    if (lastBuzzKeyRef.current === key) return;
    lastBuzzKeyRef.current = key;

    const name = state.players[state.activePlayerSlot]?.name ?? "Spieler";
    playTvBuzzSound();
    window.setTimeout(() => speakPlayerName(name), 280);
  }, [state.phase, state.activePlayerSlot, state.players, state.question?.country.id]);

  useEffect(() => {
    if (state.phase === "buzzer" || state.phase === "countdown" || state.phase === "lobby") {
      lastBuzzKeyRef.current = null;
      lastCorrectKeyRef.current = null;
    }
  }, [state.phase]);

  useEffect(() => {
    const isCorrectResult =
      (state.phase === "result" || state.phase === "gameover") && state.lastResult?.correct;
    if (!isCorrectResult || state.activePlayerSlot === null) return;

    const key = `${state.question?.country.id ?? "q"}-${state.activePlayerSlot}-correct`;
    if (lastCorrectKeyRef.current === key) return;
    lastCorrectKeyRef.current = key;

    playCorrectJingle();
  }, [state.phase, state.lastResult, state.activePlayerSlot, state.question?.country.id]);
}

export function usePlayerBuzzAudio(gameState: GameState | null, playerSlot: number) {
  const gotBuzzRef = useRef(false);

  useEffect(() => {
    if (!gameState) return;

    if (gameState.phase === "answering" && gameState.activePlayerSlot === playerSlot) {
      if (!gotBuzzRef.current) {
        gotBuzzRef.current = true;
        playPhoneBuzzSuccess();
        vibrateBuzzSuccess();
      }
      return;
    }

    if (gameState.phase === "buzzer" || gameState.phase === "countdown" || gameState.phase === "lobby") {
      gotBuzzRef.current = false;
    }
  }, [gameState, playerSlot]);
}
