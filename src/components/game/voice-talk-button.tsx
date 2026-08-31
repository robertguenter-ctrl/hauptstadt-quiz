"use client";

import { useRef, useState } from "react";
import { useSpeechRecognition } from "@/lib/audio/use-speech-recognition";
import { cn } from "@/lib/utils";

interface VoiceTalkButtonProps {
  disabled?: boolean;
  onAnswer: (transcript: string, alternatives: string[]) => void;
  accentClass?: string;
}

export function VoiceTalkButton({ disabled = false, onAnswer, accentClass }: VoiceTalkButtonProps) {
  const { listening, liveTranscript, supported, start, stop } = useSpeechRecognition();
  const activePointerRef = useRef<number | null>(null);
  const startingRef = useRef(false);
  const pendingStopRef = useRef(false);
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

  async function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (disabled || activePointerRef.current !== null) return;

    activePointerRef.current = event.pointerId;
    pendingStopRef.current = false;
    startingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setHint(null);

    const started = await start();
    startingRef.current = false;

    if (activePointerRef.current !== event.pointerId) {
      return;
    }

    if (!started) {
      activePointerRef.current = null;
      setHint("Mikrofon-Zugriff verweigert oder nicht verfügbar.");
      return;
    }

    if (pendingStopRef.current) {
      pendingStopRef.current = false;
      activePointerRef.current = null;
      stop((result) => submitOrRetry(result.transcript, result.alternatives));
    }
  }

  function finishListening(event: React.PointerEvent<HTMLButtonElement>) {
    if (activePointerRef.current !== event.pointerId) return;

    event.preventDefault();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    activePointerRef.current = null;

    if (startingRef.current) {
      pendingStopRef.current = true;
      return;
    }

    stop((result) => submitOrRetry(result.transcript, result.alternatives));
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-center text-white/60">
        {listening ? "Sprich jetzt …" : "Gedrückt halten und antworten"}
      </p>
      {liveTranscript && (
        <p className={cn("max-w-xs text-center text-2xl font-bold", accentClass ?? "text-white")}>
          „{liveTranscript}"
        </p>
      )}
      <button
        type="button"
        disabled={disabled}
        onPointerDown={(e) => void handlePointerDown(e)}
        onPointerUp={finishListening}
        onPointerCancel={finishListening}
        className={cn(
          "flex h-64 w-64 touch-none select-none items-center justify-center rounded-full text-4xl font-black shadow-lg active:scale-95 disabled:opacity-40",
          listening
            ? "animate-pulse bg-blue-500 shadow-blue-900/50"
            : "bg-violet-600 shadow-violet-900/50",
        )}
      >
        TALK
      </button>
      {accentClass && listening && !liveTranscript && (
        <p className={cn("text-lg font-semibold", accentClass)}>Mikrofon aktiv</p>
      )}
      {hint && <p className="max-w-xs text-center text-amber-300">{hint}</p>}
    </div>
  );
}
