"use client";

import { useState, useEffect } from "react";
import { PLAYER_COLORS, QUESTION_TYPE_LABELS } from "@/lib/game/types";
import { AnswerTouchpad } from "@/components/game/answer-touchpad";
import { AnswerModeSelector } from "@/components/game/answer-mode-selector";
import { VoiceTalkButton } from "@/components/game/voice-talk-button";
import { usePlayerBuzzAudio } from "@/lib/audio/use-game-audio";
import { resumeAudio } from "@/lib/audio/game-sounds";
import { useRoomPlayer } from "@/lib/room/use-room";
import { cn } from "@/lib/utils";

interface PlayerAppProps {
  roomCode: string;
}

export function PlayerApp({ roomCode }: PlayerAppProps) {
  const { player, gameState, error, joining, join, buzz, selectTile, confirmAnswer, startGame, setAnswerMode, voiceAnswer } =
    useRoomPlayer(roomCode);
  const [name, setName] = useState("");
  const [voiceSubmitted, setVoiceSubmitted] = useState(false);

  usePlayerBuzzAudio(gameState, player?.slot ?? -1);

  useEffect(() => {
    if (gameState?.phase !== "answering") {
      setVoiceSubmitted(false);
    }
  }, [gameState?.phase, gameState?.activePlayerSlot]);

  if (!player) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 p-6 text-white">
        <h1 className="text-3xl font-bold">Beitreten</h1>
        <p className="text-white/60">Raum {roomCode}</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dein Name"
          maxLength={24}
          className="w-full max-w-sm rounded-xl border border-white/20 bg-white/10 px-4 py-4 text-xl text-center outline-none focus:border-amber-400"
        />
        {error && <p className="text-red-400">{error}</p>}
        <button
          type="button"
          disabled={joining || name.trim().length < 1}
          onClick={() => void join(name)}
          className="w-full max-w-sm rounded-xl bg-amber-500 py-4 text-xl font-bold text-black disabled:opacity-40"
        >
          {joining ? "Beitreten …" : "Spiel beitreten"}
        </button>
      </div>
    );
  }

  const colors = PLAYER_COLORS[player.slot];
  const phase = gameState?.phase ?? "lobby";
  const isActive = gameState?.activePlayerSlot === player.slot;
  const isExcluded = gameState?.excludedSlots.includes(player.slot) ?? false;
  const question = gameState?.question;

  if (phase === "lobby") {
    const joinedCount = gameState?.players.filter((p) => p.joined).length ?? 0;
    const joinedNames = gameState?.players.filter((p) => p.joined).map((p) => p.name) ?? [];

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 p-6 text-white">
        <p className={cn("text-2xl font-bold", colors.text)}>{player.name}</p>
        <p className="text-white/60">Warte, bis alle da sind …</p>
        <AnswerModeSelector
          mode={gameState?.answerMode ?? "tiles"}
          onChange={(mode) => void setAnswerMode(mode)}
        />
        <p className="text-4xl font-black text-amber-400">{joinedCount}/4</p>
        {joinedNames.length > 0 && (
          <ul className="text-center text-white/70">
            {joinedNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
        <button
          type="button"
          disabled={joinedCount < 1}
          onClick={() => {
            resumeAudio();
            void startGame();
          }}
          className="w-full max-w-sm rounded-xl bg-amber-500 py-4 text-xl font-bold text-black disabled:opacity-40"
        >
          Spiel jetzt starten
        </button>
      </div>
    );
  }

  if (phase === "gameover") {
    const winner = gameState?.players[gameState.winnerSlot!];
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 p-6 text-white">
        <p className="text-3xl font-bold">{winner?.name} gewinnt!</p>
        <p className={cn("text-xl", colors.text)}>{player.name}: {gameState?.players[player.slot]?.score} Punkte</p>
      </div>
    );
  }

  if (phase === "countdown") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 p-6 text-white">
        <p className="text-lg text-white/60">{question && QUESTION_TYPE_LABELS[question.type]}</p>
        <p className="text-8xl font-black text-amber-400">{gameState?.timer}</p>
      </div>
    );
  }

  if (phase === "buzzer") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 p-6 text-white">
        <p className={cn("text-xl font-semibold", colors.text)}>{player.name}</p>
        {isExcluded ? (
          <p className="text-center text-white/50">Du hast bereits falsch geantwortet — warte auf die anderen.</p>
        ) : (
          <button
            type="button"
            onClick={() => {
              resumeAudio();
              void buzz();
            }}
            className="flex h-64 w-64 items-center justify-center rounded-full bg-red-600 text-4xl font-black shadow-lg shadow-red-900/50 active:scale-95"
          >
            BUZZ
          </button>
        )}
      </div>
    );
  }

  if (phase === "answering") {
    if (!isActive) {
      const activeName = gameState?.players[gameState.activePlayerSlot!]?.name ?? "…";
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 p-6 text-white">
          <p className="text-2xl font-bold text-white/80">{activeName} ist dran</p>
          <p className="text-white/50">{gameState?.timer}s</p>
        </div>
      );
    }

    if (gameState?.answerMode === "voice") {
      return (
        <div className="flex min-h-screen flex-col bg-slate-950 p-4 text-white">
          <div className="mb-4 text-center">
            <p className={cn("text-2xl font-bold", colors.text)}>{player.name} — du bist dran!</p>
            <p className="text-3xl font-bold tabular-nums text-amber-300">{gameState?.timer}s</p>
          </div>
          <VoiceTalkButton
            disabled={voiceSubmitted}
            accentClass={colors.text}
            onAnswer={(transcript, alternatives) => {
              setVoiceSubmitted(true);
              void voiceAnswer(transcript, alternatives);
            }}
          />
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col bg-slate-950 p-4 text-white">
        <div className="mb-4 text-center">
          <p className={cn("text-2xl font-bold", colors.text)}>{player.name} — du bist dran!</p>
          <p className="text-3xl font-bold tabular-nums text-amber-300">{gameState?.timer}s</p>
        </div>

        {question && (
          <AnswerTouchpad
            question={question}
            selectedIndex={gameState?.selectedTileIndex ?? 4}
            onSelect={(index) => void selectTile(index)}
            onConfirm={() => void confirmAnswer()}
            accentClass={colors.text}
          />
        )}
      </div>
    );
  }

  if (phase === "result") {
    const correct = gameState?.lastResult?.correct;
    const wasMe = gameState?.lastResult?.playerSlot === player.slot;
    const othersCanStillPlay =
      !correct &&
      (gameState?.players.some(
        (p) => p.joined && !gameState.excludedSlots.includes(p.slot),
      ) ?? false);

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 p-6 text-white">
        {wasMe && (
          <p className={cn("text-4xl font-black", correct ? "text-green-400" : "text-red-400")}>
            {correct ? "Richtig!" : "Falsch!"}
          </p>
        )}
        {!wasMe && othersCanStillPlay && (
          <p className="text-center text-white/70">Falsch — gleich kannst du wieder buzzern!</p>
        )}
        {!wasMe && !othersCanStillPlay && !correct && (
          <p className="text-white/60">Niemand hat&apos;s gewusst …</p>
        )}
        {!wasMe && correct && <p className="text-white/60">Nächste Runde …</p>}
        <p className={cn("text-xl", colors.text)}>{player.name}: {gameState?.players[player.slot]?.score} Punkte</p>
      </div>
    );
  }

  return null;
}
