"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Country } from "@/lib/countries";
import {
  createInitialState,
  gameReducer,
  type GameAction,
} from "@/lib/game/engine";
import { DEFAULT_CONFIG, type GameConfig, type GameState } from "@/lib/game/types";

export function useGameEngine(pool: Country[], config: GameConfig = DEFAULT_CONFIG) {
  const poolRef = useRef(pool);
  poolRef.current = pool;

  const [state, dispatch] = useReducer(
    (s: GameState, a: GameAction) => gameReducer(s, a, poolRef.current, config),
    undefined,
    createInitialState,
  );

  const dispatchAction = useCallback((action: GameAction) => dispatch(action), []);

  useEffect(() => {
    if (
      state.phase !== "countdown" &&
      state.phase !== "answering" &&
      state.phase !== "result"
    ) {
      return;
    }

    const id = window.setInterval(() => dispatchAction({ type: "TICK" }), 1000);
    return () => window.clearInterval(id);
  }, [state.phase, dispatchAction]);

  return { state, dispatch: dispatchAction };
}

export type { GameAction, GameState };
