"use client";

import { useRef, useState } from "react";
import { useSpeechRecognition } from "@/lib/audio/use-speech-recognition";
import { playTalkStartPing, resumeAudio } from "@/lib/audio/game-sounds";
import { cn } from "@/lib/utils";

interface VoiceTalkButtonProps {
  disabled?: boolean;
  onAnswer: (transcript: string, alternatives: string[]) => void;
  accentClass?: string;
}

export function VoiceTalkButton({ disabled = false, onAnswer, accentClass }: VoiceTalkButtonProps) {
  const { listening, liveTranscript, micHint, supported, start, stop } = useSpeechRecognition();
  const activePointerRef = useRef<number | null>(null);
  const startingRef = useRef(false);
  const pendingStopRef = useRef(false);
  const [pressed, setPressed] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  function submitOrRetry(transcript: string, alternatives: string[]) {
    if (!transcript.trim()) {
      setHint("Nicht verstanden — TALK gedrückt halten, deutlich sprechen, loslassen.");
      return;
    }
    onAnswer(transcript, alternatives);
  }

  if (!supported) {
    return (
      <p className="max-w-sm text-center text-red-400">
        Spracherkennung wird in diesem Browser nicht unterstützt. Bitte Chrome auf Android verwenden.
      </p>
    );
  }

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (disabled || activePointerRef.current !== null) return;

    activePointerRef.current = event.pointerId;
    pendingStopRef.current = false;
    startingRef.current = true;
    setPressed(true);
    resumeAudio();
    playTalkStartPing();
    event.currentTarget.setPointerCapture(event.pointerId);
    setHint(null);

    const result = start();
    startingRef.current = false;

    if (activePointerRef.current !== event.pointerId) {
      return;
    }

    if (!result.ok) {
      activePointerRef.current = null;
      setPressed(false);
      if (result.error === "not-allowed") {
        setHint("Mikrofon blockiert — in Chrome: ⋮ → Einstellungen → Website-Einstellungen → Mikrofon erlauben.");
      } else if (result.error === "unsupported") {
        setHint("Spracherkennung wird in diesem Browser nicht unterstützt.");
      } else {
        setHint("Spracherkennung konnte nicht starten — Seite neu laden und nochmal versuchen.");
      }
      return;
    }

    if (pendingStopRef.current) {
      pendingStopRef.current = false;
      activePointerRef.current = null;
      setPressed(false);
      stop((speechResult) => submitOrRetry(speechResult.transcript, speechResult.alternatives));
    }
  }

  function finishListening(event: React.PointerEvent<HTMLButtonElement>) {
    if (activePointerRef.current !== event.pointerId) return;

    event.preventDefault();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    activePointerRef.current = null;
    setPressed(false);

    if (startingRef.current) {
      pendingStopRef.current = true;
      return;
    }

    stop((result) => submitOrRetry(result.transcript, result.alternatives));
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-center text-white/60">
        {pressed || listening ? "Sprich jetzt …" : "Gedrückt halten und antworten"}
      </p>
      {liveTranscript && (
        <p className={cn("max-w-xs text-center text-2xl font-bold", accentClass ?? "text-white")}>
          „{liveTranscript}"
        </p>
      )}
      <button
        type="button"
        disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerUp={finishListening}
        onPointerCancel={finishListening}
        className={cn(
          "flex h-64 w-64 touch-none select-none items-center justify-center rounded-full text-4xl font-black shadow-lg active:scale-95 disabled:opacity-40",
          pressed || listening
            ? "animate-pulse bg-red-600 shadow-red-900/50 ring-4 ring-red-400/60"
            : "bg-green-600 shadow-green-900/50 ring-4 ring-green-400/40",
        )}
      >
        TALK
      </button>
      {(pressed || listening) && !liveTranscript && (
        <p className={cn("text-lg font-semibold", accentClass ?? "text-red-400")}>Mikrofon aktiv</p>
      )}
      {hint && <p className="max-w-xs text-center text-amber-300">{hint}</p>}
      {micHint && !hint && <p className="max-w-xs text-center text-amber-300">{micHint}</p>}
    </div>
  );
}
