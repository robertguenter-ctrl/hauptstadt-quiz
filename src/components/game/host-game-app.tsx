"use client";

import { useEffect, useMemo, useState } from "react";
import { getPlayableCountries } from "@/lib/countries";
import { fetchCountriesFromSupabase } from "@/lib/supabase/client";
import { PLAYER_COLORS, ANSWER_MODE_LABELS, QUESTION_TYPE_LABELS } from "@/lib/game/types";
import { allJoinedExcluded } from "@/lib/game/engine";
import { getCorrectAnswerLabel } from "@/lib/game/voice-match";
import { useGameEngine } from "@/lib/game/use-game-engine";
import { useHostGameAudio } from "@/lib/audio/use-game-audio";
import { resumeAudio } from "@/lib/audio/game-sounds";
import { useRoomHost } from "@/lib/room/use-room";
import { joinUrl, qrCodeImageUrl } from "@/lib/room/codes";
import { Scoreboard } from "@/components/game/scoreboard";
import { QuestionDisplay, TileGrid, ActivePlayerBanner } from "@/components/game/tile-grid";
import { cn } from "@/lib/utils";

interface HostGameAppProps {
  roomCode: string;
}

export function HostGameApp({ roomCode }: HostGameAppProps) {
  const [countryPool, setCountryPool] = useState(getPlayableCountries());
  const { state, dispatch } = useGameEngine(countryPool);
  const joinLink = joinUrl(roomCode);

  useRoomHost(roomCode, state, dispatch);
  useHostGameAudio(state);

  useEffect(() => {
    fetchCountriesFromSupabase().then((remote) => {
      if (remote?.length) setCountryPool(remote);
    });
  }, []);

  const joinedCount = state.players.filter((p) => p.joined).length;
  const canStart = joinedCount >= 1;

  const phaseLabel = useMemo(() => {
    switch (state.phase) {
      case "lobby":
        return `${joinedCount}/4 Spieler verbunden`;
      case "countdown":
        return `Bereit machen … ${state.timer}`;
      case "buzzer":
        return "BUZZER!";
      case "answering":
        return `${state.players[state.activePlayerSlot!]?.name ?? "Spieler"} antwortet — ${state.timer}s`;
      case "result":
        return state.lastResult?.correct ? "Richtig!" : "Falsch!";
      case "gameover":
        return `${state.players[state.winnerSlot!]?.name ?? "Spieler"} gewinnt!`;
      default:
        return "";
    }
  }, [state, joinedCount]);

  function playerName(slot: number): string {
    return state.players[slot]?.name ?? PLAYER_COLORS[slot].name;
  }

  if (state.phase === "lobby") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-950 px-8 text-white">
        <div className="text-center">
          <h1 className="text-6xl font-black tracking-tight">Hauptstadt-Quiz</h1>
          <p className="mt-4 text-2xl text-white/70">Handy-Buzzer — Raumcode</p>
          <p className="mt-2 text-7xl font-black tracking-[0.3em] text-amber-400">{roomCode}</p>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-white/5 p-8">
          <img src={qrCodeImageUrl(joinLink)} alt="QR-Code zum Beitreten" className="rounded-xl" width={280} height={280} />
          <p className="max-w-sm break-all text-center text-sm text-white/60">{joinLink}</p>
          <p className="text-lg text-white/80">Spieler: Link öffnen, Namen eingeben, fertig.</p>
        </div>

        <Scoreboard players={state.players} />

        <div className="flex flex-col items-center gap-3">
          <p className="text-sm uppercase tracking-widest text-white/40">Antwortmodus</p>
          <div className="flex gap-3">
            {(["tiles", "voice"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => dispatch({ type: "SET_ANSWER_MODE", mode })}
                className={cn(
                  "rounded-xl px-6 py-3 text-lg font-bold transition-colors",
                  state.answerMode === mode
                    ? "bg-amber-500 text-black"
                    : "bg-white/10 text-white hover:bg-white/20",
                )}
              >
                {ANSWER_MODE_LABELS[mode]}
              </button>
            ))}
          </div>
          <p className="max-w-md text-center text-sm text-white/50">
            {state.answerMode === "voice"
              ? "Spieler antworten per Sprache — ohne Flaggen-Auswahl."
              : "Spieler wählen die Antwort per Touchpad auf dem Handy."}
          </p>
        </div>

        <p className="text-lg text-white/60">
          {canStart
            ? "Starte das Spiel, wenn alle Spieler da sind — am TV oder per Handy."
            : "Warte auf mindestens einen Spieler …"}
        </p>

        <button
          type="button"
          onClick={() => {
            resumeAudio();
            dispatch({ type: "START_GAME" });
          }}
          disabled={!canStart}
          className="rounded-xl bg-amber-500 px-8 py-4 text-xl font-bold text-black disabled:opacity-30"
        >
          Spiel jetzt starten
        </button>
      </div>
    );
  }

  if (state.phase === "gameover") {
    const winner = state.players[state.winnerSlot!];
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-slate-950 px-8 text-white">
        <h1 className="text-7xl font-black text-amber-400">Gewonnen!</h1>
        <p className="text-4xl">{winner.name} hat {winner.score} Punkte</p>
        <Scoreboard players={state.players} activeSlot={winner.slot} />
        <button
          type="button"
          onClick={() => dispatch({ type: "RESET_LOBBY" })}
          className="rounded-xl bg-amber-500 px-10 py-5 text-2xl font-bold text-black"
        >
          Neues Spiel
        </button>
      </div>
    );
  }

  const allExcluded = allJoinedExcluded(state);
  const isWrongResult = state.phase === "result" && state.lastResult && !state.lastResult.correct;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 px-8 py-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-white/40">Raum {roomCode}</p>
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
          playerName={playerName(state.activePlayerSlot)}
          phase="answering"
          timer={state.timer}
        />
      )}

      {state.phase === "result" && state.lastResult && (
        <ActivePlayerBanner
          playerSlot={state.lastResult.playerSlot}
          playerName={playerName(state.lastResult.playerSlot)}
          phase="result"
        />
      )}

      {state.phase === "result" && state.lastResult?.voiceAnswer && (
        <div className="mb-6 text-center">
          <p
            className={cn(
              "text-5xl font-black",
              state.lastResult.correct ? "text-green-400" : "text-red-400",
            )}
          >
            {state.lastResult.correct
              ? state.lastResult.voiceAnswer.matched
              : state.lastResult.voiceAnswer.matched ??
                state.lastResult.voiceAnswer.transcript ||
                "—"}
          </p>
          {state.lastResult.voiceAnswer.transcript &&
            state.lastResult.voiceAnswer.matched !== state.lastResult.voiceAnswer.transcript && (
            <p className="mt-2 text-lg text-white/50">
              Gehört: „{state.lastResult.voiceAnswer.transcript}"
            </p>
          )}
        </div>
      )}

      {state.phase === "answering" && state.answerMode === "voice" && (
        <p className="mb-4 text-center text-2xl text-violet-300">Antwort per Sprache …</p>
      )}

      <div className="flex flex-1 flex-col items-center justify-center gap-10 py-8">
        {state.question && (
          <QuestionDisplay question={state.question} phase={state.phase} countdown={state.timer} />
        )}
        {state.question &&
          state.answerMode === "tiles" &&
          (state.phase === "answering" || state.phase === "result") && (
          <TileGrid
            question={state.question}
            selectedIndex={state.selectedTileIndex}
            revealCorrect={state.phase === "result" && (state.lastResult?.correct === true || allExcluded)}
            showWrongSelection={isWrongResult === true}
          />
        )}
      </div>

      {isWrongResult && allExcluded && state.question && (
        <p className="text-center text-2xl text-white/70">
          Richtige Antwort:{" "}
          <span className="font-bold text-green-400">
            {getCorrectAnswerLabel(state.question)}
          </span>
        </p>
      )}
    </div>
  );
}
