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
  const { listening, supported, start, stop } = useSpeechRecognition();
  const holdingRef = useRef(false);
  const [hint, setHint] = useState<string | null>(null);

  if (!supported) {
    return (
      <p className="max-w-sm text-center text-red-400">
        Spracherkennung wird in diesem Browser nicht unterstützt. Bitte Chrome auf Android verwenden.
      </p>
    );
  }

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (disabled || holdingRef.current) return;

    holdingRef.current = true;
    setHint(null);
    start();
  }

  function handlePointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!holdingRef.current) return;

    stop(({ transcript, alternatives }) => {
      holdingRef.current = false;

      if (!transcript.trim()) {
        setHint("Nicht verstanden — TALK gedrückt halten und antworten.");
        return;
      }

      onAnswer(transcript, alternatives);
    });
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-center text-white/60">
        {listening ? "Sprich jetzt …" : "Gedrückt halten und antworten"}
      </p>
      <button
        type="button"
        disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          "flex h-64 w-64 touch-none select-none items-center justify-center rounded-full text-4xl font-black shadow-lg active:scale-95 disabled:opacity-40",
          listening
            ? "animate-pulse bg-blue-500 shadow-blue-900/50"
            : "bg-violet-600 shadow-violet-900/50",
        )}
      >
        TALK
      </button>
      {accentClass && listening && (
        <p className={cn("text-lg font-semibold", accentClass)}>Mikrofon aktiv</p>
      )}
      {hint && <p className="max-w-xs text-center text-amber-300">{hint}</p>}
    </div>
  );
}
