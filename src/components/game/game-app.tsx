"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getPlayableCountries } from "@/lib/countries";
import { fetchCountriesFromSupabase } from "@/lib/supabase/client";
import { PLAYER_COLORS, QUESTION_TYPE_LABELS } from "@/lib/game/types";
import { useGameEngine } from "@/lib/game/use-game-engine";
import {
  getNavigationDirection,
  isConfirmButton,
  useGamepads,
} from "@/lib/gamepad/use-gamepads";
import {
  GamepadActivateOverlay,
  WaitingForGamepadBanner,
} from "@/components/game/gamepad-activate-overlay";
import { Scoreboard } from "@/components/game/scoreboard";
import { QuestionDisplay, TileGrid, ActivePlayerBanner } from "@/components/game/tile-grid";
import { cn } from "@/lib/utils";
import { useKeyboardFallback } from "@/lib/gamepad/use-keyboard-fallback";

export function GameApp() {
  const [countryPool, setCountryPool] = useState(getPlayableCountries());
  const { state, dispatch } = useGameEngine(countryPool);
  const { gamepads, userActivated, activate, consumePresses, supportsGamepad } = useGamepads();
  const prevAxesRef = useRef<Map<number, number[]>>(new Map());
  const lobbyStartedRef = useRef(false);

  useEffect(() => {
    fetchCountriesFromSupabase().then((remote) => {
      if (remote?.length) setCountryPool(remote);
    });
  }, []);

  const joinedCount = state.players.filter((p) => p.joined).length;
  const canStart = joinedCount >= 1;
  const keyboardEnabled = gamepads.length === 0;

  useKeyboardFallback(keyboardEnabled, (action) => {
    if (state.phase === "lobby" && action.type === "confirm") {
      dispatch({ type: "JOIN_PLAYER", gamepadIndex: -1 });
      return;
    }
    if (state.phase === "buzzer" && action.type === "confirm") {
      const player = state.players.find((p) => p.joined && p.gamepadIndex === -1);
      if (player && !state.excludedSlots.includes(player.slot)) {
        dispatch({ type: "BUZZ", playerSlot: player.slot });
      }
      return;
    }
    if (state.phase === "answering" && state.activePlayerSlot !== null) {
      const player = state.players[state.activePlayerSlot];
      if (player?.gamepadIndex !== -1) return;
      if (action.type === "navigate" && action.direction) {
        dispatch({ type: "NAVIGATE_TILE", direction: action.direction });
      }
      if (action.type === "confirm") {
        dispatch({ type: "CONFIRM_ANSWER" });
      }
    }
  });

  useEffect(() => {
    if (state.phase !== "lobby") return;

    for (const press of consumePresses()) {
      dispatch({ type: "JOIN_PLAYER", gamepadIndex: press.gamepadIndex });
    }
  }, [gamepads, state.phase, consumePresses, dispatch]);

  useEffect(() => {
    if (state.phase !== "lobby" || !canStart || lobbyStartedRef.current) return;

    const timeout = window.setTimeout(() => {
      lobbyStartedRef.current = true;
      dispatch({ type: "START_GAME" });
    }, 2000);
    return () => window.clearTimeout(timeout);
  }, [state.phase, canStart, joinedCount, dispatch]);

  useEffect(() => {
    if (state.phase !== "buzzer") return;

    for (const press of consumePresses()) {
      const player = state.players.find((p) => p.gamepadIndex === press.gamepadIndex);
      if (!player?.joined || state.excludedSlots.includes(player.slot)) continue;
      dispatch({ type: "BUZZ", playerSlot: player.slot });
      break;
    }
  }, [gamepads, state.phase, state.players, state.excludedSlots, consumePresses, dispatch]);

  useEffect(() => {
    if (state.phase !== "answering" || state.activePlayerSlot === null) return;

    const player = state.players[state.activePlayerSlot];
    if (!player || player.gamepadIndex === null) return;

    const padIndex = player.gamepadIndex;
    const pad = gamepads.find((g) => g.index === padIndex);
    if (!pad) return;

    const prevAxes = prevAxesRef.current.get(padIndex);
    const direction = getNavigationDirection(pad, prevAxes);
    prevAxesRef.current.set(padIndex, [...pad.axes]);

    if (direction) {
      dispatch({ type: "NAVIGATE_TILE", direction });
    }

    for (const press of consumePresses()) {
      if (press.gamepadIndex !== padIndex) continue;
      if (isConfirmButton(press.buttonIndex)) {
        dispatch({ type: "CONFIRM_ANSWER" });
        break;
      }
    }
  }, [gamepads, state.phase, state.activePlayerSlot, state.players, consumePresses, dispatch]);

  const phaseLabel = useMemo(() => {
    switch (state.phase) {
      case "lobby":
        return "Drücke einen Knopf auf deinem Controller zum Beitreten";
      case "countdown":
        return `Bereit machen … ${state.timer}`;
      case "buzzer":
        return "BUZZER! Wer ist zuerst?";
      case "answering":
        return `${PLAYER_COLORS[state.activePlayerSlot!].name} antwortet — ${state.timer}s`;
      case "result":
        return state.lastResult?.correct ? "Richtig!" : "Falsch!";
      case "gameover":
        return `${PLAYER_COLORS[state.winnerSlot!].name} gewinnt!`;
      default:
        return "";
    }
  }, [state]);

  if (state.phase === "lobby") {
    return (
      <>
        <GamepadActivateOverlay visible={supportsGamepad && !userActivated} onActivate={activate} />
        <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-slate-950 px-8 text-white">
          <WaitingForGamepadBanner visible={userActivated && gamepads.length === 0} />
          <div className="text-center">
            <h1 className="text-6xl font-black tracking-tight">Hauptstadt-Quiz</h1>
            <p className="mt-4 text-2xl text-white/70">Wer zuerst 10 Punkte hat, gewinnt</p>
          </div>

          <Scoreboard players={state.players} />

          <p className="text-3xl font-medium text-amber-300">{phaseLabel}</p>

          <div className="text-center text-white/50">
            <p>{gamepads.length} Controller erkannt</p>
            {gamepads[0] && (
              <p className="mt-1 font-mono text-sm text-white/40">{gamepads[0].id}</p>
            )}
            <p className="mt-2 text-lg">9 Antwort-Kacheln · −1 bei Fehler · Solo-Test möglich</p>
            {keyboardEnabled && userActivated && (
              <p className="mt-2 text-amber-300">Kein Controller? Leertaste = Beitreten/Buzzern</p>
            )}
          </div>

          {canStart && joinedCount >= 1 && (
            <p className="animate-pulse text-xl text-green-400">Bereit — Spiel startet gleich …</p>
          )}

          <button
            type="button"
            onClick={() => dispatch({ type: "START_GAME" })}
            disabled={!canStart}
            className="rounded-xl bg-amber-500 px-8 py-4 text-xl font-bold text-black disabled:opacity-30"
          >
            Manuell starten
          </button>
        </div>
      </>
    );
  }

  if (state.phase === "gameover") {
    const winner = state.players[state.winnerSlot!];
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-slate-950 px-8 text-white">
        <h1 className="text-7xl font-black text-amber-400">Gewonnen!</h1>
        <p className="text-4xl">{PLAYER_COLORS[winner.slot].name} hat {winner.score} Punkte</p>
        <Scoreboard players={state.players} activeSlot={winner.slot} />
        <button
          type="button"
          onClick={() => {
            lobbyStartedRef.current = false;
            dispatch({ type: "RESET_LOBBY" });
          }}
          className="rounded-xl bg-amber-500 px-10 py-5 text-2xl font-bold text-black"
        >
          Neues Spiel
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 px-8 py-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-white/40">Hauptstadt-Quiz</p>
          {state.question && (
            <p className="text-lg text-white/60">{QUESTION_TYPE_LABELS[state.question.type]}</p>
          )}
        </div>
        <div
          className={cn(
            "rounded-full px-6 py-2 text-xl font-bold",
            state.phase === "buzzer" && "animate-pulse bg-red-500",
            state.phase === "countdown" && "bg-amber-500 text-black",
            state.phase === "answering" && "bg-blue-500",
            state.phase === "result" && (state.lastResult?.correct ? "bg-green-500" : "bg-red-500"),
          )}
        >
          {phaseLabel}
        </div>
      </div>

      <Scoreboard players={state.players} activeSlot={state.activePlayerSlot} />

      {state.phase === "answering" && state.activePlayerSlot !== null && (
        <ActivePlayerBanner
          playerSlot={state.activePlayerSlot}
          phase="answering"
          timer={state.timer}
        />
      )}

      {state.phase === "result" && state.lastResult && (
        <ActivePlayerBanner playerSlot={state.lastResult.playerSlot} phase="result" />
      )}

      <div className="flex flex-1 flex-col items-center justify-center gap-10 py-8">
        {state.question && (
          <QuestionDisplay
            question={state.question}
            phase={state.phase}
            countdown={state.timer}
          />
        )}
        {state.question && (state.phase === "answering" || state.phase === "result") && (
          <TileGrid
            question={state.question}
            selectedIndex={state.selectedTileIndex}
            showCorrect={state.phase === "result"}
          />
        )}
      </div>

      {state.phase === "result" && state.question && !state.lastResult?.correct && (
        <p className="text-center text-2xl text-white/70">
          Richtige Antwort:{" "}
          <span className="font-bold text-green-400">
            {state.question.type === "country_to_capital"
              ? state.question.country.capital_de
              : state.question.type === "capital_to_country" || state.question.type === "flag_to_country"
                ? state.question.country.name_de
                : `Flagge von ${state.question.country.name_de}`}
          </span>
        </p>
      )}
    </div>
  );
}
